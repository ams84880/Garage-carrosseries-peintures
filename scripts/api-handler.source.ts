import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/_core/app";

type Handler = (req: IncomingMessage, res: ServerResponse) => unknown;

let app: Handler | null = null;
let initError: Error | null = null;

try {
  app = createApp() as unknown as Handler;
} catch (err) {
  initError = err instanceof Error ? err : new Error(String(err));
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (initError) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "App initialization failed",
        message: initError.message,
        stack: initError.stack,
        url: req.url,
        env: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          JWT_SECRET: !!process.env.JWT_SECRET,
        },
      })
    );
    return;
  }
  return app!(req, res);
}
