import type { Tab } from "../tabs";
import { CloseIcon, FileIcon } from "./icons";

export type HeaderTabProps = {
  tab: Tab;
  active?: boolean;
  closable?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
};

const HeaderTab = ({
  tab,
  active = false,
  closable = true,
  onSelect,
  onClose,
}: HeaderTabProps) => (
  <div
    className={active ? "header__tab header__tab--active" : "header__tab"}
    onClick={onSelect}
  >
    <span className="header__tab-icon">
      <FileIcon size={14} />
    </span>
    <span className="header__tab-title">{tab.name}</span>
    {closable && (
      <button
        className="header__tab-close"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose?.();
        }}
      >
        <CloseIcon size={12} />
      </button>
    )}
  </div>
);

export default HeaderTab;
