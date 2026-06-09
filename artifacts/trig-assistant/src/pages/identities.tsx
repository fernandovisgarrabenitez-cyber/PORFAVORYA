import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Lightbulb, Play } from "lucide-react";

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
    start: "tan(x) · cos(x)",
    target: "sin(x)",
    steps: [
      {
        id: "p1-s1",
        hint: "¿Qué tal si conviertes tan(x) a senos y cosenos?",
        formula: "\\frac{\\sin(x)}{\\cos(x)} \\cdot \\cos(x)",
        explanation: "Sabemos que tan(x) = sin(x)/cos(x)."
      },
      {
        id: "p1-s2",
        hint: "Cancela los términos comunes.",
        formula: "\\sin(x)",
        explanation: "El cos(x) en el numerador se cancela con el del denominador."
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
        hint: "Usa la identidad pitagórica fundamental (sin²x + cos²x = 1).",
        formula: "\\frac{\\cos^2(x)}{\\cos(x)}",
        explanation: "Despejando obtenemos que 1 - sin²(x) = cos²(x)."
      },
      {
        id: "p2-s2",
        hint: "Simplifica la fracción.",
        formula: "\\cos(x)",
        explanation: "Dividimos cos²(x) entre cos(x)."
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
        explanation: "tan(x) = sin(x)/cos(x) y cot(x) = cos(x)/sin(x)."
      },
      {
        id: "p3-s2",
        hint: "Encuentra un denominador común para sumar las fracciones.",
        formula: "\\frac{\\sin^2(x) + \\cos^2(x)}{\\cos(x)\\sin(x)}",
        explanation: "Multiplicamos cruzado."
      },
      {
        id: "p3-s3",
        hint: "Aplica la identidad pitagórica en el numerador.",
        formula: "\\frac{1}{\\cos(x)\\sin(x)}",
        explanation: "Sabemos que sin²(x) + cos²(x) = 1."
      },
      {
        id: "p3-s4",
        hint: "Separa las fracciones y usa identidades recíprocas.",
        formula: "\\sec(x)\\csc(x)",
        explanation: "1/cos(x) = sec(x) y 1/sin(x) = csc(x)."
      }
    ]
  }
];

export default function Identities() {
  const [activePuzzleId, setActivePuzzleId] = useState<string>(PUZZLES[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

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

  const currentFormula = currentStepIndex === -1 ? activePuzzle.start : activePuzzle.steps[currentStepIndex].formula;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">El Desarmador de Identidades</h1>
        <p className="text-muted-foreground">Demuestra que el lado izquierdo es igual al lado derecho resolviendo el rompecabezas paso a paso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Ejemplos</h3>
          {PUZZLES.map(p => (
            <Card 
              key={p.id} 
              className={`cursor-pointer transition-all hover:border-primary/50 ${activePuzzleId === p.id ? 'border-primary shadow-sm bg-primary/5' : ''}`}
              onClick={() => handleSelectPuzzle(p.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{p.title}</CardTitle>
                <div className="math-font text-xs mt-2 text-muted-foreground">
                  {p.start} = {p.target}
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
                  <Button variant="outline" size="sm" onClick={() => setCurrentStepIndex(-1)} disabled={currentStepIndex === -1}>Reiniciar</Button>
                  <Button variant="secondary" size="sm" onClick={handleShowAll} disabled={isComplete}>Ver Solución</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-2xl md:text-3xl">
                <motion.div 
                  key={`formula-${currentStepIndex}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-primary bg-primary/5 px-6 py-4 rounded-xl border border-primary/20 min-w-[200px] text-center shadow-inner"
                >
                  {currentFormula}
                </motion.div>
                
                <div className="text-muted-foreground font-bold flex items-center">
                  <ArrowRight className="w-8 h-8 hidden md:block" />
                  <div className="md:hidden">=</div >
                </div>
                
                <div className="font-mono text-foreground px-6 py-4 rounded-xl border bg-muted/20 min-w-[200px] text-center">
                  {activePuzzle.target}
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
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`rounded-lg border p-4 transition-colors ${
                        isCurrent ? 'bg-accent/5 border-accent shadow-sm' : 
                        isPast ? 'bg-muted/30 border-muted-foreground/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className={`font-medium ${isPast ? 'text-foreground' : 'text-accent'}`}>
                            {step.hint}
                          </p>
                          {isPast && (
                            <motion.p 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="text-sm text-muted-foreground bg-background p-2 rounded border"
                            >
                              {step.explanation}
                            </motion.p>
                          )}
                        </div>
                        {isCurrent && (
                          <Button size="sm" onClick={handleNextStep} className="shrink-0" data-testid={`button-step-${idx}`}>
                            <Play className="w-4 h-4 mr-1" /> Aplicar
                          </Button>
                        )}
                        {isPast && (
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}