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
      return `<span style="color:red">${formula}</span>`;
    }
  }, [formula, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
