import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const entry = resolve(root, "scripts/api-handler.source.ts");
const outdir = resolve(root, "api");
const outfile = resolve(outdir, "handler.js");

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
  footer: {
    js: "module.exports = module.exports.default;",
  },
});

console.log("[bundle-api] Wrote", outfile);

writeFileSync(
  resolve(outdir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2),
);
console.log("[bundle-api] Wrote api/package.json with type=commonjs");
