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

  const filePath = req.path === "/" ? "index.html" : req.path;
  const localFile = path.join(BUCKET_PATH, "__outputs", subdomain, filePath);

  if (fs.existsSync(localFile)) {
    res.sendFile(localFile);
  } else {
    res.status(404).send("Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Reverse Proxy Running..${PORT}`);
});
