import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Lightbulb, Play, RotateCcw, XCircle } from "lucide-react";
import { Math as MathRenderer } from "@/components/math-renderer";

// ─────────────────────────────────────────────
// PUZZLE DATA
// ─────────────────────────────────────────────

type PuzzleStep = {
  id: string;
  hint: string;
  formula: string;
  explanation: string;
};

type Puzzle = {
  id: string;
  title: string;
  start: string;
  target: string;
  steps: PuzzleStep[];
};

const PUZZLES: Puzzle[] = [
  {
    id: "p1",
    title: "Identidad Básica 1",
    start: "\\tan(x) \\cdot \\cos(x)",
    target: "\\sin(x)",
    steps: [
      {
        id: "p1-s1",
        hint: "¿Qué tal si conviertes tan(x) a senos y cosenos?",
        formula: "\\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x)",
        explanation: "Sabemos que \\tan(x) = \\frac{\\sin(x)}{\\cos(x)}."
      },
      {
        id: "p1-s2",
        hint: "Cancela los términos comunes.",
        formula: "\\sin(x)",
        explanation: "El \\cos(x) en el numerador se cancela con el del denominador."
      }
    ]
  },
  {
    id: "p2",
    title: "Identidad Pitagórica",
    start: "\\frac{1 - \\sin^2(x)}{\\cos(x)}",
    target: "\\cos(x)",
    steps: [
      {
        id: "p2-s1",
        hint: "Usa la identidad pitagórica: sin²x + cos²x = 1",
        formula: "\\frac{\\cos^2(x)}{\\cos(x)}",
        explanation: "Despejando: 1 - \\sin^2(x) = \\cos^2(x)."
      },
      {
        id: "p2-s2",
        hint: "Simplifica la fracción.",
        formula: "\\cos(x)",
        explanation: "Dividimos \\cos^2(x) entre \\cos(x)."
      }
    ]
  },
  {
    id: "p3",
    title: "Identidad Recíproca",
    start: "\\tan(x) + \\cot(x)",
    target: "\\sec(x)\\csc(x)",
    steps: [
      {
        id: "p3-s1",
        hint: "Convierte todo a senos y cosenos.",
        formula: "\\frac{\\sin(x)}{\\cos(x)} + \\frac{\\cos(x)}{\\sin(x)}",
        explanation: "\\tan(x) = \\frac{\\sin(x)}{\\cos(x)} \\text{ y } \\cot(x) = \\frac{\\cos(x)}{\\sin(x)}."
      },
      {
        id: "p3-s2",
        hint: "Encuentra un denominador común.",
        formula: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos(x)\\sin(x)}",
        explanation: "Multiplicamos en cruz para sumar las fracciones."
      },
      {
        id: "p3-s3",
        hint: "Aplica la identidad pitagórica en el numerador.",
        formula: "\\frac{1}{\\cos(x)\\sin(x)}",
        explanation: "\\sin^2(x) + \\cos^2(x) = 1."
      },
      {
        id: "p3-s4",
        hint: "Separa y usa identidades recíprocas.",
        formula: "\\sec(x)\\csc(x)",
        explanation: "\\frac{1}{\\cos(x)} = \\sec(x) \\text{ y } \\frac{1}{\\sin(x)} = \\csc(x)."
      }
    ]
  },
  {
    id: "p4",
    title: "Ángulo Doble",
    start: "\\frac{\\sin(2x)}{2\\cos(x)}",
    target: "\\sin(x)",
    steps: [
      {
        id: "p4-s1",
        hint: "Expande sin(2x) usando la identidad de ángulo doble.",
        formula: "\\frac{2\\sin(x)\\cos(x)}{2\\cos(x)}",
        explanation: "\\sin(2x) = 2\\sin(x)\\cos(x)."
      },
      {
        id: "p4-s2",
        hint: "Cancela los términos comunes.",
        formula: "\\sin(x)",
        explanation: "2\\cos(x) se cancela en numerador y denominador."
      }
    ]
  }
];

// ─────────────────────────────────────────────
// NUMERICAL EVALUATOR DATA
// ─────────────────────────────────────────────

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

  const sq = (v: number | null) => v !== null ? round6(v * v) : null;

  return [
    {
      name: "Identidad Pitagórica I",
      latex: "\\sin^2(x) + \\cos^2(x) = 1",
      lhs: sq(sinV) !== null && sq(cosV) !== null ? round6(sq(sinV)! + sq(cosV)!) : null,
      rhs: 1,
    },
    {
      name: "Identidad Pitagórica II",
      latex: "1 + \\tan^2(x) = \\sec^2(x)",
      lhs: tanV !== null ? round6(1 + tanV * tanV) : null,
      rhs: secV !== null ? round6(secV * secV) : null,
    },
    {
      name: "Identidad Pitagórica III",
      latex: "1 + \\cot^2(x) = \\csc^2(x)",
      lhs: cotV !== null ? round6(1 + cotV * cotV) : null,
      rhs: cscV !== null ? round6(cscV * cscV) : null,
    },
    {
      name: "Definición Tangente",
      latex: "\\tan(x) = \\dfrac{\\sin(x)}{\\cos(x)}",
      lhs: tanV,
      rhs: cosV !== 0 ? round6(sinV / cosV!) : null,
    },
    {
      name: "Definición Cotangente",
      latex: "\\cot(x) = \\dfrac{\\cos(x)}{\\sin(x)}",
      lhs: cotV,
      rhs: sinV !== 0 ? round6(cosV! / sinV!) : null,
    },
    {
      name: "Ángulo Doble — Seno",
      latex: "\\sin(2x) = 2\\sin(x)\\cos(x)",
      lhs: round6(Math.sin(2 * rad)),
      rhs: round6(2 * sinV * cosV!),
    },
    {
      name: "Ángulo Doble — Coseno",
      latex: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)",
      lhs: round6(Math.cos(2 * rad)),
      rhs: sq(cosV) !== null && sq(sinV) !== null ? round6(sq(cosV)! - sq(sinV)!) : null,
    },
    {
      name: "Función Simétrica — Seno",
      latex: "\\sin(-x) = -\\sin(x)",
      lhs: round6(Math.sin(-rad)),
      rhs: round6(-sinV),
    },
    {
      name: "Función Simétrica — Coseno",
      latex: "\\cos(-x) = \\cos(x)",
      lhs: round6(Math.cos(-rad)),
      rhs: round6(cosV!),
    },
  ];
}

const PRESET_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function Identities() {
  // Puzzle state
  const [activePuzzleId, setActivePuzzleId] = useState<string>(PUZZLES[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // Evaluator state
  const [angleInput, setAngleInput] = useState<string>("45");
  const [evaluatedAngle, setEvaluatedAngle] = useState<number | null>(null);

  const activePuzzle = PUZZLES.find(p => p.id === activePuzzleId)!;
  const isComplete = currentStepIndex === activePuzzle.steps.length - 1;

  const handleSelectPuzzle = (id: string) => {
    setActivePuzzleId(id);
    setCurrentStepIndex(-1);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activePuzzle.steps.length - 1) {
      setCurrentStepIndex(curr => curr + 1);
    }
  };

  const handleShowAll = () => {
    setCurrentStepIndex(activePuzzle.steps.length - 1);
  };

  const currentFormula =
    currentStepIndex === -1
      ? activePuzzle.start
      : activePuzzle.steps[currentStepIndex].formula;

  const handleEvaluate = () => {
    const val = parseFloat(angleInput);
    if (!isNaN(val)) setEvaluatedAngle(val);
  };

  const trig = evaluatedAngle !== null ? evalTrig(evaluatedAngle) : null;
  const checks = evaluatedAngle !== null ? buildChecks(evaluatedAngle) : [];

  const fmt = (v: number | null) =>
    v === null ? <span className="text-muted-foreground italic">Indefinido</span> : <span>{v}</span>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-display mb-2">El Desarmador de Identidades</h1>
        <p className="text-muted-foreground">
          Demuestra identidades paso a paso o verifica valores trigonométricos con un ángulo concreto.
        </p>
      </div>

      <Tabs defaultValue="demostrar">
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="demostrar" data-testid="tab-demostrar">Demostrar Identidades</TabsTrigger>
          <TabsTrigger value="verificar" data-testid="tab-verificar">Verificador Numérico</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: PUZZLE ── */}
        <TabsContent value="demostrar">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Ejemplos</h3>
              {PUZZLES.map(p => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${activePuzzleId === p.id ? "border-primary shadow-sm bg-primary/5" : ""}`}
                  onClick={() => handleSelectPuzzle(p.id)}
                  data-testid={`card-puzzle-${p.id}`}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{p.title}</CardTitle>
                    <div className="text-xs mt-2 text-muted-foreground overflow-hidden">
                      <MathRenderer formula={`${p.start} = ${p.target}`} />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="md:col-span-3 space-y-6">
              <Card className="border-2 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Objetivo: Demostrar la identidad</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentStepIndex(-1)} disabled={currentStepIndex === -1} data-testid="button-reiniciar">
                        Reiniciar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleShowAll} disabled={isComplete} data-testid="button-ver-solucion">
                        Ver Solución
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <motion.div
                      key={`formula-${currentStepIndex}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary bg-primary/5 px-6 py-4 rounded-xl border border-primary/20 min-w-[200px] text-center shadow-inner text-2xl"
                    >
                      <MathRenderer formula={currentFormula} display />
                    </motion.div>

                    <div className="text-muted-foreground font-bold flex items-center">
                      <ArrowRight className="w-8 h-8 hidden md:block" />
                      <span className="md:hidden text-2xl">=</span>
                    </div>

                    <div className="text-foreground px-6 py-4 rounded-xl border bg-muted/20 min-w-[200px] text-center text-2xl">
                      <MathRenderer formula={activePuzzle.target} display />
                    </div>
                  </div>

                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 py-3 rounded-lg border border-green-200 dark:border-green-900"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold font-display">¡Identidad Demostrada!</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg font-display flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" /> Pistas y Pasos
                </h3>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activePuzzle.steps.map((step, idx) => {
                      if (idx > currentStepIndex + 1) return null;
                      const isCurrent = idx === currentStepIndex + 1;
                      const isPast = idx <= currentStepIndex;

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className={`rounded-lg border p-4 transition-colors ${
                            isCurrent
                              ? "bg-accent/5 border-accent shadow-sm"
                              : isPast
                              ? "bg-muted/30 border-muted-foreground/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isPast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className={`font-medium ${isPast ? "text-foreground" : "text-accent"}`}>
                                {step.hint}
                              </p>
                              {isPast && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-muted-foreground bg-background p-3 rounded border space-y-2"
                                >
                                  <MathRenderer formula={step.formula} display />
                                  <p className="text-xs mt-1"><MathRenderer formula={step.explanation} /></p>
                                </motion.div>
                              )}
                            </div>
                            {isCurrent && (
                              <Button
                                size="sm"
                                onClick={handleNextStep}
                                className="shrink-0"
                                data-testid={`button-step-${idx}`}
                              >
                                <Play className="w-4 h-4 mr-1" /> Aplicar
                              </Button>
                            )}
                            {isPast && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: NUMERICAL EVALUATOR ── */}
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
                  <Button onClick={handleEvaluate} data-testid="button-evaluar">
                    Evaluar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setAngleInput(""); setEvaluatedAngle(null); }}
                    data-testid="button-limpiar-eval"
                  >
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
                  {/* Values Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Valores trigonométricos para{" "}
                        <span className="text-primary">x = {evaluatedAngle}°</span>
                        <span className="text-sm font-normal text-muted-foreground ml-3">
                          ({round6((evaluatedAngle * Math.PI) / 180).toFixed(4)} rad)
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
                          <div
                            key={label}
                            className="rounded-lg border bg-muted/20 px-4 py-3 flex flex-col items-center gap-1"
                          >
                            <span className="text-muted-foreground text-sm">
                              <MathRenderer formula={label} />
                            </span>
                            <span className="text-lg font-mono font-semibold text-foreground">
                              {value === null ? (
                                <span className="text-destructive text-sm">Indefinido</span>
                              ) : (
                                value
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Identity Checks */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Verificación de identidades</CardTitle>
                    </CardHeader>
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
                                !isDefined
                                  ? "bg-muted/10 border-muted"
                                  : isValid
                                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                  : "bg-destructive/5 border-destructive/30"
                              }`}
                            >
                              <div className="shrink-0 mt-0.5">
                                {!isDefined ? (
                                  <XCircle className="w-5 h-5 text-muted-foreground" />
                                ) : isValid ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-destructive" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium mb-1">{check.name}</p>
                                <div className="text-base">
                                  <MathRenderer formula={check.latex} />
                                </div>
                              </div>
                              <div className="shrink-0 text-right text-sm font-mono text-muted-foreground">
                                {!isDefined ? (
                                  <span className="text-xs">Ángulo sin definir</span>
                                ) : (
                                  <div className="space-y-0.5">
                                    <div>
                                      <span className="text-xs text-muted-foreground">LI: </span>
                                      {fmt(check.lhs)}
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">LD: </span>
                                      {fmt(check.rhs)}
                                    </div>
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
