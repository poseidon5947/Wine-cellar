const { app, BrowserWindow, Menu, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const DEFAULT_APP_URL = "https://wine-cellar-kr120jl49-coinspring.vercel.app";
let serverProcess = null;

function getAppUrl() {
  const configPath = path.join(__dirname, "app-url.txt");

  try {
    const configuredUrl = fs.readFileSync(configPath, "utf8").trim();
    if (configuredUrl) return configuredUrl;
  } catch {
    // Use the default URL below when the optional config file is absent.
  }

  return process.env.WINE_CELLAR_DESKTOP_URL || DEFAULT_APP_URL;
}

function normalizeFileUrl(filePath) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

function getStandaloneDir() {
  return path.join(app.getAppPath(), ".next", "standalone");
}

function getServerEntry() {
  return path.join(getStandaloneDir(), "server.js");
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") resolve(address.port);
        else reject(new Error("Unable to reserve a local port."));
      });
    });
  });
}

function waitForServer(url) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    function check() {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", (error) => {
        if (Date.now() - startedAt > 30000) {
          reject(error);
          return;
        }
        setTimeout(check, 350);
      });
    }

    check();
  });
}

async function startLocalServer() {
  const serverEntry = getServerEntry();
  if (!fs.existsSync(serverEntry)) {
    return getAppUrl();
  }

  const port = await findFreePort();
  const userData = app.getPath("userData");
  const dataDir = path.join(userData, "data");
  const uploadDir = path.join(dataDir, "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const env = {
    ...process.env,
    APP_PASSWORD: process.env.APP_PASSWORD || "cellar-demo",
    DATABASE_URL: normalizeFileUrl(path.join(dataDir, "wine-cellar.db")),
    ELECTRON_RUN_AS_NODE: "1",
    HOSTNAME: "127.0.0.1",
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "production",
    PORT: String(port),
    SESSION_SECRET: process.env.SESSION_SECRET || "local-wine-cellar-session",
    WINE_CELLAR_DESKTOP_RUNTIME: "1",
    WINE_CELLAR_UPLOAD_DIR: uploadDir
  };

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: getStandaloneDir(),
    env,
    stdio: app.isPackaged ? "ignore" : "inherit",
    windowsHide: true
  });

  serverProcess.once("exit", () => {
    serverProcess = null;
  });

  const localUrl = `http://127.0.0.1:${port}`;
  await waitForServer(localUrl);
  return localUrl;
}

function createWindow(appUrl) {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 680,
    title: "Wine Cellar",
    backgroundColor: "#140c0d",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadURL(appUrl);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(appUrl)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("did-fail-load", () => {
    win.loadFile(path.join(__dirname, "offline.html"));
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  startLocalServer()
    .then((appUrl) => createWindow(appUrl))
    .catch(() => createWindow(`file://${path.join(__dirname, "offline.html").replace(/\\/g, "/")}`));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startLocalServer()
        .then((appUrl) => createWindow(appUrl))
        .catch(() => createWindow(`file://${path.join(__dirname, "offline.html").replace(/\\/g, "/")}`));
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
