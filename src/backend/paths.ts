import { app } from "electron";
import path from "node:path";

const userDataDir = "userData";
export const userFiles = path.join(app.getPath("userData"), userDataDir);
