import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

export type ContextMenuItem =
  | { label: string; danger?: boolean; onSelect?: () => void }
  | { separator: true };

export type ContextMenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
};

type ContextMenuProps = {
  state: ContextMenuState | null;
  onClose: () => void;
};

const ContextMenu = ({ state, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!state) return;
    setPosition({ x: state.x, y: state.y });

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, onClose]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!state || !menu) return;

    const left = Math.max(
      4,
      Math.min(state.x, window.innerWidth - menu.offsetWidth - 4),
    );
    const top = Math.max(
      4,
      Math.min(state.y, window.innerHeight - menu.offsetHeight - 4),
    );
    setPosition({ x: left, y: top });
  }, [state]);

  if (!state) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      {state.items.map((item, index) =>
        "separator" in item ? (
          <div
            key={index}
            className="context-menu__separator"
            role="separator"
          />
        ) : (
          <button
            key={index}
            className={
              item.danger
                ? "context-menu__item context-menu__item--danger"
                : "context-menu__item"
            }
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect?.();
              onClose();
            }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
};

export const useContextMenu = () => {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const openAt = (event: ReactMouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({ x: event.clientX, y: event.clientY, items });
  };

  const close = useCallback(() => setMenu(null), []);

  return { menu, openAt, close };
};

export default ContextMenu;
