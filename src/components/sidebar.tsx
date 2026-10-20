import { useEffect, useState, type MouseEvent } from 'react';
import FileEntry from '../interface/FileEntry';
import ContextMenu, {
  useContextMenu,
  type ContextMenuItem,
} from './context-menu';
import {
  BookIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TagIcon,
} from './icons';

// const entries: FileEntry[] = [
// { name: 'Welcome.md', kind: 'file' },
// { name: 'Daily Notes', kind: 'folder' },
// { name: '2026-10-20.md', kind: 'file', depth: 1 },
// { name: '2026-10-19.md', kind: 'file', depth: 1 },
// { name: 'Projects', kind: 'folder' },
// { name: 'Obsidian Clone.md', kind: 'file', depth: 1 },
// { name: 'Roadmap.md', kind: 'file', depth: 1 },
// { name: 'Ideas.md', kind: 'file' },
// ];

const Sidebar = () => {
  const [entries, setEntries] = useState<FileEntry[]>();
  const { menu, openAt, close } = useContextMenu();

  useEffect(() => {
    window.userFiles.getFiles().then(setEntries);
  }, []);

  const openContextMenu = (event: MouseEvent, entry?: FileEntry) => {
    const items: ContextMenuItem[] = [
      { label: 'New File' },
      { label: 'New Folder' },
    ];

    if (entry) {
      items.push(
        { separator: true },
        {
          label: entry.kind === 'folder' ? 'Delete Folder' : 'Delete File',
          danger: true,
        },
      );
    }

    openAt(event, items);
  };

  return (
    <div className="sidebar">
      <nav className="ribbon">
        <button className="ribbon__button ribbon__button--active" type="button">
          <BookIcon />
        </button>
        <button className="ribbon__button" type="button">
          <FileIcon />
        </button>
        <button className="ribbon__button" type="button">
          <SearchIcon />
        </button>
        <button className="ribbon__button" type="button">
          <TagIcon />
        </button>
        <div className="ribbon__spacer" />
        <button className="ribbon__button" type="button">
          <SettingsIcon />
        </button>
      </nav>

      <div className="explorer">
        <div className="explorer__header">
          <span className="explorer__title">Files</span>
          <button className="icon-button" type="button" title="New note">
            <PlusIcon size={14} />
          </button>
        </div>

        <div
          className="explorer__list"
          onContextMenu={(event) => openContextMenu(event)}
        >
          {entries?.map((entry) => (
            <div
              key={entry.name}
              onContextMenu={(event) => openContextMenu(event, entry)}
              className={[
                'file-item',
                entry.depth ? `file-item--depth-${entry.depth}` : '',
                entry.name === 'Welcome.md' ? 'file-item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {entry.kind === 'folder' && (
                <ChevronRightIcon size={12} className="file-item__chevron" />
              )}
              <span className="file-item__icon">
                {entry.kind === 'folder' ? (
                  <FolderIcon size={14} />
                ) : (
                  <FileIcon size={14} />
                )}
              </span>
              <span className="file-item__name">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      <ContextMenu state={menu} onClose={close} />
    </div>
  );
};

export default Sidebar;
