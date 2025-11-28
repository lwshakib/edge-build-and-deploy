import express from "express";
import passport, {PASSPORT_FAILURE_REDIRECT, PASSPORT_SUCCESS_REDIRECT} from "../passport";

const authRouter = express.Router();





// Oauth Implementation
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
    successRedirect: PASSPORT_SUCCESS_REDIRECT,
  })
);


authRouter.get("/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] })
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
    successRedirect: PASSPORT_SUCCESS_REDIRECT,
  })
);

export default authRouter;