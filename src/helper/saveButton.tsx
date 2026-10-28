import { isValidElement, ReactNode, useState } from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

const CodeBlock = ({ children }: { children?: ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const codeText = extractText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Coping is not allowed", err);
    }
  };

  return (
    <div className="markdown-code-block">
      <button
        type="button"
        className="markdown-code-block__copy"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre>{children}</pre>
    </div>
  );
};

export default CodeBlock;
