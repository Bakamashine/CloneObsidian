import {
  CloseIcon,
  FileIcon,
  MaximizeIcon,
  MinimizeIcon,
  MoreIcon,
} from './icons';

const Header = () => {
  return (
    <header className="header">
      <div className="header__tab">
        <span className="header__tab-icon">
          <FileIcon size={14} />
        </span>
        <span className="header__tab-title">Welcome</span>
        <button className="header__tab-close" type="button">
          <CloseIcon size={12} />
        </button>
      </div>

      <div className="header__right">
        <button className="icon-button" type="button">
          <MoreIcon size={16} />
        </button>
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
