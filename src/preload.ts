import { contextBridge, ipcRenderer } from "electron";
import { _userFiles } from "./ipcMainAction";

contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});

contextBridge.exposeInMainWorld("userFiles", {
  getFiles: () => ipcRenderer.invoke(_userFiles.getFiles),
  createDirectory: (dir_name: string) =>
    ipcRenderer.invoke(_userFiles.createDir, dir_name),
  createFile: (file_name: string) =>
    ipcRenderer.invoke(_userFiles.createFile, file_name),
  deleteDirectory: (dir_name: string) =>
    ipcRenderer.invoke(_userFiles.deleteDir, dir_name),
  deleteFile: (file_name: string) =>
    ipcRenderer.invoke(_userFiles.deleteFile, file_name),
  getText: (ffname: string) => ipcRenderer.invoke(_userFiles.getText, ffname),
});
