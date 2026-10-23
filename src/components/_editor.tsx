import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useTheme } from "../theme";

interface _EditorProps {
  fpfile: string;
}

type ViewMode = "edit" | "preview";

const _Editor = ({ fpfile }: _EditorProps) => {
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("preview");

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
              view === "edit"
                ? "editor-toolbar__button editor-toolbar__button--active"
                : "editor-toolbar__button"
            }
            onClick={() => setView("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={
              view === "preview"
                ? "editor-toolbar__button editor-toolbar__button--active"
                : "editor-toolbar__button"
            }
            onClick={() => setView("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-pane__body">
        {view === "preview" ? (
          <article className="markdown-viewer">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {text}
            </ReactMarkdown>
          </article>
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
