import { useLocation, useNavigate } from "react-router-dom";
import { BookIcon, SearchIcon, TagIcon } from "./icons";
import ThemeToggle from "./theme-toggle";

const Ribbon = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="ribbon">
      <button
        className={
          pathname === "/"
            ? "ribbon__button ribbon__button--active"
            : "ribbon__button"
        }
        type="button"
        title="Files"
        onClick={() => navigate("/")}
      >
        <BookIcon />
      </button>
      <button
        className={
          pathname === "/search"
            ? "ribbon__button ribbon__button--active"
            : "ribbon__button"
        }
        type="button"
        title="Search notes (Ctrl+Shift+F)"
        onClick={() => navigate("/search")}
      >
        <SearchIcon />
      </button>
      <button className="ribbon__button" type="button" title="Tags">
        <TagIcon />
      </button>
      <div className="ribbon__spacer" />
      <button
        className="ribbon__button"
        type="button"
        title="Push"
        onClick={window.sync.push}
      ></button>
      <button
        className="ribbon__button"
        type="button"
        title="Pull"
        onClick={window.sync.pull}
      ></button>
      <button
        className="ribbon__button"
        type="button"
        title="Clone"
        onClick={window.sync.clone}
      ></button>
      <ThemeToggle className="ribbon__button" />
    </nav>
  );
};

export default Ribbon;
