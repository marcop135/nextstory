import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
let nextConfig;
try {
  nextConfig = require.resolve("eslint-config-next");
} catch (error) {
  const omitDev = process.env.NODE_ENV === "production"
    || process.env.npm_config_omit?.split(/[,\s]+/).includes("dev");
  if (error.code !== "MODULE_NOT_FOUND" || !omitDev) throw error;
}

// Older plugins expect the callable export; patched minimatch exposes it by name.
function patchImports(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      patchImports(path);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const source = readFileSync(path, "utf8");
      const patched = source.replace(/require\((["'])minimatch\1\)(?!\.minimatch)/g, "$&.minimatch");
      if (patched !== source) writeFileSync(path, patched);
    }
  }
}

if (nextConfig) {
  const nextRequire = createRequire(nextConfig);
  for (const plugin of ["eslint-plugin-import", "eslint-plugin-jsx-a11y", "eslint-plugin-react"]) {
    patchImports(join(dirname(nextRequire.resolve(`${plugin}/package.json`)), "lib"));
  }
}
