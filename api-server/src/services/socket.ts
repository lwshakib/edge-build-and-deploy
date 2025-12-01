import { Server, Socket } from "socket.io";
import cookie from "cookie";
import { verifyJWT } from "../utils/jwt";
import { verifyOAuthToken } from "../utils/tokenVerifier";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type DBUser = InferSelectModel<typeof users>;

interface AuthedSocket extends Socket {
  user?: DBUser;
}

class SocketService {
  private _io: Server;

  constructor() {
    this._io = new Server({
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
      },
    });

    // Authenticate socket connections before they are established
    this._io.use(async (socket: AuthedSocket, next) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
        let token = cookies?.accessToken as string | undefined;

        // Fallback: token provided via handshake auth or Authorization header
        if (!token && typeof socket.handshake.auth?.token === "string") {
          token = socket.handshake.auth.token;
        }

        if (
          !token &&
          typeof socket.handshake.headers?.authorization === "string"
        ) {
          const authHeader = socket.handshake.headers.authorization;
          const [, bearerToken] = authHeader.split(" ");
          token = bearerToken;
        }

        if (!token) {
          return next(new Error("Unauthorized handshake: token is missing"));
        }

        let user: DBUser | null = null;

        // 1) Try JWT token (same behaviour as HTTP verifyToken)
        const jwtPayload = verifyJWT(token);
        if (jwtPayload) {
          const [jwtUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, jwtPayload.userId))
            .limit(1);

          if (jwtUser) {
            user = jwtUser;
          }
        }

        // 2) Fallback to OAuth token if JWT failed or user not found
        if (!user) {
          const providerHeader =
            socket.handshake.headers["x-auth-provider"] ??
            socket.handshake.headers["X-Auth-Provider"];

          const provider = providerHeader as "GOOGLE" | "GITHUB" | undefined;

          const oauthResult = await verifyOAuthToken(token, provider);

          if (!oauthResult) {
            return next(
              new Error("Unauthorized handshake: token verification failed")
            );
          }

          const email = oauthResult.userInfo?.email;
          if (!email) {
            return next(
              new Error("Unauthorized handshake: email not found in token")
            );
          }

          const [oauthUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!oauthUser) {
            return next(
              new Error("Unauthorized handshake: user not found for email")
            );
          }

          user = oauthUser;
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error("Socket auth error:", error);
        next(new Error("Unauthorized handshake"));
      }
    });
  }

  initListeners() {
    const io = this.io;

    io.on("connection", (socket: AuthedSocket) => {
      const user = socket.user;

      if (user) {
        // Join a personal room for the user (by user ID)
        socket.join(user.id);
      }

      console.log("A user connected with socket id:", socket.id);

      socket.on("join:project", (projectId: string) => {
        console.log("User joined project:", projectId);
        socket.join(projectId);
      });

      socket.on("send:logs", (projectId: string, logs: any) => {
        console.log("Logs received for project:", projectId);
        io.to(projectId).emit("send:logs", logs);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected with socket id:", socket.id);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
