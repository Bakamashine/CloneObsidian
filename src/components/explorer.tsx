import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  type DraggingPosition,
  type TreeItem,
  type TreeItemIndex,
  type TreeViewState,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import FileEntry from "../interface/FileEntry";
import { ChevronRightIcon, FileIcon, FolderIcon } from "./icons";

const TREE_ID = "vault";
const ROOT_ID = "root";
const EMPTY_SET = new Set<string>();

type VaultTreeItem = TreeItem<FileEntry>;

const dirname = (path: string) => {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
};

const buildItems = (entries: FileEntry[]) => {
  const items: Record<TreeItemIndex, VaultTreeItem> = {
    [ROOT_ID]: {
      index: ROOT_ID,
      isFolder: true,
      children: [],
      canMove: false,
      canRename: false,
      data: { name: "", kind: "folder", path: "" },
    },
  };

  const parents: string[] = [ROOT_ID];

  for (const entry of entries) {
    const depth = entry.depth ?? 0;
    if (depth + 1 < parents.length) parents.length = depth + 1;

    const parent = parents[depth] ?? ROOT_ID;
    const item: VaultTreeItem = {
      index: entry.path,
      isFolder: entry.kind === "folder",
      canMove: true,
      canRename: true,
      data: entry,
    };

    if (entry.kind === "folder") {
      item.children = [];
      parents[depth + 1] = entry.path;
    }

    items[entry.path] = item;
    items[parent].children = [...(items[parent].children ?? []), entry.path];
  }

  return items;
};

type ExplorerProps = {
  entries?: FileEntry[];
  currentFile: string | null;
  selectedPaths: Set<string>;
  cutPaths?: Set<string>;
  onSelectionChange: (paths: Set<string>) => void;
  onOpenEntry: (entry: FileEntry) => void;
  onMoveEntries: (sourcePaths: string[], targetDir: string) => void;
  onRenameEntry: (entry: FileEntry, name: string) => void;
  onListContextMenu: (event: MouseEvent) => void;
  onEntryContextMenu: (event: MouseEvent, entry: FileEntry) => void;
};

const Explorer = ({
  entries,
  currentFile,
  selectedPaths,
  cutPaths = EMPTY_SET,
  onSelectionChange,
  onOpenEntry,
  onMoveEntries,
  onRenameEntry,
  onListContextMenu,
  onEntryContextMenu,
}: ExplorerProps) => {
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();

  const items = useMemo(() => buildItems(entries ?? []), [entries]);

  const selectedItems = useMemo(() => Array.from(selectedPaths), [selectedPaths]);
  const expanded = useMemo(
    () => expandedItems.filter((index) => items[index]?.isFolder),
    [expandedItems, items],
  );
  const focused = focusedItem && items[focusedItem] ? focusedItem : undefined;

  const viewState: TreeViewState = {
    [TREE_ID]: { selectedItems, expandedItems: expanded, focusedItem: focused },
  };

  const targetDirForDrop = (target: DraggingPosition) => {
    if (target.targetType === "item") {
      const item = items[target.targetItem];
      if (!item) return "";
      return item.isFolder ? item.data.path : dirname(item.data.path);
    }
    if (target.targetType === "between-items") {
      const parent = items[target.parentItem];
      return parent && parent.index !== ROOT_ID ? parent.data.path : "";
    }
    return "";
  };

  return (
    <div className="explorer">
      <div className="explorer__header">
        <span className="explorer__title">Files</span>
      </div>

      <div
        className="explorer__list"
        onContextMenu={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            onListContextMenu(event);
          }
        }}
      >
        <div className="explorer-tree">
          <ControlledTreeEnvironment<FileEntry>
            items={items}
            viewState={viewState}
            getItemTitle={(item) => item.data.name}
            canDragAndDrop
            canDropOnFolder
            canDropOnNonFolder={false}
            canReorderItems={false}
            canRename
            onSelectItems={(indexes) =>
              onSelectionChange(new Set(indexes.map(String)))
            }
            onFocusItem={(item) => setFocusedItem(item.index)}
            onExpandItem={(item) =>
              setExpandedItems((prev) =>
                prev.includes(item.index) ? prev : [...prev, item.index],
              )
            }
            onCollapseItem={(item) =>
              setExpandedItems((prev) =>
                prev.filter((index) => index !== item.index),
              )
            }
            onPrimaryAction={(item) => {
              if (item.data.kind === "file") onOpenEntry(item.data);
            }}
            onDrop={(dragged, target) => {
              const sourcePaths = dragged
                .map((item) => item.data.path)
                .filter(Boolean);
              if (sourcePaths.length) {
                onMoveEntries(sourcePaths, targetDirForDrop(target));
              }
            }}
            onRenameItem={(item, name) => onRenameEntry(item.data, name)}
            renderItemArrow={({ item, context }) =>
              item.isFolder ? (
                <div
                  {...context.arrowProps}
                  className={[
                    "rct-tree-item-arrow",
                    "rct-tree-item-arrow-isFolder",
                    "explorer-tree__arrow",
                    context.isExpanded
                      ? "rct-tree-item-arrow-expanded"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <ChevronRightIcon size={12} className="file-item__chevron" />
                </div>
              ) : (
                <span className="explorer-tree__arrow-spacer" />
              )
            }
            renderItemTitle={({ title, item }) => {
              const entry = item.data;
              const isCut = cutPaths.has(entry.path);
              const isCurrent = entry.path === currentFile;

              return (
                <span
                  className={[
                    "explorer-entry",
                    isCut ? "explorer-entry--cut" : "",
                    isCurrent ? "explorer-entry--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!selectedPaths.has(entry.path)) {
                      onSelectionChange(new Set([entry.path]));
                    }
                    onEntryContextMenu(event, entry);
                  }}
                >
                  <span className="explorer-entry__icon">
                    {entry.kind === "folder" ? (
                      <FolderIcon size={14} />
                    ) : (
                      <FileIcon size={14} />
                    )}
                  </span>
                  <span className="explorer-entry__name">{title}</span>
                </span>
              );
            }}
            renderTreeContainer={({ children, containerProps, info }) => (
              <div
                className={[
                  "rct-tree-root",
                  info.isFocused ? "rct-tree-root-focus" : "",
                  info.isRenaming ? "rct-tree-root-renaming" : "",
                  info.areItemsSelected ? "rct-tree-root-itemsselected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--rct-item-height": "26px",
                  } as CSSProperties
                }
              >
                <div
                  {...containerProps}
                  style={{ minHeight: 30, ...containerProps.style }}
                >
                  {children}
                </div>
              </div>
            )}
          >
            <Tree
              treeId={TREE_ID}
              rootItem={ROOT_ID}
              treeLabel="Vault files"
            />
          </ControlledTreeEnvironment>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
