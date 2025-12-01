import express from "express";
import passport, {
  PASSPORT_FAILURE_REDIRECT,
  PASSPORT_SUCCESS_REDIRECT,
} from "../passport";
import { verifyOAuthToken } from "../utils/tokenVerifier";
import { verifyJWT as verifyJWTHelper } from "../utils/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const authRouter = express.Router();

// Oauth Implementation
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
  }),
  (req, res) => {
    console.log("req.user", req.user);
    const user = req.user as any;
    const accessToken = user?.accessToken;

    if (accessToken) {
      try {
        const redirectUrl = new URL(PASSPORT_SUCCESS_REDIRECT);
        redirectUrl.searchParams.set("accessToken", accessToken);
        console.log("redirectUrl", redirectUrl.toString());
        return res.redirect(redirectUrl.toString());
      } catch {
        // If PASSPORT_SUCCESS_REDIRECT is a relative URL, append query param manually
        const separator = PASSPORT_SUCCESS_REDIRECT.includes("?") ? "&" : "?";
        return res.redirect(
          `${PASSPORT_SUCCESS_REDIRECT}${separator}accessToken=${encodeURIComponent(
            accessToken
          )}`
        );
      }
    }

    return res.redirect(PASSPORT_SUCCESS_REDIRECT);
  }
);

authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] })
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: PASSPORT_FAILURE_REDIRECT,
  }),
  (req, res) => {
    const user = req.user as any;
    const accessToken = user?.accessToken;

    if (accessToken) {
      try {
        const redirectUrl = new URL(PASSPORT_SUCCESS_REDIRECT);
        redirectUrl.searchParams.set("accessToken", accessToken);
        return res.redirect(redirectUrl.toString());
      } catch {
        // If PASSPORT_SUCCESS_REDIRECT is a relative URL, append query param manually
        const separator = PASSPORT_SUCCESS_REDIRECT.includes("?") ? "&" : "?";
        return res.redirect(
          `${PASSPORT_SUCCESS_REDIRECT}${separator}accessToken=${encodeURIComponent(
            accessToken
          )}`
        );
      }
    }

    return res.redirect(PASSPORT_SUCCESS_REDIRECT);
  }
);

// Token validation route
authRouter.get("/verify", async (req, res) => {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token as string | undefined;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }

    if (!token) {
      return res.status(400).json({
        valid: false,
        message:
          "Token not provided. Send token in Authorization header (Bearer <token>) or as query parameter (?token=<token>)",
      });
    }

    // Try JWT first
    const jwtPayload = verifyJWTHelper(token);
    if (jwtPayload) {
      // Find user in database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, jwtPayload.userId))
        .limit(1);

      if (user) {
        return res.json({
          valid: true,
          type: "JWT",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            slug: user.slug,
            provider: user.provider,
            image: user.image,
            verified: user.verified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      } else {
        return res.status(401).json({
          valid: false,
          type: "JWT",
          message: "Token is valid but user not found in database",
        });
      }
    }

    // Try OAuth token
    const provider = req.headers["x-auth-provider"] as
      | "GOOGLE"
      | "GITHUB"
      | undefined;

    const oauthResult = await verifyOAuthToken(token, provider);

    if (oauthResult) {
      // Find user in database by email
      const email = oauthResult.userInfo.email;
      if (!email) {
        return res.status(401).json({
          valid: false,
          type: oauthResult.provider,
          message: "Token is valid but email not found in token",
        });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user) {
        return res.json({
          valid: true,
          type: oauthResult.provider,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            slug: user.slug,
            provider: user.provider,
            image: user.image,
            verified: user.verified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      } else {
        return res.status(401).json({
          valid: false,
          type: oauthResult.provider,
          message: "Token is valid but user not found in database",
        });
      }
    }

    // Token is invalid
    return res.status(401).json({
      valid: false,
      message: "Invalid or expired token",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({
      valid: false,
      message: "Error verifying token",
    });
  }
});

export default authRouter;
