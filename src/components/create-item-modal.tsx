import { useEffect, useRef, useState } from "react";

export type CreateItemKind = "file" | "folder";

export type CreateItemModalState = {
  kind: CreateItemKind;
  parentPath?: string;
};

type CreateItemModalProps = {
  state: CreateItemModalState | null;
  onCreate: (name: string) => void;
  onClose: () => void;
};

const CreateItemModal = ({ state, onCreate, onClose }: CreateItemModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!state) return;
    setValue("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, onClose]);

  if (!state) return null;

  const title = state.kind === "file" ? "New file" : "New folder";
  const trimmed = value.trim();

  const submit = () => {
    if (!trimmed) return;
    onCreate(trimmed);
    onClose();
  };

  return (
    <div className="modal" role="presentation">
      <div className="modal__backdrop" />
      <div
        ref={panelRef}
        className="modal__panel"
        role="dialog"
        aria-label={title}
      >
        <div className="modal__header">
          <span className="modal__title">{title}</span>
        </div>
        <div className="modal__body">
          <input
            ref={inputRef}
            className="modal__input"
            type="text"
            placeholder={state.kind === "file" ? "Untitled.md" : "Folder name"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
          {state.parentPath && (
            <div className="modal__path">in {state.parentPath}</div>
          )}
        </div>
        <div className="modal__footer">
          <button className="modal__button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal__button modal__button--primary"
            type="button"
            disabled={!trimmed}
            onClick={submit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateItemModal;
