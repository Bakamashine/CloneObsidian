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

  const allowedExt = new Set([".md"]);
  const getFiles = async (): Promise<FileEntry[]> => {
    const walk = async (
      dir: string,
      rel = "",
      depth = 0,
    ): Promise<FileEntry[]> => {
      const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

      const dirs: FileEntry[] = [];
      const files: FileEntry[] = [];

      for (const dirent of dirents) {
        if (dirent.name.startsWith(".")) continue;

        const entryPath = rel ? `${rel}/${dirent.name}` : dirent.name;

        if (dirent.isDirectory()) {
          dirs.push({
            kind: "folder",
            name: dirent.name,
            path: entryPath,
            depth,
          });
        } else if (
          dirent.isFile() &&
          allowedExt.has(path.extname(dirent.name).toLowerCase())
        ) {
          files.push({
            kind: "file",
            name: dirent.name,
            path: entryPath,
            depth,
          });
        }
      }

      dirs.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));

      const result: FileEntry[] = [];
      for (const directory of dirs) {
        result.push(directory);
        result.push(
          ...(await walk(
            path.join(dir, directory.name),
            directory.path,
            depth + 1,
          )),
        );
      }
      result.push(...files);
      return result;
    };
    return await walk(userFiles);
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
  const move = async (
    _: Electron.IpcMainInvokeEvent,
    from: string,
    to: string,
  ) => {
    if (!from || !to) return;

    const source = resolveInUserFiles(from);
    const target = resolveInUserFiles(to);

    if (source === target) return;

    const stat = await fs.promises.stat(source);
    if (stat.isDirectory()) {
      if (target === source || target.startsWith(source + path.sep))
        throw new Error("Cannot move a folder into itself");
    }

    if (fs.existsSync(target)) throw new Error("Target already exists");

    await fs.promises.rename(source, target);
  };
  const copy = async (
    _: Electron.IpcMainInvokeEvent,
    from: string,
    to: string,
  ) => {
    if (!from || !to) return;

    const source = resolveInUserFiles(from);
    const target = resolveInUserFiles(to);

    if (source === target) return;

    const stat = await fs.promises.stat(source);
    if (stat.isDirectory()) {
      if (target === source || target.startsWith(source + path.sep))
        throw new Error("Cannot copy a folder into itself");
    }

    if (fs.existsSync(target)) throw new Error("Target already exists");

    await fs.promises.cp(source, target, {
      recursive: true,
      errorOnExist: true,
      force: false,
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
    move,
    copy,
    getText,
    saveText,
    search,
  };
}
