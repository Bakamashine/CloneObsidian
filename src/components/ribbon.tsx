import {
  BookIcon,
  FileIcon,
  SearchIcon,
  SettingsIcon,
  TagIcon,
} from "./icons";
import ThemeToggle from "./theme-toggle";

const Ribbon = () => (
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
    <ThemeToggle className="ribbon__button" />
    <button className="ribbon__button" type="button">
      <SettingsIcon />
    </button>
  </nav>
);

export default Ribbon;
