import { type MouseEvent } from "react";
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
  onClick?: () => void;
  onContextMenu: (event: MouseEvent) => void;
};

const FileItem = ({ entry, active, onClick, onContextMenu }: FileItemProps) => (
  <div
    onClick={onClick}
    onContextMenu={onContextMenu}
    className={[
      "file-item",
      entry.depth ? `file-item--depth-${entry.depth}` : "",
      active ? "file-item--active" : "",
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
}: ExplorerProps) => (
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
      {entries?.map((entry) => (
        <FileItem
          key={entry.path}
          entry={entry}
          active={entry.path === currentFile}
          onClick={() => onSelectEntry(entry)}
          onContextMenu={(event) => onEntryContextMenu(event, entry)}
        />
      ))}
    </div>
  </div>
);

export default Explorer;
