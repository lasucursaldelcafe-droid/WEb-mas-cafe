#!/usr/bin/env node
/**
 * Sirve gh-pages-site/ en http://localhost:4173 para previsualizar sin internet.
 */
import { createServer } from "http";
import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const siteDir = path.join(root, "gh-pages-site");
const port = Number(process.env.PORT ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!existsSync(path.join(siteDir, "index.html"))) {
  console.error("\n❌ No existe gh-pages-site/index.html");
  console.error("   Ejecuta primero: npm run build:site\n");
  process.exit(1);
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(body);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let filePath = path.join(siteDir, urlPath === "/" ? "index.html" : urlPath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!filePath.startsWith(siteDir)) {
    send(res, 403, "Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    const fallback = path.join(siteDir, "404.html");
    if (existsSync(fallback)) {
      send(res, 404, readFileSync(fallback), MIME[".html"]);
    } else {
      send(res, 404, "Not found");
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  send(res, 200, readFileSync(filePath), MIME[ext] ?? "application/octet-stream");
});

server.listen(port, "127.0.0.1", () => {
  console.log("\n✅ Sitio local listo\n");
  console.log(`   http://localhost:${port}/`);
  console.log("\n   Ctrl+C para detener\n");
});
