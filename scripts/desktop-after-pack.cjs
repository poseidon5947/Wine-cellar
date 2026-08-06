const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const appDir = path.join(context.appOutDir, "resources", "app");
  const source = path.join(context.packager.projectDir, "node_modules", ".prisma");
  const destination = path.join(appDir, "node_modules", ".prisma");

  fs.rmSync(destination, { force: true, recursive: true });
  fs.cpSync(source, destination, {
    recursive: true,
    filter: (sourcePath) => !/^query_engine-windows\.dll\.node\.tmp\d+$/.test(path.basename(sourcePath))
  });

  for (const envFile of [".env", ".env.local", ".env.production"]) {
    fs.rmSync(path.join(appDir, ".next", "standalone", envFile), { force: true });
  }
};
