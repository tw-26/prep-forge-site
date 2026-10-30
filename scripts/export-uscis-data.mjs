// Copies the Citizen Ready question bank out of the app repo into data/.
// Usage: node scripts/export-uscis-data.mjs [path-to-apps/uscis]
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = resolve(
  process.argv[2] ?? process.env.USCIS_APP_DIR ?? join(siteRoot, "..", "prep-forge", "apps", "uscis")
);
const tsxCli = join(appDir, "node_modules", "tsx", "dist", "cli.mjs");

if (!existsSync(tsxCli)) {
  console.error(`Could not find tsx at ${tsxCli}. Run pnpm install in the app repo first.`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [tsxCli, join(siteRoot, "scripts", "uscis-export.mts")], {
  cwd: appDir,
  env: { ...process.env, USCIS_APP_DIR: appDir, USCIS_DATA_OUT: join(siteRoot, "data") },
  stdio: "inherit"
});

process.exit(result.status ?? 1);
