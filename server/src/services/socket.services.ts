import { Server, Socket } from "socket.io";
import { produceMessage, produceUserPresence } from "./kafka.services";
import { auth } from "./auth.services";
import { fromNodeHeaders } from "better-auth/node";
import { eventBus, EVENTS } from "./eventBus";

class SocketService {
  private _io: Server;
  constructor() {
    this._io = new Server({
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
      },
    });

    // Add authentication middleware
    this._io.use(async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(socket.handshake.headers),
        });

        if (!session) {
          return next(new Error("Unauthorized"));
        }

        socket.data.user = session.user;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    // Handle logs from eventBus
    eventBus.on(EVENTS.LOG_RECEIVED, ({ deploymentId, log }) => {
      console.log("Broadcasting log to room:", deploymentId);
      this._io.to(deploymentId).emit("log", log);
    });
  }

  initListeners() {
    const io = this.io;
    io.on("connection", (socket: Socket) => {
      const user = socket.data.user;
      const userId = user.id;

      console.log("A user connected:", { socketId: socket.id, userId });

      // Join personal room
      socket.join(userId);

      // Handle presence update on connection
      const handleConnectionPresence = async () => {
        try {
          const ts = new Date().toISOString();
          await produceUserPresence({
            userId,
            isOnline: true,
            lastOnlineAt: ts,
          });
          io.emit("presence:update", {
            userId,
            isOnline: true,
            lastOnlineAt: ts,
          });
        } catch (e) {
          console.error("Failed to produce presence (join)", e);
        }
      };
      handleConnectionPresence();

      socket.on("event:message", async (data: any) => {
        const users = data.conversation?.users;

        if (users && users.length > 0) {
          users.forEach((user: any) => {
            console.log("Sending message to user : ", user.id);
            io.to(user.id).emit("message", {
              message: data.message,
              conversation: data.conversation,
            });
          });
        }
        await produceMessage(JSON.stringify({ message: data.message }));
      });

      socket.on("join:server", (userId: string) => {
        console.log("User joined server in socket: ", userId);
        socket.join(userId);
      });

      socket.on("subscribe:logs", (deploymentId: string) => {
        console.log("User joined logs room: ", deploymentId);
        socket.join(deploymentId);
      });

      socket.on("delete:conversation", (payload: any) => {
        try {
          const { conversationId, memberIds } = payload || {};
          if (!conversationId || !Array.isArray(memberIds)) return;
          io.to(memberIds).emit("delete:conversation", { conversationId });
        } catch (error) {
          console.error("Error in delete:conversation:", error);
        }
      });

      // Typing indicators
      socket.on("typing:start", (payload: any) => {
        try {
          const { conversationId, fromUserId, toUserIds } = payload || {};
          if (!conversationId || !fromUserId || !Array.isArray(toUserIds))
            return;
          io.to(toUserIds).emit("typing:start", {
            conversationId,
            fromUserId,
          });
        } catch (error) {
          console.error("Error in typing:start:", error);
        }
      });
      socket.on("typing:stop", (payload: any) => {
        try {
          const { conversationId, fromUserId, toUserIds } = payload || {};
          if (!conversationId || !fromUserId || !Array.isArray(toUserIds))
            return;
          io.to(toUserIds).emit("typing:stop", {
            conversationId,
            fromUserId,
          });
        } catch (error) {
          console.error("Error in typing:stop:", error);
        }
      });

      // --- Call Events ---
      socket.on("call:start", (payload: any) => {
        const { conversationId, type, participants, callerId } = payload;
        // Notify all participants except the caller
        const targets = participants.filter(
          (id: string) => id !== socket.data.user.id
        );
        io.to(targets).emit("call:invite", {
          conversationId,
          type,
          participants,
          callerId,
        });
      });

      socket.on("call:accept", (payload: any) => {
        const { conversationId, callerId, calleeId } = payload;
        io.to(callerId).emit("call:accepted", { conversationId, calleeId });
      });

      socket.on("call:reject", (payload: any) => {
        const { conversationId, callerId, calleeId } = payload;
        io.to(callerId).emit("call:rejected", { conversationId, calleeId });
      });

      socket.on("call:hangup", (payload: any) => {
        const { conversationId, participants, isGroup } = payload;
        if (isGroup) {
          // Just notify others that this specific user left
          const targets = participants.filter(
            (id: string) => id !== socket.data.user.id
          );
          io.to(targets).emit("call:participant-left", {
            conversationId,
            userId: socket.data.user.id,
          });
        } else {
          // For 1:1, end the call for everyone
          io.to(participants).emit("call:ended", { conversationId });
        }
      });

      socket.on("call:signal", (payload: any) => {
        const { conversationId, signal, toUserId, fromUserId } = payload;
        io.to(toUserId).emit("call:signal", {
          conversationId,
          signal,
          fromUserId,
        });
      });

      socket.on("disconnect", async () => {
        console.log("A user disconnected", { socketId: socket.id, userId });
        try {
          const ts = new Date().toISOString();
          await produceUserPresence({
            userId,
            isOnline: false,
            lastOnlineAt: ts,
          });
          io.emit("presence:update", {
            userId,
            isOnline: false,
            lastOnlineAt: ts,
          });
        } catch (e) {
          console.error("Failed to produce presence (disconnect)", e);
        }
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
