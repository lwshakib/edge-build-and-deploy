import express, { type Request, type Response } from "express";
import httpProxy from "http-proxy";
import type { ProxyReqCallback } from "http-proxy";
import { IncomingMessage, ServerResponse, ClientRequest } from "http";

const app = express();
const PORT = 8000 as const;

const BASE_PATH = process.env.S3_BASE_URL;

if (!BASE_PATH) {
  throw new Error("Missing S3_BASE_URL environment variable");
}

// http-proxy does not provide perfect generics for Express,
// but createProxyServer is the typed entry point
const proxy = httpProxy.createProxyServer({});

// Main reverse-proxy middleware
app.use((req: Request, res: Response) => {
  const hostname: string = req.hostname;
  const subdomain: string = hostname.split(".")[0] ?? "";

  // TODO: If hostname may not contain a subdomain (e.g. localhost),
  // handle fallback or validation here.
  // Custom Domain - DB Query could resolve this dynamically

  const resolvesTo: string = `${BASE_PATH}/${subdomain}`;

  proxy.web(req, res, {
    target: resolvesTo,
    changeOrigin: true,
  });
});

// Proxy request mutation
proxy.on(
  "proxyReq",
  (proxyReq: ClientRequest, req: IncomingMessage, _res: ServerResponse) => {
    const url: string | undefined = req.url;

    if (url === "/") {
      // http-proxy mutates the outgoing path directly
      proxyReq.path += "index.html";
    }
  }
);

app.listen(PORT, () => {
  console.log(`Reverse Proxy Running..${PORT}`);
});
