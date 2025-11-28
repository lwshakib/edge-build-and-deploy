import express from "express";
import { verifyJWT } from "./middlewares/auth.middlewares";
import cors from "cors";
import session from "express-session";
import passport, {
  PASSPORT_FAILURE_REDIRECT,
  PASSPORT_SUCCESS_REDIRECT,
} from "./passport";
import { SESSION_SECRET } from "./constants";

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

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
    successRedirect: PASSPORT_SUCCESS_REDIRECT,
  })
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
    successRedirect: PASSPORT_SUCCESS_REDIRECT,
  })
);

app.use("/api", verifyJWT);

app.get("/api/auth/me", (req, res) => {
  res.json({ message: "Hello World" });
});

export default app;
