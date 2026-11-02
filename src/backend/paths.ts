import { app } from "electron";
import path from "node:path";

let userDataDir;
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) userDataDir = "debug_userData";
else userDataDir  = "userData"

export const userFiles = path.join(app.getPath("userData"), userDataDir);
