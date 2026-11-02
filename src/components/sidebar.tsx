import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
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

type Clipboard = {
  mode: "cut" | "copy";
  paths: string[];
};

const SIDEBAR_WIDTH_STORAGE_KEY = "cloneobsidian:sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 260;
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 600;

const clampSidebarWidth = (width: number) =>
  Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));

const getInitialSidebarWidth = () => {
  const stored = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0
    ? clampSidebarWidth(stored)
    : DEFAULT_SIDEBAR_WIDTH;
};

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);

const dirname = (path: string) => {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
};

const joinPath = (dir: string, name: string) => (dir ? `${dir}/${name}` : name);

const normalizeSelection = (paths: string[]) => {
  const kept: string[] = [];
  for (const path of [...paths].sort((a, b) => a.length - b.length)) {
    if (kept.some((parent) => path.startsWith(`${parent}/`))) continue;
    kept.push(path);
  }
  return kept;
};

const Sidebar = () => {
  const { entries, createItem, deleteItem, moveItem, copyItem } =
    useFileEntries();
  const { openTab, currentFile, movePath } = useTabs();
  const { menu, openAt, close } = useContextMenu();
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState<CreateItemModalState | null>(
    null,
  );
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const resizeState = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const closeCreateModal = useCallback(() => setCreateModal(null), []);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(sidebarWidth),
    );
  }, [sidebarWidth]);

  useEffect(
    () => () => document.body.classList.remove("is-resizing"),
    [],
  );

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: sidebarWidth,
    };
    document.body.classList.add("is-resizing");
  };

  const handleResizeMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = resizeState.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setSidebarWidth(
      clampSidebarWidth(state.startWidth + event.clientX - state.startX),
    );
  };

  const handleResizeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const state = resizeState.current;
    if (!state || state.pointerId !== event.pointerId) return;
    resizeState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove("is-resizing");
  };

  const selectedEntries = useMemo(
    () => (entries ?? []).filter((entry) => selectedPaths.has(entry.path)),
    [entries, selectedPaths],
  );

  const cutPaths = useMemo(
    () =>
      clipboard?.mode === "cut"
        ? new Set(clipboard.paths)
        : new Set<string>(),
    [clipboard],
  );

  const targetDirFor = useCallback(
    (entry?: FileEntry) => {
      const target =
        entry ?? (selectedEntries.length === 1 ? selectedEntries[0] : undefined);
      if (!target) return "";
      return target.kind === "folder" ? target.path : dirname(target.path);
    },
    [selectedEntries],
  );

  const uniqueTargetPath = useCallback(
    (
      targetDir: string,
      name: string,
      kind: FileEntry["kind"],
      reserved: Set<string>,
    ) => {
      const taken = new Set((entries ?? []).map((entry) => entry.path));
      reserved.forEach((path) => taken.add(path));

      const candidate = joinPath(targetDir, name);
      if (!taken.has(candidate)) return candidate;

      const dot = kind === "file" ? name.lastIndexOf(".") : -1;
      const ext = dot > 0 ? name.slice(dot) : "";
      const base = ext ? name.slice(0, dot) : name;

      let suffix = 1;
      while (taken.has(joinPath(targetDir, `${base} (${suffix})${ext}`))) {
        suffix += 1;
      }
      return joinPath(targetDir, `${base} (${suffix})${ext}`);
    },
    [entries],
  );

  const transfer = useCallback(
    async (paths: string[], targetDir: string, mode: Clipboard["mode"]) => {
      const sourceLookup = new Map(
        (entries ?? []).map((entry) => [entry.path, entry]),
      );
      const sources = normalizeSelection(paths)
        .map((path) => sourceLookup.get(path))
        .filter((entry): entry is FileEntry => !!entry);

      if (!sources.length) return;

      const nextSelection = new Set<string>();
      const reserved = new Set<string>();
      let changed = false;

      for (const source of sources) {
        if (
          source.kind === "folder" &&
          (targetDir === source.path ||
            targetDir.startsWith(`${source.path}/`))
        ) {
          continue;
        }

        if (mode === "cut" && dirname(source.path) === targetDir) {
          nextSelection.add(source.path);
          continue;
        }

        const targetPath = uniqueTargetPath(
          targetDir,
          basename(source.path),
          source.kind,
          reserved,
        );

        try {
          if (mode === "cut") {
            await moveItem(source.path, targetPath);
            movePath(source.path, targetPath);
          } else {
            await copyItem(source.path, targetPath);
          }
          nextSelection.add(targetPath);
          reserved.add(targetPath);
          changed = true;
        } catch (error) {
          console.error(`Failed to ${mode} entry`, error);
        }
      }

      if (nextSelection.size) setSelectedPaths(nextSelection);
      if (mode === "cut" && changed) setClipboard(null);
    },
    [entries, moveItem, copyItem, movePath, uniqueTargetPath],
  );

  const deleteEntries = useCallback(
    async (paths: string[]) => {
      const sourceLookup = new Map(
        (entries ?? []).map((entry) => [entry.path, entry]),
      );
      const sources = normalizeSelection(paths)
        .map((path) => sourceLookup.get(path))
        .filter((entry): entry is FileEntry => !!entry);

      for (const source of sources) {
        try {
          await deleteItem(source.kind, source.path);
        } catch (error) {
          console.error("Failed to delete entry", error);
        }
      }

      const deleted = sources.map((source) => source.path);
      const isDeleted = (path: string) =>
        deleted.some(
          (parent) => path === parent || path.startsWith(`${parent}/`),
        );

      setSelectedPaths(
        (prev) => new Set([...prev].filter((path) => !isDeleted(path))),
      );
      setClipboard((prev) => {
        if (!prev) return null;
        const remaining = prev.paths.filter((path) => !isDeleted(path));
        return remaining.length ? { ...prev, paths: remaining } : null;
      });
    },
    [entries, deleteItem],
  );

  const renameEntry = useCallback(
    async (entry: FileEntry, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === entry.name) return;

      let newName = trimmed;
      if (entry.kind === "file" && !newName.includes(".")) newName += ".md";

      const target = joinPath(dirname(entry.path), newName);
      if (target === entry.path) return;

      try {
        await moveItem(entry.path, target);
        movePath(entry.path, target);

        setSelectedPaths((prev) => {
          const next = new Set<string>();
          for (const path of prev) {
            if (path === entry.path) next.add(target);
            else if (path.startsWith(`${entry.path}/`))
              next.add(`${target}${path.slice(entry.path.length)}`);
            else next.add(path);
          }
          return next;
        });

        setClipboard((prev) =>
          prev
            ? {
                ...prev,
                paths: prev.paths.map((path) =>
                  path === entry.path
                    ? target
                    : path.startsWith(`${entry.path}/`)
                      ? `${target}${path.slice(entry.path.length)}`
                      : path,
                ),
              }
            : null,
        );
      } catch (error) {
        console.error("Failed to rename entry", error);
      }
    },
    [moveItem, movePath],
  );

  const openEntry = (entry: FileEntry) => {
    openTab({ name: entry.name, path: entry.path });
    navigate("/");
  };

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest(
        "input, textarea, [contenteditable='true'], .monaco-editor",
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (isEditable(event.target)) return;

      const code = event.code;
      const key = event.key.toLowerCase();

      const isCut = code === "KeyX" || key === "x" || key === "ч";
      const isCopy = code === "KeyC" || key === "c" || key === "с";
      const isPaste = code === "KeyV" || key === "v" || key === "м";

      if (isCut && selectedPaths.size) {
        event.preventDefault();
        setClipboard({ mode: "cut", paths: [...selectedPaths] });
      } else if (isCopy && selectedPaths.size) {
        event.preventDefault();
        setClipboard({ mode: "copy", paths: [...selectedPaths] });
      } else if (isPaste && clipboard) {
        event.preventDefault();
        void transfer(clipboard.paths, targetDirFor(), clipboard.mode);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedPaths, clipboard, transfer, targetDirFor]);

  const openContextMenu = (event: MouseEvent, entry?: FileEntry) => {
    const inSelection = entry ? selectedPaths.has(entry.path) : false;
    const paths = entry
      ? inSelection
        ? [...selectedPaths]
        : [entry.path]
      : [...selectedPaths];

    if (entry && !inSelection) setSelectedPaths(new Set([entry.path]));

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

    if (paths.length) {
      items.push(
        { separator: true },
        {
          label:
            paths.length > 1
              ? `Cut ${paths.length} items (Ctrl+X)`
              : "Cut (Ctrl+X)",
          onSelect: () => setClipboard({ mode: "cut", paths }),
        },
        {
          label:
            paths.length > 1
              ? `Copy ${paths.length} items (Ctrl+C)`
              : "Copy (Ctrl+C)",
          onSelect: () => setClipboard({ mode: "copy", paths }),
        },
      );
    }

    if (clipboard) {
      items.push({
        label:
          clipboard.mode === "cut"
            ? "Paste move (Ctrl+V)"
            : "Paste copy (Ctrl+V)",
        onSelect: () =>
          void transfer(clipboard.paths, targetDirFor(entry), clipboard.mode),
      });
    }

    if (entry && paths.length === 1) {
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
      );
    }

    if (paths.length) {
      items.push(
        { separator: true },
        {
          label:
            paths.length > 1 ? `Delete ${paths.length} items` : "Delete",
          danger: true,
          onSelect: () => void deleteEntries(paths),
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
      const entry =
        entries?.find((item) => item.path === createModal.targetPath) ?? {
          name: basename(createModal.targetPath),
          kind: createModal.kind,
          path: createModal.targetPath,
        };
      await renameEntry(entry, trimmed);
      return;
    }

    const target = createModal.parentPath
      ? joinPath(createModal.parentPath, trimmed)
      : trimmed;
    await createItem(createModal.kind, target);
    setSelectedPaths(new Set([target]));
  };

  return (
    <div
      className="sidebar"
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <Ribbon />
      <Explorer
        entries={entries}
        currentFile={currentFile}
        selectedPaths={selectedPaths}
        cutPaths={cutPaths}
        onSelectionChange={setSelectedPaths}
        onOpenEntry={openEntry}
        onMoveEntries={(sourcePaths, targetDir) => {
          void transfer(sourcePaths, targetDir, "cut");
        }}
        onRenameEntry={(entry, name) => {
          void renameEntry(entry, name);
        }}
        onListContextMenu={(event) => openContextMenu(event)}
        onEntryContextMenu={openContextMenu}
      />
      <div
        className="sidebar__resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize explorer"
        aria-valuemin={MIN_SIDEBAR_WIDTH}
        aria-valuemax={MAX_SIDEBAR_WIDTH}
        aria-valuenow={Math.round(sidebarWidth)}
        title="Drag to resize, double-click to reset"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
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
