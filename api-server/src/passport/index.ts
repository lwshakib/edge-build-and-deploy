import { eq } from "drizzle-orm";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import {
  AUTH_FAILURE_REDIRECT,
  AUTH_SUCCESS_REDIRECT,
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../config/envs";
import { db } from "../db";
import { users } from "../db/schema";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    done(null, user || null);
  } catch (error) {
    done(error as Error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "User";
        const image = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email not provided by Google"));
        }

        // Check if user exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser) {
          // Update existing user
          const [updatedUser] = await db
            .update(users)
            .set({
              name,
              image,
              provider: "GOOGLE",
              verified: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .returning();

          return done(null, updatedUser);
        } else {
          // Create new user
          const newUsers = (await db
            .insert(users)
            .values({
              email,
              name,
              image,
              provider: "GOOGLE",
              verified: true,
            })
            .returning()) as any;

          const newUser = newUsers[0];

          return done(null, newUser);
        }
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email", "repo"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        const email = profile.emails?.[0]?.value || profile._json?.email;
        const name =
          profile.displayName ||
          profile.username ||
          profile._json?.name ||
          "User";
        const image =
          profile.photos?.[0]?.value || profile._json?.avatar_url || null;

        if (!email) {
          return done(new Error("Email not provided by GitHub"));
        }

        // Check if user exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser) {
          // Update existing user
          const [updatedUser] = await db
            .update(users)
            .set({
              name,
              image,
              provider: "GITHUB",
              verified: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .returning();

          return done(null, updatedUser);
        } else {
          // Create new user
          const newUsers = (await db
            .insert(users)
            .values({
              email,
              name,
              image,
              provider: "GITHUB",
              verified: true,
            })
            .returning()) as any;

          const newUser = newUsers[0];

          return done(null, newUser);
        }
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export const PASSPORT_SUCCESS_REDIRECT = AUTH_SUCCESS_REDIRECT;
export const PASSPORT_FAILURE_REDIRECT = AUTH_FAILURE_REDIRECT;

export default passport;
