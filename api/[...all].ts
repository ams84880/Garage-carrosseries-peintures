import type { IncomingMessage, ServerResponse } from "node:http";

type Handler = (req: IncomingMessage, res: ServerResponse) => unknown;

let cached: { handler?: Handler; error?: Error } | null = null;

async function loadHandler(): Promise<{ handler?: Handler; error?: Error }> {
  if (cached) return cached;
  try {
    const { createApp } = await import("../server/_core/app");
    cached = { handler: createApp() as unknown as Handler };
  } catch (err) {
    cached = { error: err instanceof Error ? err : new Error(String(err)) };
  }
  return cached;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { handler: app, error } = await loadHandler();
  if (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "App initialization failed",
        message: error.message,
        stack: error.stack,
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
