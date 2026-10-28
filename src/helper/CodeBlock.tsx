import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "../theme";

/** Every code fence is rendered with the C++ grammar, whatever the fence says. */
const LANGUAGE = "cpp";

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
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const codeText = extractText(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copying the code block failed", error);
    }
  };

  return (
    <div className="markdown-code-block">
      <button
        type="button"
        className="markdown-code-block__copy"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <SyntaxHighlighter
        language={LANGUAGE}
        style={theme === "dark" ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "14px 16px",
          borderRadius: "6px",
          fontSize: "1em",
          lineHeight: 1.5,
        }}
        wrapLongLines={false}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
