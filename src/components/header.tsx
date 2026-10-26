import { useNavigate } from "react-router-dom";
import { useTabs } from "../tabs";
import HeaderTab from "./header-tab";
import { CloseIcon, MaximizeIcon, MinimizeIcon } from "./icons";
import ThemeToggle from "./theme-toggle";

const WELCOME_TAB = { name: "Welcome", path: "" };

const Header = () => {
  const { tabs, currentFile, closeTab, closeAllTabs, setCurrentFile } =
    useTabs();
  const navigate = useNavigate();

  const selectTab = (path: string) => {
    setCurrentFile(path);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__tabs">
        {tabs.length === 0 && (
          <HeaderTab tab={WELCOME_TAB} active closable={false} />
        )}
        {tabs.map((tab) => (
          <HeaderTab
            key={tab.path}
            tab={tab}
            active={tab.path === currentFile}
            onSelect={() => selectTab(tab.path)}
            onClose={() => closeTab(tab.path)}
          />
        ))}
        {tabs.length > 0 && (
          <button
            className="icon-button header__close-all"
            type="button"
            title="Close all tabs"
            onClick={closeAllTabs}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      <div className="header__right">
        <ThemeToggle />
        {/* <button className="icon-button" type="button">
          <MoreIcon size={16} />
        </button> */}
        <div className="window-controls">
          <button
            className="window-control"
            type="button"
            onClick={() => window.windowControls.minimize()}
          >
            <MinimizeIcon size={14} />
          </button>
          <button
            className="window-control"
            type="button"
            onClick={() => window.windowControls.maximize()}
          >
            <MaximizeIcon size={12} />
          </button>
          <button
            className="window-control window-control--close"
            type="button"
            onClick={() => window.windowControls.close()}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
