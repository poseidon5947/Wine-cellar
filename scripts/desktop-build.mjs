import { cpSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const builderArgs = process.argv.slice(2);
const env = {
  ...process.env,
  CSC_IDENTITY_AUTO_DISCOVERY: "false",
  ELECTRON_BUILDER_CACHE: path.join(root, ".cache", "electron-builder"),
  ELECTRON_CACHE: path.join(root, ".cache", "electron"),
  WINE_CELLAR_DESKTOP_BUILD: "1",
  DATABASE_URL: "file:./desktop-build.db",
  NEXT_TELEMETRY_DISABLED: "1"
};

function run(command, args) {
  execFileSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit"
  });
}

function runNodeScript(scriptPath, args) {
  run(process.execPath, [path.join(root, "node_modules", ...scriptPath), ...args]);
}

function replaceDir(source, destination) {
  if (!existsSync(source)) return;
  rmSync(destination, { force: true, recursive: true });
  cpSync(source, destination, { recursive: true });
}

runNodeScript(["prisma", "build", "index.js"], ["generate", "--schema", "prisma/schema.desktop.prisma"]);
runNodeScript(["next", "dist", "bin", "next"], ["build"]);

const standaloneDir = path.join(root, ".next", "standalone");
replaceDir(path.join(root, "public"), path.join(standaloneDir, "public"));
replaceDir(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
rmSync(path.join(standaloneDir, ".env"), { force: true });
rmSync(path.join(standaloneDir, ".env.local"), { force: true });
rmSync(path.join(standaloneDir, ".env.production"), { force: true });

if (builderArgs.length) {
  runNodeScript(["electron-builder", "out", "cli", "cli.js"], builderArgs);
}
