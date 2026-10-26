/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import fs from "node:fs";
import type FileEntry from "./interface/FileEntry";
import type SearchResult from "./interface/SearchResult";
import type { SearchMatch } from "./interface/SearchResult";
import { _userFiles } from "./ipcMainAction";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const userDataDir = "userData";
const userFiles = path.join(app.getPath("userData"), userDataDir);

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    backgroundColor: "#161616",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools in development only.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
  fs.mkdirSync(userFiles, { recursive: true });
};

ipcMain.on("window:minimize", () => mainWindow?.minimize());

ipcMain.on("window:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window:close", () => mainWindow?.close());

const resolveInUserFiles = (relPath: string) => {
  const resolved = path.resolve(userFiles, relPath);
  if (resolved !== userFiles && !resolved.startsWith(userFiles + path.sep)) {
    throw new Error("Path escapes the vault");
  }
  return resolved;
};

ipcMain.handle(_userFiles.getFiles, async (): Promise<FileEntry[]> => {
  const walk = async (
    dir: string,
    depth: number,
    rel: string,
  ): Promise<FileEntry[]> => {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const allowedExt = [".md"];
    const entries: FileEntry[] = [];
    for (const dirent of dirents) {
      const entryPath = rel ? `${rel}/${dirent.name}` : dirent.name;
      if (allowedExt.includes(path.extname(entryPath)) || !path.extname(entryPath))
        entries.push({
          name: dirent.name,
          kind: dirent.isDirectory() ? ("folder" as const) : ("file" as const),
          path: entryPath,
          depth,
        });
      if (dirent.isDirectory()) {
        entries.push(
          ...(await walk(path.join(dir, dirent.name), depth + 1, entryPath)),
        );
      }
    }
    return entries;
  };
  return walk(userFiles, 0, "");
});

ipcMain.handle(_userFiles.createDir, async (_, dir_name: string) => {
  if (dir_name) await fs.promises.mkdir(resolveInUserFiles(dir_name));
});

ipcMain.handle(_userFiles.createFile, async (_, file_name: string) => {
  if (file_name) await fs.promises.writeFile(resolveInUserFiles(file_name), "");
});

ipcMain.handle(_userFiles.deleteFile, async (_, file_name: string) => {
  if (file_name)
    await fs.promises.rm(resolveInUserFiles(file_name), { force: true });
});

ipcMain.handle(_userFiles.deleteDir, async (_, dir_name: string) => {
  if (dir_name)
    await fs.promises.rm(resolveInUserFiles(dir_name), {
      recursive: true,
      force: true,
    });
});

ipcMain.handle(_userFiles.getText, async (_, ffname: string) => {
  if (ffname)
    return await fs.promises.readFile(resolveInUserFiles(ffname), {
      encoding: "utf8",
    });
});

ipcMain.handle(_userFiles.saveText, async (_, ffname: string, text: string) => {
  if (ffname)
    await fs.promises.writeFile(resolveInUserFiles(ffname), text, {
      encoding: "utf8",
    });
});

const MAX_SEARCH_MATCHES = 200;
const SEARCH_SNIPPET_LENGTH = 200;

ipcMain.handle(
  _userFiles.search,
  async (_, query: string): Promise<SearchResult> => {
    const term = query.trim().toLowerCase();
    if (!term) return { matches: [], truncated: false };

    const matches: SearchMatch[] = [];
    let truncated = false;

    const walk = async (dir: string, rel: string): Promise<boolean> => {
      const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
      dirents.sort((a, b) => a.name.localeCompare(b.name));

      for (const dirent of dirents) {
        const entryPath = rel ? `${rel}/${dirent.name}` : dirent.name;

        if (dirent.isDirectory()) {
          if (await walk(path.join(dir, dirent.name), entryPath)) return true;
          continue;
        }

        if (path.extname(dirent.name).toLowerCase() !== ".md") continue;

        let content: string;
        try {
          content = await fs.promises.readFile(
            path.join(dir, dirent.name),
            "utf8",
          );
        } catch {
          continue;
        }

        const lines = content.split(/\r?\n/);
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          const column = line.toLowerCase().indexOf(term);
          if (column === -1) continue;

          if (matches.length >= MAX_SEARCH_MATCHES) {
            truncated = true;
            return true;
          }

          const start = Math.max(0, column - 60);
          const end = Math.min(line.length, start + SEARCH_SNIPPET_LENGTH);
          let snippet = line.slice(start, end).trim();
          if (start > 0) snippet = `…${snippet}`;
          if (end < line.length) snippet = `${snippet}…`;

          matches.push({
            path: entryPath,
            name: dirent.name,
            line: index + 1,
            text: snippet,
          });
        }
      }

      return false;
    };

    await walk(userFiles, "");
    return { matches, truncated };
  },
);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
