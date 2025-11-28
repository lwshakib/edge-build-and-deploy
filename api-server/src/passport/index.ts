
import passport from "passport";
import {
  Strategy as GitHubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import {
  Profile as GoogleProfile,
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";

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






passport.serializeUser((user, done) => {
//   done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
        // do something
   
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

        // do something
  
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
      scope: ["user:email"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
     // do something
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export const PASSPORT_SUCCESS_REDIRECT = AUTH_SUCCESS_REDIRECT;
export const PASSPORT_FAILURE_REDIRECT = AUTH_FAILURE_REDIRECT;

export default passport;
