import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import FileEntry from "../interface/FileEntry";
import { useTabs } from "../tabs";
import ContextMenu, {
  useContextMenu,
  type ContextMenuItem,
} from "./context-menu";
import CreateItemModal, { type CreateItemModalState } from "./create-item-modal";
import Explorer from "./explorer";
import Ribbon from "./ribbon";
import { useFileEntries } from "../hooks/use-file-entries";

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);

const dirname = (path: string) => {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
};

const joinPath = (dir: string, name: string) => (dir ? `${dir}/${name}` : name);

const Sidebar = () => {
  const { entries, createItem, deleteItem, moveItem } = useFileEntries();
  const { openTab, currentFile, movePath } = useTabs();
  const { menu, openAt, close } = useContextMenu();
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState<CreateItemModalState | null>(
    null,
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [cutPath, setCutPath] = useState<string | null>(null);
  const closeCreateModal = useCallback(() => setCreateModal(null), []);

  const selectedEntry =
    entries?.find((entry) => entry.path === selectedPath) ?? null;

  const newFile = () => setCreateModal({ kind: "file" });

  const targetDirFor = useCallback(
    (entry?: FileEntry) => {
      const target = entry ?? selectedEntry;
      if (!target) return "";
      return target.kind === "folder" ? target.path : dirname(target.path);
    },
    [selectedEntry],
  );

  const selectEntry = (entry: FileEntry) => {
    setSelectedPath(entry.path);
    if (entry.kind === "file") {
      openTab({ name: entry.name, path: entry.path });
      navigate("/");
    }
  };

  const moveEntry = useCallback(
    async (sourcePath: string, targetDir: string) => {
      const source = entries?.find((entry) => entry.path === sourcePath);
      if (!source) return;

      if (
        source.kind === "folder" &&
        (targetDir === sourcePath || targetDir.startsWith(`${sourcePath}/`))
      ) {
        return;
      }

      const targetPath = joinPath(targetDir, basename(sourcePath));

      if (targetPath === sourcePath) {
        setCutPath(null);
        return;
      }

      try {
        await moveItem(sourcePath, targetPath);
        movePath(sourcePath, targetPath);
        setSelectedPath(targetPath);
        setCutPath(null);
      } catch (error) {
        console.error("Failed to move entry", error);
      }
    },
    [entries, moveItem, movePath],
  );

  const pasteInto = useCallback(
    (targetDir: string) => {
      if (!cutPath) return;
      const destination = targetDir === cutPath ? dirname(cutPath) : targetDir;
      void moveEntry(cutPath, destination);
    },
    [cutPath, moveEntry],
  );

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest(
        "input, textarea, [contenteditable='true'], .monaco-editor",
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (isEditable(event.target)) return;

      const key = event.key.toLowerCase();

      if ((key === "x" || key === "ч") && selectedPath) {
        event.preventDefault();
        setCutPath(selectedPath);
      } else if (key === "v" || key === "м") {
        event.preventDefault();
        pasteInto(targetDirFor());
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedPath, pasteInto, targetDirFor]);

  const openContextMenu = (event: MouseEvent, entry?: FileEntry) => {
    const items: ContextMenuItem[] = [
      {
        label: "New File",
        onSelect: () =>
          setCreateModal({ kind: "file", parentPath: targetDirFor(entry) }),
      },
      {
        label: "New Folder",
        onSelect: () =>
          setCreateModal({ kind: "folder", parentPath: targetDirFor(entry) }),
      },
    ];

    if (entry) {
      items.push(
        { separator: true },
        {
          label: "Rename",
          onSelect: () =>
            setCreateModal({
              kind: entry.kind,
              mode: "rename",
              initialValue: entry.name,
              targetPath: entry.path,
            }),
        },
        {
          label: "Cut",
          onSelect: () => {
            setSelectedPath(entry.path);
            setCutPath(entry.path);
          },
        },
      );
    }

    if (cutPath) {
      items.push({
        label: "Paste",
        onSelect: () => pasteInto(targetDirFor(entry)),
      });
    }

    if (entry) {
      items.push(
        { separator: true },
        {
          label: entry.kind === "folder" ? "Delete Folder" : "Delete File",
          danger: true,
          onSelect: () => {
            if (!entry) return;
            void deleteItem(entry.kind, entry.path)
              .then(() => {
                if (
                  selectedPath === entry.path ||
                  selectedPath?.startsWith(`${entry.path}/`)
                ) {
                  setSelectedPath(null);
                }
                if (
                  cutPath === entry.path ||
                  cutPath?.startsWith(`${entry.path}/`)
                ) {
                  setCutPath(null);
                }
              })
              .catch((error) =>
                console.error("Failed to delete entry", error),
              );
          },
        },
      );
    }

    openAt(event, items);
  };

  const handleCreate = async (name: string) => {
    if (!createModal) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    if (createModal.mode === "rename" && createModal.targetPath) {
      const source = createModal.targetPath;
      let newName = trimmed;
      if (createModal.kind === "file" && !newName.includes(".")) {
        newName += ".md";
      }
      const target = joinPath(dirname(source), newName);
      if (target !== source) {
        try {
          await moveItem(source, target);
          movePath(source, target);
          setSelectedPath(target);
          if (cutPath === source) setCutPath(null);
        } catch (error) {
          console.error("Failed to rename entry", error);
        }
      }
      return;
    }

    const target = createModal.parentPath
      ? joinPath(createModal.parentPath, trimmed)
      : trimmed;
    await createItem(createModal.kind, target);
    setSelectedPath(target);
  };

  return (
    <div className="sidebar">
      <Ribbon />
      <Explorer
        entries={entries}
        currentFile={currentFile}
        selectedPath={selectedPath}
        cutPath={cutPath}
        onNewFile={newFile}
        onSelectEntry={selectEntry}
        onClearSelection={() => setSelectedPath(null)}
        onMoveEntry={(sourcePath, targetDir) => {
          void moveEntry(sourcePath, targetDir);
        }}
        onListContextMenu={(event) => openContextMenu(event)}
        onEntryContextMenu={openContextMenu}
      />
      <ContextMenu state={menu} onClose={close} />
      <CreateItemModal
        state={createModal}
        onCreate={(name) => {
          void handleCreate(name);
        }}
        onClose={closeCreateModal}
      />
    </div>
  );
};

export default Sidebar;
