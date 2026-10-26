import { useCallback, useState, type MouseEvent } from "react";
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

const Sidebar = () => {
  const { entries, createItem, deleteItem } = useFileEntries();
  const { openTab, currentFile } = useTabs();
  const { menu, openAt, close } = useContextMenu();
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState<CreateItemModalState | null>(
    null,
  );
  const closeCreateModal = useCallback(() => setCreateModal(null), []);

  const newFile = () => setCreateModal({ kind: "file" });

  const getParentPath = (entry: FileEntry) => {
    if (entry.kind === "folder") return entry.path;
    const index = entry.path.lastIndexOf("/");
    return index === -1 ? undefined : entry.path.slice(0, index);
  };

  const selectEntry = (entry: FileEntry) => {
    if (entry.kind === "file") {
      openTab({ name: entry.name, path: entry.path });
      navigate("/");
    }
  };

  const openContextMenu = (event: MouseEvent, entry?: FileEntry) => {
    const parentPath = entry ? getParentPath(entry) : undefined;
    const items: ContextMenuItem[] = [
      {
        label: "New File",
        onSelect: () => setCreateModal({ kind: "file", parentPath }),
      },
      {
        label: "New Folder",
        onSelect: () => setCreateModal({ kind: "folder", parentPath }),
      },
    ];

    if (entry) {
      items.push(
        { separator: true },
        {
          label: entry.kind === "folder" ? "Delete Folder" : "Delete File",
          danger: true,
          onSelect: () => deleteItem(entry.kind, entry.path),
        },
      );
    }

    openAt(event, items);
  };

  return (
    <div className="sidebar">
      <Ribbon />
      <Explorer
        entries={entries}
        currentFile={currentFile}
        onNewFile={newFile}
        onSelectEntry={selectEntry}
        onListContextMenu={(event) => openContextMenu(event)}
        onEntryContextMenu={openContextMenu}
      />
      <ContextMenu state={menu} onClose={close} />
      <CreateItemModal
        state={createModal}
        onCreate={(name) => {
          if (!createModal) return;
          const target = createModal.parentPath
            ? `${createModal.parentPath}/${name}`
            : name;
          createItem(createModal.kind, target);
        }}
        onClose={closeCreateModal}
      />
    </div>
  );
};

export default Sidebar;
