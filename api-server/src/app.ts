import express from "express";
import { verifyJWT } from "./middlewares/auth.middlewares";
import cors from "cors";
import session from "express-session";
import passport, {
  PASSPORT_FAILURE_REDIRECT,
  PASSPORT_SUCCESS_REDIRECT,
} from "./passport";
import { SESSION_SECRET } from "./config/envs";
import { API_PREFIX } from "./constants";
import routes from "./routes";

const app = express();

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
