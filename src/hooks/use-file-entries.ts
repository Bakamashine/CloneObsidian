import { useCallback, useEffect, useState } from "react";
import type FileEntry from "../interface/FileEntry";

export const useFileEntries = () => {
  const [entries, setEntries] = useState<FileEntry[]>();

  useEffect(() => {
    window.userFiles.getFiles().then(setEntries);
  }, []);

  const createItem = useCallback(
    async (kind: FileEntry["kind"], name: string) => {
      if (kind === "folder") {
        await window.userFiles.createDirectory(name);
      } else {
        await window.userFiles.createFile(name);
      }
      const files = await window.userFiles.getFiles();
      setEntries(files);
    },
    [],
  );

  const deleteItem = useCallback(
    async (kind: FileEntry["kind"], name: string) => {
      if (kind === "folder") {
        await window.userFiles.deleteDirectory(name);
      } else {
        await window.userFiles.deleteFile(name);
      }
      const files = await window.userFiles.getFiles();
      setEntries(files);
    },
    [],
  );

  return { entries, createItem, deleteItem };
};
