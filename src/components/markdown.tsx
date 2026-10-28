import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeBlock from "../helper/CodeBlock";

type MarkdownProps = {
  content: string;
};

const Markdown = ({ content }: MarkdownProps) => (
  <article className="markdown-viewer">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{ pre: CodeBlock }}
    >
      {content}
    </ReactMarkdown>
  </article>
);

export default Markdown;
