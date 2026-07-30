import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const databaseEnv = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  ? { DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL }
  : {};

run(process.execPath, [prismaCli, "generate"], databaseEnv);
run(process.execPath, [prismaCli, "migrate", "deploy"], {
  ...databaseEnv,
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1"
});
run(process.execPath, [nextCli, "build"], databaseEnv);

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...extraEnv
    }
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
