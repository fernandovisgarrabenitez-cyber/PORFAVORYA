// ══════════════════════════════════════════════════════════
// EXERCISE DATA + STEP VERIFICATION
// ══════════════════════════════════════════════════════════

export type Difficulty = "easy" | "medium" | "hard";

export type ExerciseStep = {
  id: string;
  instruction: string;   // what the student is asked to write
  hint: string;          // revealed when they click "Pista"
  hintLatex: string;     // LaTeX for the hint (the answer)
  accepted: string[];    // accepted inputs (will be normalized)
  resultLatex: string;   // KaTeX of the expression at this step
  ruleName: string;
};

export type Exercise = {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  lhsLatex: string;
  rhsLatex: string;
  description: string;
  steps: ExerciseStep[];
};

// ── Normalization ─────────────────────────────────────────
export function normalizeInput(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\bsen\b/g, "sin")
    .replace(/\btg\b/g, "tan")
    .replace(/\^2/g, "2")
    .replace(/²/g, "2")
    .replace(/[·×]/g, "*")
    .replace(/\(2x\)/g, "2x")
    .replace(/\(x\)/g, "x");
}

export function checkStep(input: string, step: ExerciseStep): boolean {
  const n = normalizeInput(input);
  return step.accepted.some((a) => normalizeInput(a) === n);
}

// ── Exercises ─────────────────────────────────────────────
export const EXERCISES: Exercise[] = [
  // ─── EASY ───────────────────────────────────────────────
  {
    id: "ex-e1",
    title: "Tangente por Coseno",
    difficulty: "easy",
    category: "Cociente",
    lhsLatex: "\\tan(x) \\cdot \\cos(x)",
    rhsLatex: "\\sin(x)",
    description: "Demuestra que tan(x)·cos(x) = sin(x) transformando el lado izquierdo.",
    steps: [
      {
        id: "s1",
        instruction: "Reemplaza tan(x) por su definición en senos y cosenos.",
        hint: "Escribe: sin(x)/cos(x)*cos(x)",
        hintLatex: "\\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x)",
        accepted: ["sin(x)/cos(x)*cos(x)", "(sin(x)/cos(x))*cos(x)", "sinx/cosx*cosx", "(sinx/cosx)*cosx", "sin(x)cos(x)/cos(x)", "sinxcosx/cosx"],
        resultLatex: "\\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x)",
        ruleName: "Definición de tan(x)",
      },
      {
        id: "s2",
        instruction: "Cancela cos(x). ¿Qué queda?",
        hint: "Escribe: sin(x)",
        hintLatex: "\\sin(x)",
        accepted: ["sin(x)", "sinx"],
        resultLatex: "\\sin(x) \\quad \\checkmark",
        ruleName: "Cancelación",
      },
    ],
  },

  {
    id: "ex-e2",
    title: "Seno entre Tangente",
    difficulty: "easy",
    category: "Cociente",
    lhsLatex: "\\dfrac{\\sin(x)}{\\tan(x)}",
    rhsLatex: "\\cos(x)",
    description: "Simplifica sin(x)/tan(x) hasta obtener cos(x).",
    steps: [
      {
        id: "s1",
        instruction: "Reemplaza tan(x) en el denominador por su definición.",
        hint: "Escribe: sin(x)/(sin(x)/cos(x))",
        hintLatex: "\\frac{\\sin(x)}{\\dfrac{\\sin(x)}{\\cos(x)}}",
        accepted: ["sin(x)/(sin(x)/cos(x))", "sinx/(sinx/cosx)"],
        resultLatex: "\\frac{\\sin(x)}{\\dfrac{\\sin(x)}{\\cos(x)}}",
        ruleName: "Definición de tan(x)",
      },
      {
        id: "s2",
        instruction: "Dividir por una fracción = multiplicar por su inverso. ¿Qué obtienes?",
        hint: "Escribe: sin(x)*cos(x)/sin(x)",
        hintLatex: "\\sin(x) \\cdot \\frac{\\cos(x)}{\\sin(x)}",
        accepted: ["sin(x)*cos(x)/sin(x)", "sinx*cosx/sinx", "sinxcosx/sinx", "sin(x)cos(x)/sin(x)"],
        resultLatex: "\\frac{\\sin(x) \\cdot \\cos(x)}{\\sin(x)}",
        ruleName: "División de fracciones",
      },
      {
        id: "s3",
        instruction: "Cancela sin(x). ¿Qué queda?",
        hint: "Escribe: cos(x)",
        hintLatex: "\\cos(x)",
        accepted: ["cos(x)", "cosx"],
        resultLatex: "\\cos(x) \\quad \\checkmark",
        ruleName: "Cancelación",
      },
    ],
  },

  {
    id: "ex-e3",
    title: "Identidad Fundamental",
    difficulty: "easy",
    category: "Pitagórica",
    lhsLatex: "\\sin^2(x) + \\cos^2(x)",
    rhsLatex: "1",
    description: "Confirma la identidad pitagórica fundamental usando el círculo unitario.",
    steps: [
      {
        id: "s1",
        instruction: "En el círculo unitario, la hipotenusa = 1. Por Pitágoras, ¿a cuánto es igual sin²(x) + cos²(x)?",
        hint: "Escribe: 1",
        hintLatex: "1",
        accepted: ["1"],
        resultLatex: "= 1 \\quad \\checkmark",
        ruleName: "Teorema de Pitágoras en el círculo unitario",
      },
    ],
  },

  // ─── MEDIUM ─────────────────────────────────────────────
  {
    id: "ex-m1",
    title: "Fracción Pitagórica",
    difficulty: "medium",
    category: "Pitagórica",
    lhsLatex: "\\dfrac{1 - \\sin^2(x)}{\\cos(x)}",
    rhsLatex: "\\cos(x)",
    description: "Simplifica la fracción usando la identidad pitagórica.",
    steps: [
      {
        id: "s1",
        instruction: "1 − sin²(x) = ¿? (usa la identidad pitagórica). Escribe la fracción resultante.",
        hint: "Escribe: cos^2(x)/cos(x)",
        hintLatex: "\\frac{\\cos^2(x)}{\\cos(x)}",
        accepted: ["cos^2(x)/cos(x)", "cos2(x)/cos(x)", "cos2x/cosx", "cos^2x/cosx"],
        resultLatex: "\\frac{\\cos^2(x)}{\\cos(x)}",
        ruleName: "Identidad Pitagórica: 1 − sin²(x) = cos²(x)",
      },
      {
        id: "s2",
        instruction: "Simplifica cos²(x)/cos(x). ¿Qué obtienes?",
        hint: "Escribe: cos(x)",
        hintLatex: "\\cos(x)",
        accepted: ["cos(x)", "cosx"],
        resultLatex: "\\cos(x) \\quad \\checkmark",
        ruleName: "Simplificación de potencias",
      },
    ],
  },

  {
    id: "ex-m2",
    title: "Secante menos Coseno",
    difficulty: "medium",
    category: "Recíproca",
    lhsLatex: "\\sec(x) - \\cos(x)",
    rhsLatex: "\\sin(x)\\tan(x)",
    description: "Transforma el lado izquierdo paso a paso hasta llegar a sin(x)tan(x).",
    steps: [
      {
        id: "s1",
        instruction: "Convierte sec(x) a 1/cos(x). Escribe la expresión resultante.",
        hint: "Escribe: 1/cos(x)-cos(x)",
        hintLatex: "\\frac{1}{\\cos(x)} - \\cos(x)",
        accepted: ["1/cos(x)-cos(x)", "1/cosx-cosx"],
        resultLatex: "\\frac{1}{\\cos(x)} - \\cos(x)",
        ruleName: "sec(x) = 1/cos(x)",
      },
      {
        id: "s2",
        instruction: "Resta las fracciones con denominador común cos(x). ¿Qué obtienes en el numerador?",
        hint: "Escribe: (1-cos^2(x))/cos(x)",
        hintLatex: "\\frac{1 - \\cos^2(x)}{\\cos(x)}",
        accepted: ["(1-cos^2(x))/cos(x)", "(1-cos2(x))/cos(x)", "(1-cos2x)/cosx", "(1-cos^2x)/cosx"],
        resultLatex: "\\frac{1 - \\cos^2(x)}{\\cos(x)}",
        ruleName: "Denominador común cos(x)",
      },
      {
        id: "s3",
        instruction: "1 − cos²(x) = ¿? (usa Pitágoras). Escribe la fracción resultante.",
        hint: "Escribe: sin^2(x)/cos(x)",
        hintLatex: "\\frac{\\sin^2(x)}{\\cos(x)}",
        accepted: ["sin^2(x)/cos(x)", "sin2(x)/cos(x)", "sin2x/cosx", "sin^2x/cosx"],
        resultLatex: "\\frac{\\sin^2(x)}{\\cos(x)}",
        ruleName: "1 − cos²(x) = sin²(x)",
      },
      {
        id: "s4",
        instruction: "Escribe sin²(x)/cos(x) como sin(x)·(sin(x)/cos(x)). ¿Cuál es el resultado final?",
        hint: "Escribe: sin(x)tan(x)",
        hintLatex: "\\sin(x)\\tan(x)",
        accepted: ["sin(x)tan(x)", "sinxtanx", "sin(x)*tan(x)"],
        resultLatex: "\\sin(x)\\tan(x) \\quad \\checkmark",
        ruleName: "sin(x)/cos(x) = tan(x)",
      },
    ],
  },

  {
    id: "ex-m3",
    title: "Seno de Ángulo Doble",
    difficulty: "medium",
    category: "Ángulo Doble",
    lhsLatex: "\\sin(2x)",
    rhsLatex: "2\\sin(x)\\cos(x)",
    description: "Demuestra la fórmula del seno del ángulo doble usando la fórmula de suma.",
    steps: [
      {
        id: "s1",
        instruction: "Escribe sin(2x) = sin(x+x) y aplica la fórmula de suma: sin(A+B) = sinAcosB + cosAsinB.",
        hint: "Escribe: sin(x)cos(x)+cos(x)sin(x)",
        hintLatex: "\\sin(x)\\cos(x) + \\cos(x)\\sin(x)",
        accepted: ["sin(x)cos(x)+cos(x)sin(x)", "sinxcosx+cosxsinx", "sin(x)*cos(x)+cos(x)*sin(x)"],
        resultLatex: "\\sin(x)\\cos(x) + \\cos(x)\\sin(x)",
        ruleName: "Fórmula de suma: sin(x+x)",
      },
      {
        id: "s2",
        instruction: "Ambos términos son iguales. Combínalos. ¿Qué obtienes?",
        hint: "Escribe: 2sin(x)cos(x)",
        hintLatex: "2\\sin(x)\\cos(x)",
        accepted: ["2sin(x)cos(x)", "2sinxcosx", "2*sin(x)*cos(x)", "2*sinx*cosx"],
        resultLatex: "2\\sin(x)\\cos(x) \\quad \\checkmark",
        ruleName: "Suma de términos iguales",
      },
    ],
  },

  // ─── HARD ───────────────────────────────────────────────
  {
    id: "ex-h1",
    title: "Tangente más Cotangente",
    difficulty: "hard",
    category: "Recíproca",
    lhsLatex: "\\tan(x) + \\cot(x)",
    rhsLatex: "\\sec(x)\\csc(x)",
    description: "Demuestra esta identidad recíproca en 4 pasos. Requiere manejo de fracciones y la identidad pitagórica.",
    steps: [
      {
        id: "s1",
        instruction: "Convierte tan(x) y cot(x) a senos y cosenos. Escribe la suma de fracciones.",
        hint: "Escribe: sin(x)/cos(x)+cos(x)/sin(x)",
        hintLatex: "\\frac{\\sin(x)}{\\cos(x)} + \\frac{\\cos(x)}{\\sin(x)}",
        accepted: ["sin(x)/cos(x)+cos(x)/sin(x)", "sinx/cosx+cosx/sinx"],
        resultLatex: "\\frac{\\sin(x)}{\\cos(x)} + \\frac{\\cos(x)}{\\sin(x)}",
        ruleName: "Definiciones de tan y cot",
      },
      {
        id: "s2",
        instruction: "Suma las fracciones con denominador común cos(x)sin(x). ¿Cuál es el numerador?",
        hint: "Escribe: (sin^2(x)+cos^2(x))/(cos(x)sin(x))",
        hintLatex: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos(x)\\sin(x)}",
        accepted: ["(sin^2(x)+cos^2(x))/(cos(x)sin(x))", "(sin2x+cos2x)/(cosxsinx)", "(sin^2x+cos^2x)/(cosxsinx)"],
        resultLatex: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos(x)\\sin(x)}",
        ruleName: "Suma con denominador común",
      },
      {
        id: "s3",
        instruction: "Aplica sin²(x)+cos²(x)=1 en el numerador. ¿Qué queda?",
        hint: "Escribe: 1/(cos(x)sin(x))",
        hintLatex: "\\frac{1}{\\cos(x)\\sin(x)}",
        accepted: ["1/(cos(x)sin(x))", "1/(cosxsinx)", "1/cos(x)sin(x)", "1/cosxsinx"],
        resultLatex: "\\frac{1}{\\cos(x)\\sin(x)}",
        ruleName: "sin²(x) + cos²(x) = 1",
      },
      {
        id: "s4",
        instruction: "1/cos(x) = sec(x) y 1/sin(x) = csc(x). Escribe el resultado final.",
        hint: "Escribe: sec(x)csc(x)",
        hintLatex: "\\sec(x)\\csc(x)",
        accepted: ["sec(x)csc(x)", "secxcscx", "sec(x)*csc(x)"],
        resultLatex: "\\sec(x)\\csc(x) \\quad \\checkmark",
        ruleName: "Identidades recíprocas",
      },
    ],
  },

  {
    id: "ex-h2",
    title: "Coseno Doble — Forma Alternativa",
    difficulty: "hard",
    category: "Ángulo Doble",
    lhsLatex: "\\cos(2x)",
    rhsLatex: "1 - 2\\sin^2(x)",
    description: "Demuestra la segunda forma del coseno doble. Requiere combinar cos(2x)=cos²x−sin²x con la identidad pitagórica.",
    steps: [
      {
        id: "s1",
        instruction: "Empieza con la forma cos²(x)−sin²(x) del ángulo doble. Escríbela.",
        hint: "Escribe: cos^2(x)-sin^2(x)",
        hintLatex: "\\cos^2(x) - \\sin^2(x)",
        accepted: ["cos^2(x)-sin^2(x)", "cos2x-sin2x", "cos2(x)-sin2(x)", "cos^2x-sin^2x"],
        resultLatex: "\\cos^2(x) - \\sin^2(x)",
        ruleName: "Forma 1: cos(2x) = cos²x − sin²x",
      },
      {
        id: "s2",
        instruction: "Reemplaza cos²(x) por (1−sin²(x)). Escribe la expresión completa.",
        hint: "Escribe: (1-sin^2(x))-sin^2(x)",
        hintLatex: "(1 - \\sin^2(x)) - \\sin^2(x)",
        accepted: ["(1-sin^2(x))-sin^2(x)", "(1-sin2x)-sin2x", "(1-sin2(x))-sin2(x)", "1-sin^2(x)-sin^2(x)", "1-sin2x-sin2x"],
        resultLatex: "(1 - \\sin^2(x)) - \\sin^2(x)",
        ruleName: "cos²(x) = 1 − sin²(x)",
      },
      {
        id: "s3",
        instruction: "Combina los dos términos con sin²(x). ¿Cuál es el resultado?",
        hint: "Escribe: 1-2sin^2(x)",
        hintLatex: "1 - 2\\sin^2(x)",
        accepted: ["1-2sin^2(x)", "1-2sin2x", "1-2sin2(x)", "1-2sin^2x"],
        resultLatex: "1 - 2\\sin^2(x) \\quad \\checkmark",
        ruleName: "Simplificación",
      },
    ],
  },

  {
    id: "ex-h3",
    title: "Identidad de la Tangente al Cuadrado",
    difficulty: "hard",
    category: "Pitagórica",
    lhsLatex: "1 + \\tan^2(x)",
    rhsLatex: "\\sec^2(x)",
    description: "Demuestra esta identidad dividiendo la ecuación fundamental entre cos²(x).",
    steps: [
      {
        id: "s1",
        instruction: "Toma sin²(x)+cos²(x)=1 y divide todo entre cos²(x). Escribe el lado izquierdo después de dividir.",
        hint: "Escribe: sin^2(x)/cos^2(x)+1",
        hintLatex: "\\frac{\\sin^2(x)}{\\cos^2(x)} + 1",
        accepted: ["sin^2(x)/cos^2(x)+1", "sin2x/cos2x+1", "sin^2x/cos^2x+1", "1+sin^2(x)/cos^2(x)", "1+sin2x/cos2x"],
        resultLatex: "\\frac{\\sin^2(x)}{\\cos^2(x)} + 1",
        ruleName: "División de ambos lados entre cos²(x)",
      },
      {
        id: "s2",
        instruction: "sin²(x)/cos²(x) = [tan(x)]². Reescribe la expresión.",
        hint: "Escribe: tan^2(x)+1",
        hintLatex: "\\tan^2(x) + 1",
        accepted: ["tan^2(x)+1", "tan2x+1", "1+tan^2(x)", "1+tan2x"],
        resultLatex: "\\tan^2(x) + 1",
        ruleName: "sin(x)/cos(x) = tan(x)",
      },
      {
        id: "s3",
        instruction: "El lado derecho 1/cos²(x) equivale a ¿qué función? Escribe el resultado final.",
        hint: "Escribe: sec^2(x)",
        hintLatex: "\\sec^2(x)",
        accepted: ["sec^2(x)", "sec2x", "sec2(x)", "sec^2x"],
        resultLatex: "= \\sec^2(x) \\quad \\checkmark",
        ruleName: "1/cos²(x) = sec²(x)",
      },
    ],
  },
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  medium: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  hard: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
};
