import { spawnSync } from "node:child_process";

run("prisma", ["generate"]);
run("prisma", ["migrate", "deploy"], {
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1"
});
run("next", ["build"]);

function run(command, args, extraEnv = {}) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...extraEnv
    }
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
