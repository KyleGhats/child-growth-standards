import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const whoBrowser = path.join(pkgRoot, "src/browser/who-load-tables.ts");
const dohBrowser = path.join(pkgRoot, "src/browser/doh-load-tables.ts");
const dataPathBrowser = path.join(pkgRoot, "src/browser/data-path.browser.ts");

await esbuild.build({
  entryPoints: [path.join(pkgRoot, "src/browser-entry.ts")],
  bundle: true,
  platform: "browser",
  format: "esm",
  outfile: path.join(pkgRoot, "dist/browser.mjs"),
  sourcemap: true,
  plugins: [
    {
      name: "browser-shims",
      setup(build) {
        build.onResolve({ filter: /load-tables\.(js|ts)$/ }, (args) => {
          const importerDir = path.dirname(args.importer);
          if (/\/who$/i.test(importerDir.replace(/\\/g, "/"))) {
            return { path: whoBrowser };
          }
          if (/\/doh$/i.test(importerDir.replace(/\\/g, "/"))) {
            return { path: dohBrowser };
          }
          if (/[/\\]who[/\\]load-tables\.(js|ts)$/.test(args.path)) {
            return { path: whoBrowser };
          }
          if (/[/\\]doh[/\\]load-tables\.(js|ts)$/.test(args.path)) {
            return { path: dohBrowser };
          }
        });
        build.onResolve({ filter: /data-path\.(js|ts)$/ }, () => ({
          path: dataPathBrowser,
        }));
      },
    },
  ],
});

fs.writeFileSync(
  path.join(pkgRoot, "dist/browser.d.ts"),
  `export * from "./index.js";
export {
  runPediatricGrowthRequest,
  computePediatricGrowthRequest,
  type PediatricGrowthRequestBody,
  type PediatricGrowthRequestResult,
} from "./run-pediatric-growth-request.js";
`,
);

console.log("build:browser → dist/browser.mjs");
