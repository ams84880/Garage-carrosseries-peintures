import { build } from "esbuild";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const entry = resolve(root, "api/[...all].ts");
const outdir = resolve(root, "api");
const outfile = resolve(outdir, "[...all].js");

console.log("[bundle-api] Bundling", entry);

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  packages: "external",
  sourcemap: false,
  logLevel: "info",
  alias: {
    "@shared": resolve(root, "shared"),
  },
});

console.log("[bundle-api] Wrote", outfile);

rmSync(entry);
console.log("[bundle-api] Removed source", entry);

writeFileSync(
  resolve(outdir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2),
);
console.log("[bundle-api] Wrote api/package.json with type=commonjs");
