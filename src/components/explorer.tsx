import { useState, type DragEvent, type MouseEvent } from "react";
import FileEntry from "../interface/FileEntry";
import { ChevronRightIcon, FileIcon, FolderIcon } from "./icons";

type FileItemProps = {
  entry: FileEntry;
  active: boolean;
  selected: boolean;
  cut: boolean;
  collapsed?: boolean;
  dropTarget?: boolean;
  onClick?: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onDragStart: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
};

const FileItem = ({
  entry,
  active,
  selected,
  cut,
  collapsed,
  dropTarget,
  onClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: FileItemProps) => (
  <div
    draggable
    onClick={onClick}
    onContextMenu={onContextMenu}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={[
      "file-item",
      entry.depth ? `file-item--depth-${entry.depth}` : "",
      active ? "file-item--active" : "",
      selected ? "file-item--selected" : "",
      cut ? "file-item--cut" : "",
      collapsed ? "file-item--collapsed" : "",
      dropTarget ? "file-item--drop-target" : "",
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {entry.kind === "folder" && (
      <ChevronRightIcon size={12} className="file-item__chevron" />
    )}
    <span className="file-item__icon">
      {entry.kind === "folder" ? (
        <FolderIcon size={14} />
      ) : (
        <FileIcon size={14} />
      )}
    </span>
    <span className="file-item__name">{entry.name}</span>
  </div>
);

const filterVisible = (entries: FileEntry[], expanded: Set<string>) => {
  const result: FileEntry[] = [];
  const ancestors: string[] = [];

  for (const entry of entries) {
    const depth = entry.depth ?? 0;

    ancestors.length = depth;

    if (depth > 0 && !expanded.has(ancestors[depth - 1])) {
      continue;
    }

    result.push(entry);
    ancestors[depth] = entry.path;
  }
  return result;
};

type ExplorerProps = {
  entries?: FileEntry[];
  currentFile: string | null;
  selectedPath: string | null;
  cutPath: string | null;
  onNewFile: () => void;
  onSelectEntry: (entry: FileEntry) => void;
  onClearSelection: () => void;
  onMoveEntry: (sourcePath: string, targetDir: string) => void;
  onListContextMenu: (event: MouseEvent) => void;
  onEntryContextMenu: (event: MouseEvent, entry: FileEntry) => void;
};

const Explorer = ({
  entries,
  currentFile,
  selectedPath,
  cutPath,
  onSelectEntry,
  onClearSelection,
  onMoveEntry,
  onListContextMenu,
  onEntryContextMenu,
}: ExplorerProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const visible = entries ? filterVisible(entries, expanded) : entries;

  const handleDragStart = (event: DragEvent, entry: FileEntry) => {
    event.dataTransfer.setData("application/x-vault-entry", entry.path);
    event.dataTransfer.setData("text/plain", entry.path);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: DragEvent, entry: FileEntry) => {
    event.stopPropagation();
    if (entry.kind !== "folder") {
      setDropTarget(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(entry.path);
  };

  const handleDragLeave = (event: DragEvent, entry: FileEntry) => {
    event.stopPropagation();
    setDropTarget((current) => (current === entry.path ? null : current));
  };

  const readSource = (event: DragEvent) =>
    event.dataTransfer.getData("application/x-vault-entry") ||
    event.dataTransfer.getData("text/plain");

  const handleDrop = (event: DragEvent, entry: FileEntry) => {
    if (entry.kind !== "folder") return;
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    const source = readSource(event);
    if (source) onMoveEntry(source, entry.path);
  };

  const handleListDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget("");
  };

  const handleListDrop = (event: DragEvent) => {
    event.preventDefault();
    setDropTarget(null);
    const source = readSource(event);
    if (source) onMoveEntry(source, "");
  };

  return (
    <div className="explorer">
      <div className="explorer__header">
        <span className="explorer__title">Files</span>
      </div>

      <div
        className="explorer__list"
        onContextMenu={onListContextMenu}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClearSelection();
        }}
        onDragOver={handleListDragOver}
        onDrop={handleListDrop}
        onDragLeave={() => setDropTarget((current) => (current ? null : current))}
      >
        {visible?.map((entry) => (
          <FileItem
            key={entry.path}
            entry={entry}
            active={entry.path === currentFile}
            selected={entry.path === selectedPath}
            cut={entry.path === cutPath}
            collapsed={entry.kind === "folder" && !expanded.has(entry.path)}
            dropTarget={entry.kind === "folder" && dropTarget === entry.path}
            onClick={() => {
              onSelectEntry(entry);
              if (entry.kind === "folder") toggleFolder(entry.path);
            }}
            onContextMenu={(event) => onEntryContextMenu(event, entry)}
            onDragStart={(event) => handleDragStart(event, entry)}
            onDragOver={(event) => handleDragOver(event, entry)}
            onDragLeave={(event) => handleDragLeave(event, entry)}
            onDrop={(event) => handleDrop(event, entry)}
          />
        ))}
      </div>
    </div>
  );
};

export default Explorer;
