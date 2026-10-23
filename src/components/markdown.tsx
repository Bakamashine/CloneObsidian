import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  content: string;
};

const Markdown = ({ content }: MarkdownProps) => (
  <article className="markdown-viewer">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {content}
    </ReactMarkdown>
  </article>
);

export default Markdown;
