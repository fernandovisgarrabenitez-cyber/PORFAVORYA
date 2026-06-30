import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

interface MathProps {
  formula: string;
  display?: boolean;
  className?: string;
}

export function Math({ formula, display = false, className = "" }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: display,
        output: "html",
      });
    } catch {
      // A03: Escape raw input — never inject user strings directly into HTML
      const safe = formula
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
      return `<span class="text-destructive text-xs font-mono">[Error: ${safe}]</span>`;
    }
  }, [formula, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
