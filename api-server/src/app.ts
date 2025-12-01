import express from "express";
import { verifyJWT } from "./middlewares/auth.middlewares";
import cors from "cors";
import session from "express-session";
import passport, {
  PASSPORT_FAILURE_REDIRECT,
  PASSPORT_SUCCESS_REDIRECT,
} from "./passport";
import { Server as SocketIOServer } from "socket.io";
import { SESSION_SECRET } from "./config/envs";
import { API_PREFIX } from "./constants";
import routes from "./routes";
import { createServer, Server } from "http";
const app = express();

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    credentials: true,
  },
});


app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());




app.use(API_PREFIX, routes);



export default app;
