import type { IncomingMessage, ServerResponse } from "node:http";

type Handler = (req: IncomingMessage, res: ServerResponse) => unknown;

let app: Handler | null = null;
let initError: Error | null = null;

async function init() {
  try {
    const mod = await import("../server/_core/app");
    app = mod.createApp() as unknown as Handler;
  } catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
  }
}

const initPromise = init();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await initPromise;
  if (initError) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "App initialization failed",
        message: initError.message,
        stack: initError.stack,
        url: req.url,
        method: req.method,
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
