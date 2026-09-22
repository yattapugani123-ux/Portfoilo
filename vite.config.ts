// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: "/Portfoilo/",
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "save-portfolio-content-endpoint",
        configureServer(server) {
          server.middlewares.use("/api/save-portfolio-content", (req, res) => {
            if (req.method === "POST") {
              let body = "";
              req.on("data", (chunk: Buffer) => {
                body += chunk.toString();
              });
              req.on("end", () => {
                try {
                  const data = JSON.parse(body);
                  const dataPath = path.resolve(process.cwd(), "src/data/portfolioData.json");
                  const publicPath = path.resolve(process.cwd(), "public/portfolio-data.json");
                  
                  const dir = path.dirname(dataPath);
                  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                  const pDir = path.dirname(publicPath);
                  if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });

                  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
                  fs.writeFileSync(publicPath, JSON.stringify(data, null, 2), "utf8");
                  
                  res.setHeader("Content-Type", "application/json");
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, message: "Saved to project files successfully!" }));
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ success: false, error: String(err) }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end("Method Not Allowed");
            }
          });
        },
      },
    ],
  },
});