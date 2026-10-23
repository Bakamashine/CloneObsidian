import { useState, type MouseEvent } from "react";
import FileEntry from "../interface/FileEntry";
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  PlusIcon,
} from "./icons";

type FileItemProps = {
  entry: FileEntry;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  onContextMenu: (event: MouseEvent) => void;
};

const FileItem = ({
  entry,
  active,
  collapsed,
  onClick,
  onContextMenu,
}: FileItemProps) => (
  <div
    onClick={onClick}
    onContextMenu={onContextMenu}
    className={[
      "file-item",
      entry.depth ? `file-item--depth-${entry.depth}` : "",
      active ? "file-item--active" : "",
      collapsed ? "file-item--collapsed" : "",
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
  let hiddenBelow: number | null = null;

  for (const entry of entries) {
    const depth = entry.depth ?? 0;
    if (hiddenBelow !== null) {
      if (depth > hiddenBelow) continue;
      hiddenBelow = null;
    }
    if (depth > 0 && !expanded.has(ancestors[depth - 1])) {
      hiddenBelow = depth - 1;
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
  onNewFile: () => void;
  onSelectEntry: (entry: FileEntry) => void;
  onListContextMenu: (event: MouseEvent) => void;
  onEntryContextMenu: (event: MouseEvent, entry: FileEntry) => void;
};

const Explorer = ({
  entries,
  currentFile,
  onNewFile,
  onSelectEntry,
  onListContextMenu,
  onEntryContextMenu,
}: ExplorerProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const visible = entries ? filterVisible(entries, expanded) : entries;

  return (
    <div className="explorer">
      <div className="explorer__header">
        <span className="explorer__title">Files</span>
        <button
          className="icon-button"
          type="button"
          title="New note"
          onClick={onNewFile}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      <div className="explorer__list" onContextMenu={onListContextMenu}>
        {visible?.map((entry) => (
          <FileItem
            key={entry.path}
            entry={entry}
            active={entry.path === currentFile}
            collapsed={entry.kind === "folder" && !expanded.has(entry.path)}
            onClick={() =>
              entry.kind === "folder"
                ? toggleFolder(entry.path)
                : onSelectEntry(entry)
            }
            onContextMenu={(event) => onEntryContextMenu(event, entry)}
          />
        ))}
      </div>
    </div>
  );
};

export default Explorer;
