import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { useTabs } from "../tabs";
import Markdown from "./markdown";

interface _EditorProps {
  fpfile: string;
}

const _Editor = ({ fpfile }: _EditorProps) => {
  const { theme } = useTheme();
  const { viewMode, setViewMode } = useTabs();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    window.userFiles
      .getText(fpfile)
      .then((content) => {
        if (cancelled) return;
        setText(content ?? "");
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setText("");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fpfile]);

  if (loading) {
    return <p className="editor__loading">Loading...</p>;
  }

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="editor-toolbar__view">
          <button
            type="button"
            className={
              viewMode === "edit"
                ? "editor-toolbar__button editor-toolbar__button--active"
                : "editor-toolbar__button"
            }
            onClick={() => setViewMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={
              viewMode === "preview"
                ? "editor-toolbar__button editor-toolbar__button--active"
                : "editor-toolbar__button"
            }
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-pane__body">
        {viewMode === "preview" ? (
          <Markdown content={text} />
        ) : (
          <Editor
            theme={theme === "dark" ? "vs-dark" : "vs"}
            defaultLanguage="markdown"
            value={text}
            onChange={(value) => setText(value ?? "")}
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default _Editor;
