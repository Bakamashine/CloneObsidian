import { ipcMain, type BrowserWindow } from "electron";
import fs from "node:fs";
import { _Sync, _userFiles, _windowM } from "./ipcMainAction";
import github_sync from "./sync/github_sync";
import { _Window } from "./backend/window";
import { __UserFilesFunc } from "./backend/userFIles";
import { userFiles } from "./backend/paths";

export { userFiles };

const ensureUserFilesDir = () => {
  fs.mkdirSync(userFiles, { recursive: true });
};

export const registerIpcHandlers = (
  getMainWindow: () => BrowserWindow | null,
) => {
  ensureUserFilesDir();
  const w_func = _Window(getMainWindow);
  const uf_func = __UserFilesFunc();

  ipcMain.on(_windowM.minimize, w_func.minimize);
  ipcMain.on(_windowM.maximize, w_func.maximize);
  ipcMain.on(_windowM.close, w_func.close);

  ipcMain.handle(_userFiles.getFiles, uf_func.getFiles);
  ipcMain.handle(_userFiles.createDir, uf_func.createDir);
  ipcMain.handle(_userFiles.createFile, uf_func.createFile);
  ipcMain.handle(_userFiles.deleteFile, uf_func.deleteFile);
  ipcMain.handle(_userFiles.deleteDir, uf_func.deleteDir);
  ipcMain.handle(_userFiles.getText, uf_func.getText);
  ipcMain.handle(_userFiles.saveText, uf_func.saveText);
  ipcMain.handle(_userFiles.search, uf_func.search);

  ipcMain.handle(_Sync.push, github_sync.push.bind(github_sync));
  ipcMain.handle(_Sync.clone, github_sync.clone.bind(github_sync));
  ipcMain.handle(_Sync.pull, github_sync.pull.bind(github_sync));
};
