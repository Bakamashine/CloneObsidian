import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useTheme } from "../theme";
import { useEffect, useState } from "react";

interface MarkdownProps {
  path?: string;
  content?: string;
}

const Markdown = ({ path, content: initialContent }: MarkdownProps) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(initialContent || "");

  useEffect(() => {
    if (path && !initialContent) {
      try {
        window.userFiles.getText(path).then((d) => {
          setContent(d || "");
        });
      } catch {
        // ignore
      }
    } else if (initialContent !== undefined) {
      setContent(initialContent);
    }
  }, [path, initialContent]);

  return (
    <div
      className="markdown-viewer"
      data-theme={theme}
      style={{
        padding: "48px 96px",
        maxWidth: "900px",
        margin: "0 auto",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
