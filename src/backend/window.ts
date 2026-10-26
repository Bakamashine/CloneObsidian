import { BrowserWindow } from "electron";
export function _Window(getMainWindow: () => BrowserWindow | null) {
  const minimize = () => {
    getMainWindow()?.minimize();
  };

  const maximize = () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  };

  const close = () => {
    getMainWindow()?.close();
  }
  return {
    minimize,
    maximize,
    close
  };
}
