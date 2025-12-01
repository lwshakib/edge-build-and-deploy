import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";

const githubRouter = express.Router();

// Get the authenticated user's GitHub repositories
githubRouter.get("/repos", verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Missing access token" });
    }

    // Optionally, enforce that this user is connected via GitHub
    const user: any = (req as any).user;
    if (!user || user.provider !== "GITHUB") {
      return res
        .status(403)
        .json({ message: "GitHub account is not connected for this user" });
    }

    const githubResponse = await fetch(
      "https://api.github.com/user/repos?per_page=50&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!githubResponse.ok) {
      const errorBody = await githubResponse.text();
      console.error(
        "GitHub /user/repos error:",
        githubResponse.status,
        errorBody
      );
      return res
        .status(502)
        .json({ message: "Failed to fetch repositories from GitHub" });
    }

    const repos = await githubResponse.json();

    const normalized = (repos as any[]).map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login,
      description: repo.description,
      private: repo.private,
      updatedAt: repo.updated_at,
    }));

    return res.json({ repos: normalized });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return res
      .status(500)
      .json({ message: "Error while fetching GitHub repositories" });
  }
});

// Get framework preset + default root directory for a specific repository
githubRouter.get(
  "/repos/:owner/:repo/framework",
  verifyToken,
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.split(" ")[1];

      if (!accessToken) {
        return res.status(401).json({ message: "Missing access token" });
      }

      const { owner, repo } = req.params;
      let path = (req.query.path as string | undefined) ?? "";

      // Normalize "./" to empty string (root directory)
      if (path === "./") {
        path = "";
      }

      if (!owner || !repo) {
        return res
          .status(400)
          .json({ message: "Both owner and repo parameters are required" });
      }

      const baseUrl = `https://api.github.com/repos/${encodeURIComponent(
        owner
      )}/${encodeURIComponent(repo)}`;

      const fetchJson = async (resourcePath: string) => {
        const url = `${baseUrl}/${resourcePath}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          const body = await response.text();
          console.error("GitHub API error:", response.status, body);
          throw new Error("Failed to inspect repository contents");
        }

        return response.json();
      };

      // Try to read package.json in the selected root (or repo root if none)
      const normalizedPath =
        path && path.length > 0
          ? `contents/${path}/package.json`
          : "contents/package.json";

      const pkgJson = (await fetchJson(normalizedPath)) as {
        content?: string;
      } | null;

      // Also fetch directory contents for structural heuristics
      const contentsPathForRoot =
        path && path.length > 0 ? `contents/${path}` : "contents";

      const dirContents = (await fetchJson(contentsPathForRoot)) as
        | { name: string; type: string }[]
        | null;

      let frameworkPreset: "nextjs" | "react" | "vite" | "static" | "unknown" =
        "unknown";

      if (
        pkgJson &&
        "content" in pkgJson &&
        typeof pkgJson.content === "string"
      ) {
        try {
          const decoded = Buffer.from(pkgJson.content, "base64").toString(
            "utf8"
          );
          const pkg = JSON.parse(decoded) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
            scripts?: Record<string, string>;
          };

          const deps = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
          };

          if (deps.next) {
            frameworkPreset = "nextjs";
          } else if (deps.vite) {
            frameworkPreset = "vite";
          } else if (deps.react || deps["react-dom"]) {
            frameworkPreset = "react";
          } else {
            frameworkPreset = "static";
          }
        } catch (error) {
          console.error(
            "Failed to parse package.json for framework detection:",
            error
          );
        }
      } else {
        // No package.json at this root – fall back to structural detection below
        frameworkPreset = "unknown";
      }

      // If we still don't have a strong signal from dependencies,
      // infer framework from the files & folders in this directory.
      if (dirContents && Array.isArray(dirContents)) {
        const hasDir = (name: string) =>
          dirContents.some((item) => item.type === "dir" && item.name === name);

        const hasFile = (name: string) =>
          dirContents.some(
            (item: any) => item.type === "file" && item.name === name
          );

        const hasAnyFile = (names: string[]) => names.some((n) => hasFile(n));

        // Only override if we didn't clearly detect from dependencies,
        // or if we only had "static" as a fallback.
        const shouldOverride =
          frameworkPreset === "unknown" || frameworkPreset === "static";

        if (shouldOverride) {
          // Next.js heuristics: next.config.* or app/pages directories
          if (
            hasAnyFile([
              "next.config.js",
              "next.config.mjs",
              "next.config.cjs",
              "next.config.ts",
            ]) ||
            hasDir("app") ||
            hasDir("pages")
          ) {
            frameworkPreset = "nextjs";
          }
          // Vite heuristics: vite.config.* files
          else if (
            hasAnyFile([
              "vite.config.js",
              "vite.config.mjs",
              "vite.config.cjs",
              "vite.config.ts",
              "vite.config.mts",
            ])
          ) {
            frameworkPreset = "vite";
          }
          // Basic static site: index.html present
          else if (hasFile("index.html")) {
            frameworkPreset = "static";
          } else if (frameworkPreset === "unknown") {
            // Fall back to static if we truly can't tell
            frameworkPreset = "static";
          }
        }
      } else if (frameworkPreset === "unknown") {
        // No directory listing available; default to static
        frameworkPreset = "static";
      }

      // Basic heuristic for default root directory
      // For monorepos, we can look for common app folders.
      let rootDirectory = path || "";

      if (!rootDirectory) {
        const rootContents = (await fetchJson("contents")) as
          | { name: string; type: string }[]
          | null;

        if (rootContents && Array.isArray(rootContents)) {
          const hasApps = rootContents.some(
            (item) => item.type === "dir" && item.name === "apps"
          );

          if (hasApps) {
            // default to apps/web for now if apps/ exists (monorepo structure).
            rootDirectory = "apps/web";
          } else {
            // For standard projects (including Next.js with 'app' dir), use root
            rootDirectory = "";
          }
        }
      }

      return res.json({
        frameworkPreset,
        rootDirectory: rootDirectory || "./",
      });
    } catch (error) {
      console.error("Error inspecting GitHub repo for framework:", error);
      return res.status(500).json({
        message:
          "Error while inspecting GitHub repository for framework preset",
      });
    }
  }
);

// List directories for a given repo and optional path
githubRouter.get("/repos/:owner/:repo/dirs", verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Missing access token" });
    }

    const { owner, repo } = req.params;
    let path = (req.query.path as string | undefined) ?? "";

    // Normalize "./" to empty string (root directory)
    if (path === "./") {
      path = "";
    }

    if (!owner || !repo) {
      return res
        .status(400)
        .json({ message: "Both owner and repo parameters are required" });
    }

    const baseUrl = `https://api.github.com/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}`;

    const contentsPath =
      path && path.length > 0 ? `contents/${path}` : "contents";

    const response = await fetch(`${baseUrl}/${contentsPath}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 404) {
      return res.json({ path, directories: [] });
    }

    if (!response.ok) {
      const body = await response.text();
      console.error("GitHub API error (dirs):", response.status, body);
      return res
        .status(502)
        .json({ message: "Failed to load repository directories" });
    }

    const data = (await response.json()) as
      | { name: string; path: string; type: string }[];

    const directories = (Array.isArray(data) ? data : [])
      .filter((item) => item.type === "dir")
      .map((dir) => ({
        name: dir.name,
        path: dir.path,
      }));

    return res.json({ path, directories });
  } catch (error) {
    console.error("Error listing GitHub repo directories:", error);
    return res.status(500).json({
      message: "Error while listing GitHub repository directories",
    });
  }
});

export default githubRouter;
