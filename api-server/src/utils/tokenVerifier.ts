import { GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from "../config/envs";

interface GoogleTokenInfo {
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
}

interface GitHubUserInfo {
  login: string;
  id: number;
  email: string;
  name: string;
}

/**
 * Verify Google OAuth access token
 */
export async function verifyGoogleToken(
  accessToken: string
): Promise<GoogleTokenInfo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      return null;
    }

    const tokenInfo = await response.json();

    // Verify the token is for our client
    if (tokenInfo.audience !== GOOGLE_CLIENT_ID) {
      return null;
    }

    return tokenInfo as GoogleTokenInfo;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return null;
  }
}

/**
 * Verify GitHub OAuth access token
 */
export async function verifyGitHubToken(
  accessToken: string
): Promise<(GitHubUserInfo & { email?: string }) | null> {
  try {
    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      return null;
    }

    const userInfo = (await userResponse.json()) as GitHubUserInfo;

    // Get user emails (if email is not public)
    let email = userInfo.email;
    if (!email) {
      try {
        const emailsResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
          email = primaryEmail?.email;
        }
      } catch (error) {
        console.error("Error fetching GitHub emails:", error);
      }
    }

    return { ...userInfo, email };
  } catch (error) {
    console.error("Error verifying GitHub token:", error);
    return null;
  }
}

/**
 * Verify OAuth access token (auto-detects provider based on token format or tries both)
 */
export async function verifyOAuthToken(
  accessToken: string,
  provider?: "GOOGLE" | "GITHUB"
): Promise<{ provider: "GOOGLE" | "GITHUB"; userInfo: any } | null> {
  // If provider is specified, verify with that provider only
  if (provider === "GOOGLE") {
    const tokenInfo = await verifyGoogleToken(accessToken);
    if (tokenInfo) {
      return { provider: "GOOGLE", userInfo: tokenInfo };
    }
    return null;
  }

  if (provider === "GITHUB") {
    const userInfo = await verifyGitHubToken(accessToken);
    if (userInfo) {
      return { provider: "GITHUB", userInfo };
    }
    return null;
  }

  // Try both providers if not specified
  const [googleResult, githubResult] = await Promise.all([
    verifyGoogleToken(accessToken),
    verifyGitHubToken(accessToken),
  ]);

  if (googleResult) {
    return { provider: "GOOGLE", userInfo: googleResult };
  }

  if (githubResult) {
    return { provider: "GITHUB", userInfo: githubResult };
  }

  return null;
}
