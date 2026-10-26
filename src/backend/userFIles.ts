import fs from "node:fs";
import FileEntry from "../interface/FileEntry";
import path from "node:path";
import { userFiles } from "./paths";
import SearchResult, { SearchMatch } from "../interface/SearchResult";
const MAX_SEARCH_MATCHES = 200;
const SEARCH_SNIPPET_LENGTH = 200;
export function __UserFilesFunc() {
  const resolveInUserFiles = (relPath: string) => {
    const resolved = path.resolve(userFiles, relPath);
    if (resolved !== userFiles && !resolved.startsWith(userFiles + path.sep)) {
      throw new Error("Path escapes the vault");
    }
    return resolved;
  };

  const getFiles = async (): Promise<FileEntry[]> => {
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
        if (
          allowedExt.includes(path.extname(entryPath)) ||
          !path.extname(entryPath)
        ) {
          if (dirent.name[0] == ".") continue;
          entries.push({
            name: dirent.name,
            kind: dirent.isDirectory()
              ? ("folder" as const)
              : ("file" as const),
            path: entryPath,
            depth,
          });
        }

        if (dirent.isDirectory()) {
          entries.push(
            ...(await walk(path.join(dir, dirent.name), depth + 1, entryPath)),
          );
        }
      }
      return entries;
    };
    return walk(userFiles, 0, "");
  };
  const createDir = async (
    _: Electron.IpcMainInvokeEvent,
    dir_name: string,
  ): Promise<void> => {
    if (dir_name) await fs.promises.mkdir(resolveInUserFiles(dir_name));
  };
  const createFile = async (
    _: Electron.IpcMainInvokeEvent,
    file_name: string,
  ) => {
    if (file_name)
      await fs.promises.writeFile(resolveInUserFiles(file_name), "");
  };
  const deleteFile = async (
    _: Electron.IpcMainInvokeEvent,
    file_name: string,
  ) => {
    if (file_name)
      await fs.promises.rm(resolveInUserFiles(file_name), { force: true });
  };
  const deleteDir = async (
    _: Electron.IpcMainInvokeEvent,
    dir_name: string,
  ) => {
    if (dir_name)
      await fs.promises.rm(resolveInUserFiles(dir_name), {
        recursive: true,
        force: true,
      });
  };
  const getText = async (_: Electron.IpcMainInvokeEvent, ffname: string) => {
    if (ffname)
      return await fs.promises.readFile(resolveInUserFiles(ffname), {
        encoding: "utf8",
      });
  };
  const saveText = async (
    _: Electron.IpcMainInvokeEvent,
    ffname: string,
    text: string,
  ) => {
    if (ffname)
      await fs.promises.writeFile(resolveInUserFiles(ffname), text, {
        encoding: "utf8",
      });
  };
  const search = async (
    _: Electron.IpcMainInvokeEvent,
    query: string,
  ): Promise<SearchResult> => {
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
  };
  return {
    getFiles,
    createDir,
    createFile,
    deleteFile,
    deleteDir,
    getText,
    saveText,
    search,
  };
}
