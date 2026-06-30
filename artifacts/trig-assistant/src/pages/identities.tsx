import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Lightbulb, Play, RotateCcw, XCircle,
  ArrowRight, BookOpen, AlertCircle
} from "lucide-react";
import { Math as MathRenderer } from "@/components/math-renderer";

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════

type ProofStep = {
  id: string;
  hint: string;
  ruleName: string;
  ruleLatex: string;
  expressionLatex: string;
  explanation: string;
};

type IdentityProof = {
  id: string;
  title: string;
  category: string;
  lhsLatex: string;
  rhsLatex: string;
  /** Normalized alias pairs [lhs_norm, rhs_norm] for input matching */
  aliases: Array<[string, string]>;
  steps: ProofStep[];
};

// ══════════════════════════════════════════════════════════
// IDENTITY LIBRARY  (~15 identities with full guided proofs)
// ══════════════════════════════════════════════════════════

const LIBRARY: IdentityProof[] = [
  // ── Fundamental ──────────────────────────────────────
  {
    id: "pyth-1",
    title: "Identidad Pitagórica Fundamental",
    category: "Pitagórica",
    lhsLatex: "\\sin^2(x) + \\cos^2(x)",
    rhsLatex: "1",
    aliases: [
      ["sin^2(x)+cos^2(x)", "1"],
      ["sin2x+cos2x", "1"],
      ["sen^2(x)+cos^2(x)", "1"],
    ],
    steps: [
      {
        id: "s1", hint: "Esta identidad se demuestra directamente del Teorema de Pitágoras aplicado al círculo unitario.",
        ruleName: "Círculo Unitario",
        ruleLatex: "\\text{Para cualquier punto } (\\cos x, \\sin x) \\text{ en el círculo unitario: } r = 1",
        expressionLatex: "\\sin^2(x) + \\cos^2(x)",
        explanation: "En el círculo unitario, el punto es (cos x, sin x) con radio r = 1.",
      },
      {
        id: "s2", hint: "Aplica el Teorema de Pitágoras: cateto² + cateto² = hipotenusa²",
        ruleName: "Teorema de Pitágoras",
        ruleLatex: "a^2 + b^2 = c^2 \\Rightarrow \\cos^2(x) + \\sin^2(x) = r^2 = 1^2",
        expressionLatex: "= 1 \\quad \\checkmark",
        explanation: "Como r = 1, obtenemos sin²(x) + cos²(x) = 1.",
      },
    ],
  },

  // ── Pythagorean derived ───────────────────────────────
  {
    id: "pyth-2",
    title: "Identidad Pitagórica — Tangente",
    category: "Pitagórica",
    lhsLatex: "1 + \\tan^2(x)",
    rhsLatex: "\\sec^2(x)",
    aliases: [
      ["1+tan^2(x)", "sec^2(x)"],
      ["1+tan2x", "sec2x"],
    ],
    steps: [
      {
        id: "s1", hint: "Parte de la identidad fundamental y divide todo entre cos²(x).",
        ruleName: "Identidad Pitagórica ÷ cos²(x)",
        ruleLatex: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos^2(x)} = \\frac{1}{\\cos^2(x)}",
        expressionLatex: "\\frac{\\sin^2(x)}{\\cos^2(x)} + \\frac{\\cos^2(x)}{\\cos^2(x)}",
        explanation: "Dividimos sin²x + cos²x = 1 entre cos²x en ambos lados.",
      },
      {
        id: "s2", hint: "Simplifica cada fracción usando definiciones.",
        ruleName: "Definiciones de tan y cos",
        ruleLatex: "\\frac{\\sin(x)}{\\cos(x)} = \\tan(x), \\quad \\frac{\\cos^2(x)}{\\cos^2(x)} = 1",
        expressionLatex: "\\tan^2(x) + 1",
        explanation: "sin²x/cos²x = tan²x y cos²x/cos²x = 1.",
      },
      {
        id: "s3", hint: "Aplica la definición de secante al lado derecho.",
        ruleName: "Identidad Recíproca",
        ruleLatex: "\\sec(x) = \\frac{1}{\\cos(x)} \\Rightarrow \\sec^2(x) = \\frac{1}{\\cos^2(x)}",
        expressionLatex: "1 + \\tan^2(x) = \\sec^2(x) \\quad \\checkmark",
        explanation: "1/cos²x = sec²x, confirmando la identidad.",
      },
    ],
  },

  {
    id: "pyth-3",
    title: "Identidad Pitagórica — Cotangente",
    category: "Pitagórica",
    lhsLatex: "1 + \\cot^2(x)",
    rhsLatex: "\\csc^2(x)",
    aliases: [
      ["1+cot^2(x)", "csc^2(x)"],
      ["1+cot2x", "csc2x"],
    ],
    steps: [
      {
        id: "s1", hint: "Parte de la identidad fundamental y divide todo entre sin²(x).",
        ruleName: "Identidad Pitagórica ÷ sin²(x)",
        ruleLatex: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\sin^2(x)} = \\frac{1}{\\sin^2(x)}",
        expressionLatex: "\\frac{\\sin^2(x)}{\\sin^2(x)} + \\frac{\\cos^2(x)}{\\sin^2(x)}",
        explanation: "Dividimos sin²x + cos²x = 1 entre sin²x.",
      },
      {
        id: "s2", hint: "Simplifica usando la definición de cotangente.",
        ruleName: "Definición de cot",
        ruleLatex: "\\frac{\\cos(x)}{\\sin(x)} = \\cot(x)",
        expressionLatex: "1 + \\cot^2(x)",
        explanation: "sin²x/sin²x = 1 y cos²x/sin²x = cot²x.",
      },
      {
        id: "s3", hint: "El lado derecho 1/sin²(x) es la definición de csc²(x).",
        ruleName: "Identidad Recíproca",
        ruleLatex: "\\csc(x) = \\frac{1}{\\sin(x)} \\Rightarrow \\csc^2(x) = \\frac{1}{\\sin^2(x)}",
        expressionLatex: "1 + \\cot^2(x) = \\csc^2(x) \\quad \\checkmark",
        explanation: "1/sin²x = csc²x, identidad demostrada.",
      },
    ],
  },

  // ── Quotient / Basic ──────────────────────────────────
  {
    id: "quot-1",
    title: "Tangente por Coseno",
    category: "Cociente",
    lhsLatex: "\\tan(x) \\cdot \\cos(x)",
    rhsLatex: "\\sin(x)",
    aliases: [
      ["tan(x)*cos(x)", "sin(x)"],
      ["tan(x)cos(x)", "sin(x)"],
      ["tanxcosx", "sinx"],
    ],
    steps: [
      {
        id: "s1", hint: "Convierte tan(x) usando su definición en senos y cosenos.",
        ruleName: "Definición de tan",
        ruleLatex: "\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}",
        expressionLatex: "\\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x)",
        explanation: "Sustituimos tan(x) = sin(x)/cos(x).",
      },
      {
        id: "s2", hint: "Cancela el cos(x) del numerador con el del denominador.",
        ruleName: "Cancelación",
        ruleLatex: "\\frac{\\sin(x)}{\\cancel{\\cos(x)}} \\cdot \\cancel{\\cos(x)}",
        expressionLatex: "\\sin(x) \\quad \\checkmark",
        explanation: "cos(x)/cos(x) = 1, queda solo sin(x).",
      },
    ],
  },

  {
    id: "quot-2",
    title: "Seno entre Tangente",
    category: "Cociente",
    lhsLatex: "\\frac{\\sin(x)}{\\tan(x)}",
    rhsLatex: "\\cos(x)",
    aliases: [
      ["sin(x)/tan(x)", "cos(x)"],
      ["sinx/tanx", "cosx"],
    ],
    steps: [
      {
        id: "s1", hint: "Sustituye tan(x) por sin(x)/cos(x) en el denominador.",
        ruleName: "Definición de tan",
        ruleLatex: "\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}",
        expressionLatex: "\\frac{\\sin(x)}{\\dfrac{\\sin(x)}{\\cos(x)}}",
        explanation: "Reemplazamos el denominador.",
      },
      {
        id: "s2", hint: "Dividir por una fracción es multiplicar por su inverso.",
        ruleName: "División de fracciones",
        ruleLatex: "\\frac{a}{\\frac{b}{c}} = a \\cdot \\frac{c}{b}",
        expressionLatex: "\\sin(x) \\cdot \\frac{\\cos(x)}{\\sin(x)}",
        explanation: "Multiplicamos sin(x) por el inverso de sin(x)/cos(x).",
      },
      {
        id: "s3", hint: "Cancela sin(x) en numerador y denominador.",
        ruleName: "Cancelación",
        ruleLatex: "\\frac{\\cancel{\\sin(x)} \\cdot \\cos(x)}{\\cancel{\\sin(x)}} = \\cos(x)",
        expressionLatex: "\\cos(x) \\quad \\checkmark",
        explanation: "sin(x)/sin(x) = 1, queda solo cos(x).",
      },
    ],
  },

  {
    id: "quot-3",
    title: "Fracción con Identidad Pitagórica",
    category: "Cociente",
    lhsLatex: "\\frac{1 - \\sin^2(x)}{\\cos(x)}",
    rhsLatex: "\\cos(x)",
    aliases: [
      ["(1-sin^2(x))/cos(x)", "cos(x)"],
      ["(1-sin2x)/cosx", "cosx"],
    ],
    steps: [
      {
        id: "s1", hint: "Reconoce el numerador: 1 − sin²(x) es parte de la identidad pitagórica.",
        ruleName: "Identidad Pitagórica despejada",
        ruleLatex: "\\sin^2(x) + \\cos^2(x) = 1 \\Rightarrow 1 - \\sin^2(x) = \\cos^2(x)",
        expressionLatex: "\\frac{\\cos^2(x)}{\\cos(x)}",
        explanation: "Sustituimos 1 − sin²(x) = cos²(x).",
      },
      {
        id: "s2", hint: "Simplifica cos²(x)/cos(x).",
        ruleName: "Simplificación de potencias",
        ruleLatex: "\\frac{\\cos^2(x)}{\\cos(x)} = \\cos(x)",
        expressionLatex: "\\cos(x) \\quad \\checkmark",
        explanation: "cos²(x)/cos(x) = cos(x).",
      },
    ],
  },

  // ── Reciprocal combinations ───────────────────────────
  {
    id: "recip-1",
    title: "Tangente más Cotangente",
    category: "Recíproca",
    lhsLatex: "\\tan(x) + \\cot(x)",
    rhsLatex: "\\sec(x)\\csc(x)",
    aliases: [
      ["tan(x)+cot(x)", "sec(x)csc(x)"],
      ["tanx+cotx", "secxcscx"],
    ],
    steps: [
      {
        id: "s1", hint: "Convierte tan(x) y cot(x) a senos y cosenos.",
        ruleName: "Definiciones",
        ruleLatex: "\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}, \\quad \\cot(x) = \\frac{\\cos(x)}{\\sin(x)}",
        expressionLatex: "\\frac{\\sin(x)}{\\cos(x)} + \\frac{\\cos(x)}{\\sin(x)}",
        explanation: "Reemplazamos con sus definiciones en senos y cosenos.",
      },
      {
        id: "s2", hint: "Encuentra el denominador común para sumar las fracciones.",
        ruleName: "Suma de fracciones (denominador común)",
        ruleLatex: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
        expressionLatex: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos(x)\\sin(x)}",
        explanation: "El denominador común es cos(x)·sin(x).",
      },
      {
        id: "s3", hint: "Aplica la identidad pitagórica en el numerador.",
        ruleName: "sin²(x) + cos²(x) = 1",
        ruleLatex: "\\sin^2(x) + \\cos^2(x) = 1",
        expressionLatex: "\\frac{1}{\\cos(x)\\sin(x)}",
        explanation: "El numerador se reduce a 1.",
      },
      {
        id: "s4", hint: "Separa la fracción y aplica las identidades recíprocas.",
        ruleName: "Identidades Recíprocas",
        ruleLatex: "\\frac{1}{\\cos(x)} = \\sec(x), \\quad \\frac{1}{\\sin(x)} = \\csc(x)",
        expressionLatex: "\\sec(x)\\csc(x) \\quad \\checkmark",
        explanation: "1/cos(x) = sec(x) y 1/sin(x) = csc(x).",
      },
    ],
  },

  {
    id: "recip-2",
    title: "Secante menos Coseno",
    category: "Recíproca",
    lhsLatex: "\\sec(x) - \\cos(x)",
    rhsLatex: "\\sin(x)\\tan(x)",
    aliases: [
      ["sec(x)-cos(x)", "sin(x)tan(x)"],
      ["secx-cosx", "sinxtanx"],
    ],
    steps: [
      {
        id: "s1", hint: "Convierte sec(x) a 1/cos(x).",
        ruleName: "Definición de sec",
        ruleLatex: "\\sec(x) = \\frac{1}{\\cos(x)}",
        expressionLatex: "\\frac{1}{\\cos(x)} - \\cos(x)",
        explanation: "Reemplazamos sec(x) = 1/cos(x).",
      },
      {
        id: "s2", hint: "Escribe cos(x) como cos²(x)/cos(x) para tener denominador común.",
        ruleName: "Denominador común",
        ruleLatex: "\\cos(x) = \\frac{\\cos^2(x)}{\\cos(x)}",
        expressionLatex: "\\frac{1 - \\cos^2(x)}{\\cos(x)}",
        explanation: "Restamos las fracciones con denominador cos(x).",
      },
      {
        id: "s3", hint: "Reconoce que 1 − cos²(x) = sin²(x).",
        ruleName: "Identidad Pitagórica",
        ruleLatex: "1 - \\cos^2(x) = \\sin^2(x)",
        expressionLatex: "\\frac{\\sin^2(x)}{\\cos(x)}",
        explanation: "Despejamos de sin²x + cos²x = 1.",
      },
      {
        id: "s4", hint: "Separa sin²(x)/cos(x) como sin(x) · sin(x)/cos(x).",
        ruleName: "Factorización y definición de tan",
        ruleLatex: "\\frac{\\sin^2(x)}{\\cos(x)} = \\sin(x) \\cdot \\frac{\\sin(x)}{\\cos(x)} = \\sin(x)\\tan(x)",
        expressionLatex: "\\sin(x)\\tan(x) \\quad \\checkmark",
        explanation: "sin(x)/cos(x) = tan(x).",
      },
    ],
  },

  // ── Double Angle ──────────────────────────────────────
  {
    id: "dbl-sin",
    title: "Seno de Ángulo Doble",
    category: "Ángulo Doble",
    lhsLatex: "\\sin(2x)",
    rhsLatex: "2\\sin(x)\\cos(x)",
    aliases: [
      ["sin(2x)", "2sin(x)cos(x)"],
      ["sin2x", "2sinxcosx"],
      ["sen(2x)", "2sen(x)cos(x)"],
    ],
    steps: [
      {
        id: "s1", hint: "Escribe 2x como x + x y aplica la fórmula de adición del seno.",
        ruleName: "Fórmula de adición: sin(A+B)",
        ruleLatex: "\\sin(A + B) = \\sin(A)\\cos(B) + \\cos(A)\\sin(B)",
        expressionLatex: "\\sin(x + x) = \\sin(x)\\cos(x) + \\cos(x)\\sin(x)",
        explanation: "Expandimos sin(2x) = sin(x+x) con la fórmula de suma.",
      },
      {
        id: "s2", hint: "Suma los dos términos iguales.",
        ruleName: "Simplificación",
        ruleLatex: "\\sin(x)\\cos(x) + \\cos(x)\\sin(x) = 2\\sin(x)\\cos(x)",
        expressionLatex: "2\\sin(x)\\cos(x) \\quad \\checkmark",
        explanation: "Ambos términos son iguales, por lo que se suman obteniendo el factor 2.",
      },
    ],
  },

  {
    id: "dbl-cos-1",
    title: "Coseno de Ángulo Doble (forma 1)",
    category: "Ángulo Doble",
    lhsLatex: "\\cos(2x)",
    rhsLatex: "\\cos^2(x) - \\sin^2(x)",
    aliases: [
      ["cos(2x)", "cos^2(x)-sin^2(x)"],
      ["cos2x", "cos2x-sin2x"],
    ],
    steps: [
      {
        id: "s1", hint: "Escribe 2x como x + x y aplica la fórmula de adición del coseno.",
        ruleName: "Fórmula de adición: cos(A+B)",
        ruleLatex: "\\cos(A + B) = \\cos(A)\\cos(B) - \\sin(A)\\sin(B)",
        expressionLatex: "\\cos(x)\\cos(x) - \\sin(x)\\sin(x)",
        explanation: "Expandimos cos(2x) = cos(x+x).",
      },
      {
        id: "s2", hint: "Simplifica los productos iguales como potencias.",
        ruleName: "Definición de potencia",
        ruleLatex: "a \\cdot a = a^2",
        expressionLatex: "\\cos^2(x) - \\sin^2(x) \\quad \\checkmark",
        explanation: "cos(x)·cos(x) = cos²(x) y sin(x)·sin(x) = sin²(x).",
      },
    ],
  },

  {
    id: "dbl-cos-2",
    title: "Coseno de Ángulo Doble (forma 2)",
    category: "Ángulo Doble",
    lhsLatex: "\\cos(2x)",
    rhsLatex: "1 - 2\\sin^2(x)",
    aliases: [
      ["cos(2x)", "1-2sin^2(x)"],
      ["cos2x", "1-2sin2x"],
    ],
    steps: [
      {
        id: "s1", hint: "Empieza con la forma cos²(x) − sin²(x) del ángulo doble.",
        ruleName: "Forma 1 del ángulo doble",
        ruleLatex: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)",
        expressionLatex: "\\cos^2(x) - \\sin^2(x)",
        explanation: "Usamos la forma ya demostrada.",
      },
      {
        id: "s2", hint: "Sustituye cos²(x) = 1 − sin²(x) de la identidad pitagórica.",
        ruleName: "Identidad Pitagórica",
        ruleLatex: "\\cos^2(x) = 1 - \\sin^2(x)",
        expressionLatex: "(1 - \\sin^2(x)) - \\sin^2(x)",
        explanation: "Reemplazamos cos²(x) en la expresión.",
      },
      {
        id: "s3", hint: "Combina los términos semejantes.",
        ruleName: "Simplificación",
        ruleLatex: "-\\sin^2(x) - \\sin^2(x) = -2\\sin^2(x)",
        expressionLatex: "1 - 2\\sin^2(x) \\quad \\checkmark",
        explanation: "Sumamos ambos términos con sin²(x).",
      },
    ],
  },

  {
    id: "dbl-cos-3",
    title: "Coseno de Ángulo Doble (forma 3)",
    category: "Ángulo Doble",
    lhsLatex: "\\cos(2x)",
    rhsLatex: "2\\cos^2(x) - 1",
    aliases: [
      ["cos(2x)", "2cos^2(x)-1"],
      ["cos2x", "2cos2x-1"],
    ],
    steps: [
      {
        id: "s1", hint: "Parte de cos²(x) − sin²(x).",
        ruleName: "Forma 1 del ángulo doble",
        ruleLatex: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)",
        expressionLatex: "\\cos^2(x) - \\sin^2(x)",
        explanation: "Primera forma del coseno doble.",
      },
      {
        id: "s2", hint: "Ahora sustituye sin²(x) = 1 − cos²(x).",
        ruleName: "Identidad Pitagórica",
        ruleLatex: "\\sin^2(x) = 1 - \\cos^2(x)",
        expressionLatex: "\\cos^2(x) - (1 - \\cos^2(x))",
        explanation: "Reemplazamos sin²(x) = 1 − cos²(x).",
      },
      {
        id: "s3", hint: "Distribuye el signo negativo y simplifica.",
        ruleName: "Distributiva",
        ruleLatex: "\\cos^2(x) - 1 + \\cos^2(x) = 2\\cos^2(x) - 1",
        expressionLatex: "2\\cos^2(x) - 1 \\quad \\checkmark",
        explanation: "Juntamos los dos términos cos²(x).",
      },
    ],
  },

  // ── Power Reducing ────────────────────────────────────
  {
    id: "pow-sin",
    title: "Reducción de Potencia — Seno",
    category: "Reducción",
    lhsLatex: "\\sin^2(x)",
    rhsLatex: "\\dfrac{1 - \\cos(2x)}{2}",
    aliases: [
      ["sin^2(x)", "(1-cos(2x))/2"],
      ["sin2x", "(1-cos2x)/2"],
    ],
    steps: [
      {
        id: "s1", hint: "Parte de la identidad cos(2x) = 1 − 2sin²(x).",
        ruleName: "Ángulo Doble",
        ruleLatex: "\\cos(2x) = 1 - 2\\sin^2(x)",
        expressionLatex: "\\cos(2x) = 1 - 2\\sin^2(x)",
        explanation: "Esta es la forma 2 del coseno doble.",
      },
      {
        id: "s2", hint: "Despeja sin²(x): pasa 2sin²(x) al otro lado.",
        ruleName: "Despejar sin²(x)",
        ruleLatex: "2\\sin^2(x) = 1 - \\cos(2x)",
        expressionLatex: "2\\sin^2(x) = 1 - \\cos(2x)",
        explanation: "Movemos cos(2x) a la derecha y 2sin²(x) a la izquierda.",
      },
      {
        id: "s3", hint: "Divide ambos lados entre 2.",
        ruleName: "División",
        ruleLatex: "\\sin^2(x) = \\frac{1 - \\cos(2x)}{2}",
        expressionLatex: "\\sin^2(x) = \\dfrac{1 - \\cos(2x)}{2} \\quad \\checkmark",
        explanation: "Obtenemos la fórmula de reducción de potencia.",
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════
// MATCHING LOGIC
// ══════════════════════════════════════════════════════════

function normalizeExpr(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/sen/g, "sin")   // Spanish alias
    .replace(/tg\b/g, "tan")  // Another alias
    .replace(/·/g, "*")
    .replace(/×/g, "*");
}

function findProof(lhs: string, rhs: string): IdentityProof | null {
  const nl = normalizeExpr(lhs);
  const nr = normalizeExpr(rhs);
  for (const proof of LIBRARY) {
    for (const [al, ar] of proof.aliases) {
      const nal = normalizeExpr(al);
      const nar = normalizeExpr(ar);
      if (
        (nal === nl && nar === nr) ||
        (nal === nr && nar === nl) // allow reversed input
      ) {
        return proof;
      }
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════
// NUMERICAL EVALUATOR (unchanged)
// ══════════════════════════════════════════════════════════

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

function evalTrig(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const sinV = round6(Math.sin(rad));
  const cosV = round6(Math.cos(rad));
  const tanV = Math.abs(Math.cos(rad)) < 1e-10 ? null : round6(Math.tan(rad));
  const cotV = Math.abs(Math.sin(rad)) < 1e-10 ? null : round6(1 / Math.tan(rad));
  const secV = Math.abs(Math.cos(rad)) < 1e-10 ? null : round6(1 / Math.cos(rad));
  const cscV = Math.abs(Math.sin(rad)) < 1e-10 ? null : round6(1 / Math.sin(rad));
  return { sinV, cosV, tanV, cotV, secV, cscV, rad };
}

type IdentityCheck = {
  name: string;
  latex: string;
  lhs: number | null;
  rhs: number | null;
};

function buildChecks(deg: number): IdentityCheck[] {
  const { sinV, cosV, tanV, secV, cscV, cotV } = evalTrig(deg);
  const rad = (deg * Math.PI) / 180;
  const sq = (v: number | null) => (v !== null ? round6(v * v) : null);
  return [
    { name: "Identidad Pitagórica I", latex: "\\sin^2(x) + \\cos^2(x) = 1",
      lhs: sq(sinV) !== null && sq(cosV) !== null ? round6(sq(sinV)! + sq(cosV)!) : null, rhs: 1 },
    { name: "Identidad Pitagórica II", latex: "1 + \\tan^2(x) = \\sec^2(x)",
      lhs: tanV !== null ? round6(1 + tanV * tanV) : null, rhs: secV !== null ? round6(secV * secV) : null },
    { name: "Identidad Pitagórica III", latex: "1 + \\cot^2(x) = \\csc^2(x)",
      lhs: cotV !== null ? round6(1 + cotV * cotV) : null, rhs: cscV !== null ? round6(cscV * cscV) : null },
    { name: "Definición Tangente", latex: "\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}",
      lhs: tanV, rhs: cosV !== 0 ? round6(sinV / cosV!) : null },
    { name: "Ángulo Doble — Seno", latex: "\\sin(2x) = 2\\sin(x)\\cos(x)",
      lhs: round6(Math.sin(2 * rad)), rhs: round6(2 * sinV * cosV!) },
    { name: "Ángulo Doble — Coseno", latex: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)",
      lhs: round6(Math.cos(2 * rad)), rhs: sq(cosV) !== null && sq(sinV) !== null ? round6(sq(cosV)! - sq(sinV)!) : null },
    { name: "Función Simétrica — Seno", latex: "\\sin(-x) = -\\sin(x)",
      lhs: round6(Math.sin(-rad)), rhs: round6(-sinV) },
    { name: "Función Simétrica — Coseno", latex: "\\cos(-x) = \\cos(x)",
      lhs: round6(Math.cos(-rad)), rhs: round6(cosV!) },
  ];
}

const PRESET_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];

// Group library by category for sidebar display
const CATEGORIES = Array.from(new Set(LIBRARY.map(p => p.category)));

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function Identities() {
  // ── Prover state ──
  const [lhsInput, setLhsInput] = useState("");
  const [rhsInput, setRhsInput] = useState("");
  const [activeProof, setActiveProof] = useState<IdentityProof | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [notFound, setNotFound] = useState(false);

  // ── Numerical state ──
  const [angleInput, setAngleInput] = useState("45");
  const [evaluatedAngle, setEvaluatedAngle] = useState<number | null>(null);

  // Proof controls
  const isComplete = activeProof !== null && stepIndex === activeProof.steps.length - 1;

  function handleAnalyze() {
    setNotFound(false);
    setStepIndex(-1);
    const proof = findProof(lhsInput, rhsInput);
    if (proof) {
      setActiveProof(proof);
    } else {
      setActiveProof(null);
      setNotFound(true);
    }
  }

  function loadPreset(proof: IdentityProof) {
    setActiveProof(proof);
    setStepIndex(-1);
    setNotFound(false);
    // Pre-fill inputs with a clean text representation of the first alias
    setLhsInput(proof.aliases[0][0]);
    setRhsInput(proof.aliases[0][1]);
  }

  function handleReset() {
    setStepIndex(-1);
    setNotFound(false);
    setActiveProof(null);
    setLhsInput("");
    setRhsInput("");
  }

  const trig = evaluatedAngle !== null ? evalTrig(evaluatedAngle) : null;
  const checks = evaluatedAngle !== null ? buildChecks(evaluatedAngle) : [];

  // Current displayed expression in proof workspace
  const currentExprLatex = useMemo(() => {
    if (!activeProof) return null;
    if (stepIndex === -1) return activeProof.lhsLatex;
    return activeProof.steps[stepIndex].expressionLatex;
  }, [activeProof, stepIndex]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-display mb-2">El Desarmador de Identidades</h1>
        <p className="text-muted-foreground">
          Escribe el ejercicio y la app te guía paso a paso hasta demostrar la igualdad.
        </p>
      </div>

      <Tabs defaultValue="probar">
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="probar" data-testid="tab-probar">Probar Identidad</TabsTrigger>
          <TabsTrigger value="verificar" data-testid="tab-verificar">Verificador Numérico</TabsTrigger>
        </TabsList>

        {/* ══ TAB 1: PROOF ASSISTANT ══ */}
        <TabsContent value="probar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Sidebar: preset library ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ejercicios de ejemplo
                </span>
              </div>
              {CATEGORIES.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1.5">{cat}</p>
                  <div className="space-y-1.5">
                    {LIBRARY.filter(p => p.category === cat).map(proof => (
                      <button
                        key={proof.id}
                        className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all hover:border-primary/50 hover:bg-primary/5 text-sm ${
                          activeProof?.id === proof.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border"
                        }`}
                        onClick={() => loadPreset(proof)}
                        data-testid={`preset-${proof.id}`}
                      >
                        <span className="font-medium text-foreground block leading-tight mb-1">
                          {proof.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <MathRenderer formula={`${proof.lhsLatex} = ${proof.rhsLatex}`} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Main proof area ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Input card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Escribe tu identidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="input-lhs">Lado Izquierdo (LI)</Label>
                      <Input
                        id="input-lhs"
                        placeholder="Ej: tan(x)*cos(x)"
                        value={lhsInput}
                        // A03: Limit input length
                        onChange={e => { if (e.target.value.length <= 200) setLhsInput(e.target.value); }}
                        onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                        maxLength={200}
                        data-testid="input-lhs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-rhs">Lado Derecho (LD)</Label>
                      <Input
                        id="input-rhs"
                        placeholder="Ej: sin(x)"
                        value={rhsInput}
                        onChange={e => { if (e.target.value.length <= 200) setRhsInput(e.target.value); }}
                        onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                        maxLength={200}
                        data-testid="input-rhs"
                      />
                    </div>
                  </div>

                  {/* Live LaTeX preview */}
                  {(lhsInput || rhsInput) && (
                    <div className="rounded-lg bg-muted/40 border px-4 py-3 text-center text-lg">
                      <MathRenderer formula={`${lhsInput || "\\text{?}"} = ${rhsInput || "\\text{?}"}`} display />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAnalyze}
                      className="flex-1"
                      disabled={!lhsInput || !rhsInput}
                      data-testid="button-analizar"
                    >
                      Analizar Identidad
                    </Button>
                    <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                      <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Usa notación estándar: <code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code>, <code>sin^2(x)</code>, <code>sin(2x)</code>, etc. También acepta <code>sen</code>.
                  </p>
                </CardContent>
              </Card>

              {/* Not found */}
              <AnimatePresence>
                {notFound && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive text-sm">Identidad no encontrada en la biblioteca</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Revisa la ortografía o selecciona un ejercicio de la lista de ejemplos. Recuerda escribir exactamente como: <code>sin(x)</code>, <code>cos^2(x)</code>, <code>sin(2x)</code>…
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proof workspace */}
              <AnimatePresence>
                {activeProof && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Goal banner */}
                    <Card className="border-2 border-primary/30 bg-primary/5">
                      <CardContent className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                          Objetivo: Demostrar que LI = LD
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xl">
                          <div className="bg-background rounded-xl border border-primary/20 px-5 py-3 shadow-inner min-w-[120px] text-center">
                            <MathRenderer formula={activeProof.lhsLatex} display />
                          </div>
                          <span className="text-muted-foreground font-bold hidden sm:block">=</span>
                          <ArrowRight className="w-6 h-6 text-muted-foreground sm:hidden rotate-90" />
                          <div className="bg-background rounded-xl border px-5 py-3 min-w-[120px] text-center text-foreground">
                            <MathRenderer formula={activeProof.rhsLatex} display />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Live expression */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                          Expresión actual (LI)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div
                          key={`expr-${stepIndex}`}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center bg-muted/30 rounded-xl border px-6 py-5 text-2xl"
                        >
                          <MathRenderer formula={currentExprLatex ?? ""} display />
                        </motion.div>

                        {isComplete && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 flex items-center justify-center gap-2 text-green-700 bg-green-50 dark:bg-green-950/30 py-3 rounded-xl border border-green-200 dark:border-green-800"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="font-bold text-lg">¡Identidad Demostrada!</span>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Step list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                          <Lightbulb className="w-5 h-5 text-accent" /> Pasos de la Demostración
                        </h3>
                        <div className="flex gap-2">
                          {stepIndex > -1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStepIndex(-1)}
                              data-testid="button-reiniciar-pasos"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reiniciar
                            </Button>
                          )}
                          {!isComplete && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setStepIndex(activeProof.steps.length - 1)}
                              data-testid="button-ver-todo"
                            >
                              Ver todos los pasos
                            </Button>
                          )}
                        </div>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {activeProof.steps.map((step, idx) => {
                          const isRevealedHint = idx === stepIndex + 1 && !isComplete;
                          const isDone = idx <= stepIndex;

                          if (idx > stepIndex + 1) return null;

                          return (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className={`rounded-xl border p-4 transition-colors ${
                                isRevealedHint
                                  ? "bg-accent/5 border-accent"
                                  : isDone
                                  ? "bg-muted/20 border-muted-foreground/20"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Step number bubble */}
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                    isDone
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  {/* Hint */}
                                  <p className={`font-medium text-sm ${isRevealedHint ? "text-accent" : "text-foreground"}`}>
                                    {step.hint}
                                  </p>

                                  {/* Expanded step details */}
                                  {isDone && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="mt-3 space-y-3"
                                    >
                                      {/* Rule box */}
                                      <div className="rounded-lg border bg-background p-3">
                                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">
                                          Regla: {step.ruleName}
                                        </p>
                                        <div className="text-sm text-center">
                                          <MathRenderer formula={step.ruleLatex} display />
                                        </div>
                                      </div>

                                      {/* Result */}
                                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                                        <p className="text-xs text-muted-foreground mb-1.5">Resultado de este paso:</p>
                                        <div className="text-center text-lg">
                                          <MathRenderer formula={step.expressionLatex} display />
                                        </div>
                                      </div>

                                      {/* Explanation */}
                                      <p className="text-xs text-muted-foreground pl-1">{step.explanation}</p>
                                    </motion.div>
                                  )}
                                </div>

                                {/* Apply button or check */}
                                {isRevealedHint && (
                                  <Button
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => setStepIndex(s => s + 1)}
                                    data-testid={`button-apply-step-${idx}`}
                                  >
                                    <Play className="w-3.5 h-3.5 mr-1" /> Aplicar
                                  </Button>
                                )}
                                {isDone && (
                                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </TabsContent>

        {/* ══ TAB 2: NUMERICAL VERIFIER ══ */}
        <TabsContent value="verificar">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Ingresa un ángulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-2 w-44">
                    <Label htmlFor="input-angle">Ángulo (en grados)</Label>
                    <Input
                      id="input-angle"
                      type="number"
                      placeholder="Ej: 45"
                      value={angleInput}
                      onChange={e => setAngleInput(e.target.value)}
                      data-testid="input-angle"
                    />
                  </div>
                  <Button onClick={() => { const v = parseFloat(angleInput); if (!isNaN(v)) setEvaluatedAngle(v); }} data-testid="button-evaluar">
                    Evaluar
                  </Button>
                  <Button variant="outline" onClick={() => { setAngleInput(""); setEvaluatedAngle(null); }} data-testid="button-limpiar-eval">
                    <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PRESET_ANGLES.map(a => (
                    <button
                      key={a}
                      className="px-3 py-1 rounded-full border text-sm hover:bg-primary/10 hover:border-primary transition-colors"
                      onClick={() => { setAngleInput(String(a)); setEvaluatedAngle(a); }}
                      data-testid={`button-preset-${a}`}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {trig && evaluatedAngle !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Valores para{" "}
                        <span className="text-primary">x = {evaluatedAngle}°</span>
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({((evaluatedAngle * Math.PI) / 180).toFixed(4)} rad)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { label: "\\sin(x)", value: trig.sinV },
                          { label: "\\cos(x)", value: trig.cosV },
                          { label: "\\tan(x)", value: trig.tanV },
                          { label: "\\cot(x)", value: trig.cotV },
                          { label: "\\sec(x)", value: trig.secV },
                          { label: "\\csc(x)", value: trig.cscV },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg border bg-muted/20 px-4 py-3 flex flex-col items-center gap-1">
                            <span className="text-muted-foreground text-sm"><MathRenderer formula={label} /></span>
                            <span className="text-lg font-mono font-semibold">
                              {value === null ? <span className="text-destructive text-sm">Indefinido</span> : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Verificación de identidades</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {checks.map((check, i) => {
                          const isDefined = check.lhs !== null && check.rhs !== null;
                          const isValid = isDefined && Math.abs(check.lhs! - check.rhs!) < 1e-4;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className={`rounded-lg border p-4 flex items-start gap-4 ${
                                !isDefined ? "bg-muted/10 border-muted"
                                : isValid ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                : "bg-destructive/5 border-destructive/30"
                              }`}
                            >
                              <div className="shrink-0 mt-0.5">
                                {!isDefined ? <XCircle className="w-5 h-5 text-muted-foreground" />
                                  : isValid ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  : <XCircle className="w-5 h-5 text-destructive" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-medium mb-1">{check.name}</p>
                                <MathRenderer formula={check.latex} />
                              </div>
                              <div className="shrink-0 text-right text-sm font-mono text-muted-foreground">
                                {!isDefined ? <span className="text-xs">No definido</span> : (
                                  <div className="space-y-0.5">
                                    <div><span className="text-xs">LI: </span>{check.lhs}</div>
                                    <div><span className="text-xs">LD: </span>{check.rhs}</div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
