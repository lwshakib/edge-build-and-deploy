import express, { type Request, type Response } from "express";
import path from "path";
import fs from "fs-extra";

const BUCKET_PATH = path.join(__dirname, "..", "bucket");

if (!fs.existsSync(BUCKET_PATH)) {
  fs.mkdirSync(BUCKET_PATH);
}

const app = express();
const PORT = 8000 as const;

// Main reverse-proxy middleware
app.use(async (req: Request, res: Response) => {
  const hostname: string = req.hostname;
  const subdomain: string = hostname.split(".")[0] ?? "";

  const projectPath = path.join(BUCKET_PATH, "__outputs", subdomain);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).send("Project Not Found");
  }

  // Find the latest deployment directory
  const deployments = fs.readdirSync(projectPath).filter((d) => {
    return fs.statSync(path.join(projectPath, d)).isDirectory();
  });

  if (deployments.length === 0) {
    return res.status(404).send("No Deployments Found");
  }

  // Sort by creation time to get the latest
  const sortedDeployments = deployments
    .map((d) => ({
      name: d,
      time: fs.statSync(path.join(projectPath, d)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  const latestDeployment = sortedDeployments[0]!.name;

  const filePath = req.path === "/" ? "index.html" : req.path;
  const localFile = path.join(projectPath, latestDeployment, filePath);

  if (fs.existsSync(localFile)) {
    res.sendFile(localFile);
  } else {
    // If it's a SPA, we might want to serve index.html for unknown paths
    const indexFile = path.join(projectPath, latestDeployment, "index.html");
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(404).send("Not Found");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Reverse Proxy Running..${PORT}`);
});
