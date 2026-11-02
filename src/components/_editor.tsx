import { Editor, type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import {
  deleteEditorBuffer,
  getEditorBuffer,
  setEditorBuffer,
} from "../editor-buffers";
import { useTheme } from "../theme";
import { useTabs } from "../tabs";
import { SaveIcon, RestoreIcon } from "./icons";
import Markdown from "./markdown";

interface _EditorProps {
  fpfile: string;
  initialLine?: number;
}

const EDITOR_OPTIONS = {
  fontFamily: "'Roboto', 'Segoe UI', sans-serif",
};

const _Editor = ({ fpfile, initialLine }: _EditorProps) => {
  const { theme } = useTheme();
  const { viewMode, setViewMode } = useTabs();
  const cached = getEditorBuffer(fpfile);
  const [text, setText] = useState(cached?.text ?? "");
  const [savedText, setSavedText] = useState(cached?.savedText ?? "");
  const [loading, setLoading] = useState(!cached);

  const isDirty = text !== savedText;

  const save = useCallback(async () => {
    if (!isDirty) return;

    try {
      await window.userFiles.saveText(fpfile, text);
      setSavedText(text);

      const buffer = getEditorBuffer(fpfile);
      if (buffer?.text === text) {
        deleteEditorBuffer(fpfile);
      } else if (buffer) {
        setEditorBuffer(fpfile, { ...buffer, savedText: text });
      }
    } catch (error) {
      console.error("Failed to save file", error);
    }
  }, [fpfile, isDirty, text]);

  const restore = useCallback(() => {
    setText(savedText);
    deleteEditorBuffer(fpfile);
  }, [fpfile, savedText]);

  const handleEditorMount = useCallback<OnMount>(
    (editor) => {
      if (!initialLine) return;
      editor.setPosition({ lineNumber: initialLine, column: 1 });
      editor.revealLineInCenter(initialLine);
      editor.focus();
    },
    [initialLine],
  );

  useEffect(() => {
    const buffer = getEditorBuffer(fpfile);
    if (buffer) {
      setText(buffer.text);
      setSavedText(buffer.savedText);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    window.userFiles
      .getText(fpfile)
      .then((content) => {
        if (cancelled) return;
        const value = content ?? "";
        setText(value);
        setSavedText(value);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setText("");
        setSavedText("");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fpfile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "s" || event.key.toLowerCase() == "ы")) {
        event.preventDefault();
        void save();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [save]);

  if (loading) {
    return <p className="editor__loading">Loading...</p>;
  }

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="editor-toolbar__actions">
          <button
            type="button"
            className={
              isDirty
                ? "editor-toolbar__button editor-toolbar__save editor-toolbar__save--dirty"
                : "editor-toolbar__button editor-toolbar__save"
            }
            title="Save (Ctrl+S)"
            aria-label="Save"
            disabled={!isDirty}
            onClick={() => void save()}
          >
            <SaveIcon size={14} />
            Save
          </button>

          <button
            type="button"
            className="editor-toolbar__button editor-toolbar__restore"
            title="Restore saved version"
            aria-label="Restore saved version"
            disabled={!isDirty}
            onClick={restore}
          >
            <RestoreIcon size={14} />
            Restore
          </button>
        </div>

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
            options={EDITOR_OPTIONS}
            value={text}
            onChange={(value) => {
              const nextText = value ?? "";
              setText(nextText);
              if (nextText === savedText) {
                deleteEditorBuffer(fpfile);
              } else {
                setEditorBuffer(fpfile, { text: nextText, savedText });
              }
            }}
            onMount={handleEditorMount}
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default _Editor;
