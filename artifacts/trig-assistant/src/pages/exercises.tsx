import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb, Trophy, RotateCcw, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Math as MathRenderer } from "@/components/math-renderer";
import {
  EXERCISES, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  checkStep, type Exercise,
} from "@/lib/exercises";
import { useAchievements, ACHIEVEMENTS, RARITY_STYLES } from "@/lib/achievements";

// ── Step state for each step in the active exercise
type StepState = "idle" | "correct" | "wrong";

type ExerciseSession = {
  stepIndex: number;
  stepStates: StepState[];
  inputValue: string;
  hintUsed: boolean[];
  wrongCount: number[];
  totalErrors: number;
  done: boolean;
};

function freshSession(exercise: Exercise): ExerciseSession {
  return {
    stepIndex: 0,
    stepStates: exercise.steps.map(() => "idle"),
    inputValue: "",
    hintUsed: exercise.steps.map(() => false),
    wrongCount: exercise.steps.map(() => 0),
    totalErrors: 0,
    done: false,
  };
}

// ══════════════════════════════════════════════════════════
// ACHIEVEMENT TOAST (shown after completion)
// ══════════════════════════════════════════════════════════

function AchievementToast({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const toShow = ACHIEVEMENTS.filter((a) => ids.includes(a.id));
  if (toShow.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 space-y-3 max-w-xs"
    >
      {toShow.map((ach) => {
        const style = RARITY_STYLES[ach.rarity];
        return (
          <div
            key={ach.id}
            className={`flex items-center gap-3 rounded-xl border-2 ${style.border} ${style.bg} p-4 shadow-xl`}
          >
            <span className="text-3xl">{ach.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logro desbloqueado
              </p>
              <p className="font-bold text-foreground">{ach.title}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5 ${style.badge}`}>
                {style.label}
              </span>
            </div>
          </div>
        );
      })}
      <Button variant="outline" size="sm" className="w-full" onClick={onClose}>
        Cerrar
      </Button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════

export default function Exercises() {
  const [activeExId, setActiveExId] = useState<string | null>(null);
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const { stats, recordCompletion, recordAttempt } = useAchievements();

  const activeExercise = EXERCISES.find((e) => e.id === activeExId) ?? null;

  // ── Start / select exercise
  const startExercise = useCallback((ex: Exercise) => {
    setActiveExId(ex.id);
    setSession(freshSession(ex));
    setNewAchievements([]);
  }, []);

  // ── Reset current exercise
  const resetExercise = useCallback(() => {
    if (!activeExercise) return;
    setSession(freshSession(activeExercise));
    setNewAchievements([]);
  }, [activeExercise]);

  // ── Check user's answer for current step
  const handleCheck = useCallback(() => {
    if (!session || !activeExercise) return;
    const step = activeExercise.steps[session.stepIndex];
    const correct = checkStep(session.inputValue, step);
    recordAttempt();

    if (correct) {
      const newStates = [...session.stepStates];
      newStates[session.stepIndex] = "correct";
      const isLast = session.stepIndex === activeExercise.steps.length - 1;

      const updatedSession: ExerciseSession = {
        ...session,
        stepStates: newStates,
        inputValue: "",
        stepIndex: isLast ? session.stepIndex : session.stepIndex + 1,
        done: isLast,
      };
      setSession(updatedSession);

      if (isLast) {
        const usedHint = updatedSession.hintUsed.some(Boolean);
        const hadErrors = updatedSession.totalErrors > 0;
        // Save progress and get newly unlocked achievements
        const prevUnlocked = stats.unlockedAchievements;
        recordCompletion(activeExercise.id, usedHint, hadErrors);
        // Compute which new ones just unlocked
        setTimeout(() => {
          const freshStats = {
            ...stats,
            completedExercises: stats.completedExercises.includes(activeExercise.id)
              ? stats.completedExercises
              : [...stats.completedExercises, activeExercise.id],
            noHintExercises: !usedHint && !stats.noHintExercises.includes(activeExercise.id)
              ? [...stats.noHintExercises, activeExercise.id]
              : stats.noHintExercises,
            perfectExercises: !hadErrors && !stats.perfectExercises.includes(activeExercise.id)
              ? [...stats.perfectExercises, activeExercise.id]
              : stats.perfectExercises,
          };
          const newlyUnlocked = ACHIEVEMENTS
            .filter((a) => !prevUnlocked.includes(a.id) && a.check(freshStats))
            .map((a) => a.id);
          setNewAchievements(newlyUnlocked);
        }, 300);
      }
    } else {
      const newStates = [...session.stepStates];
      newStates[session.stepIndex] = "wrong";
      const newWrong = [...session.wrongCount];
      newWrong[session.stepIndex] += 1;
      setSession({
        ...session,
        stepStates: newStates,
        wrongCount: newWrong,
        totalErrors: session.totalErrors + 1,
      });
      // Reset wrong state after a moment for retry
      setTimeout(() => {
        setSession((prev) => {
          if (!prev) return prev;
          const s = [...prev.stepStates];
          s[prev.stepIndex] = "idle";
          return { ...prev, stepStates: s };
        });
      }, 1200);
    }
  }, [session, activeExercise, recordAttempt, recordCompletion, stats]);

  // ── Reveal hint for current step
  const handleHint = useCallback(() => {
    if (!session) return;
    const newHints = [...session.hintUsed];
    newHints[session.stepIndex] = true;
    setSession({ ...session, hintUsed: newHints });
  }, [session]);

  const currentStep = activeExercise && session
    ? activeExercise.steps[session.stepIndex]
    : null;

  const currentStepState = session
    ? session.stepStates[session.stepIndex]
    : "idle";

  const isCompleted = (id: string) => stats.completedExercises.includes(id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Ejercicios</h1>
        <p className="text-muted-foreground">
          Resuelve cada paso manualmente. La app te dice si vas bien o mal y al terminar ganas logros.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Exercise list sidebar ── */}
        <div className="space-y-4">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <div key={diff}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 px-1 ${
                diff === "easy" ? "text-green-600" : diff === "medium" ? "text-blue-600" : "text-red-600"
              }`}>
                {DIFFICULTY_LABELS[diff]}
              </p>
              <div className="space-y-2">
                {EXERCISES.filter((e) => e.difficulty === diff).map((ex) => {
                  const done = isCompleted(ex.id);
                  const active = activeExId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      onClick={() => startExercise(ex)}
                      data-testid={`exercise-card-${ex.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">{ex.title}</span>
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                          {DIFFICULTY_LABELS[ex.difficulty]}
                        </span>
                        <span className="text-xs text-muted-foreground">{ex.steps.length} paso{ex.steps.length > 1 ? "s" : ""}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Progress summary */}
          <Card className="mt-4 bg-muted/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.completedExercises.length}/{EXERCISES.length}
              </p>
              <p className="text-xs text-muted-foreground">ejercicios completados</p>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(stats.completedExercises.length / EXERCISES.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Exercise workspace ── */}
        <div className="lg:col-span-2">
          {!activeExercise ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-border rounded-2xl text-center p-8">
              <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona un ejercicio</h3>
              <p className="text-muted-foreground text-sm">
                Elige un ejercicio de la lista para empezar a practicar y ganar logros.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Exercise header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{activeExercise.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{activeExercise.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${DIFFICULTY_COLORS[activeExercise.difficulty]}`}>
                        {DIFFICULTY_LABELS[activeExercise.difficulty]}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetExercise}
                        data-testid="button-reset-exercise"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Goal */}
                  <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xl">
                    <MathRenderer formula={activeExercise.lhsLatex} display />
                    <span className="text-muted-foreground">=</span>
                    <MathRenderer formula={activeExercise.rhsLatex} display />
                  </div>
                </CardContent>
              </Card>

              {/* Step list */}
              <div className="space-y-3">
                {activeExercise.steps.map((step, idx) => {
                  const state = session!.stepStates[idx];
                  const isActive = idx === session!.stepIndex && !session!.done;
                  const isPast = state === "correct";
                  const isFuture = idx > session!.stepIndex;
                  const hintShown = session!.hintUsed[idx];

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`rounded-xl border p-4 transition-colors ${
                        isPast
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                          : isActive
                          ? "bg-card border-primary/40 shadow-sm"
                          : "bg-muted/10 border-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Bubble */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isPast
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isPast ? <CheckCircle2 className="w-4 h-4" /> : isFuture ? <Lock className="w-3 h-3" /> : idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>
                            {step.instruction}
                          </p>

                          {/* Past step result */}
                          {isPast && (
                            <div className="mt-2 text-center text-lg">
                              <MathRenderer formula={step.resultLatex} display />
                            </div>
                          )}

                          {/* Active step input */}
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 space-y-3"
                            >
                              {/* Hint box */}
                              {hintShown && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3"
                                >
                                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                                    Pista: {step.hint}
                                  </p>
                                  <MathRenderer formula={step.hintLatex} display />
                                </motion.div>
                              )}

                              {/* Input field */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Escribe tu respuesta aquí..."
                                  value={session!.inputValue}
                                  onChange={(e) => setSession((s) => s ? { ...s, inputValue: e.target.value } : s)}
                                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                                  className={`flex-1 font-mono ${
                                    currentStepState === "wrong"
                                      ? "border-destructive ring-1 ring-destructive"
                                      : ""
                                  }`}
                                  data-testid={`input-step-${idx}`}
                                  autoFocus
                                />
                                <Button
                                  onClick={handleCheck}
                                  disabled={!session!.inputValue.trim()}
                                  data-testid={`button-check-step-${idx}`}
                                >
                                  Verificar
                                </Button>
                                {!hintShown && (
                                  <Button
                                    variant="outline"
                                    onClick={handleHint}
                                    data-testid={`button-hint-step-${idx}`}
                                    title="Mostrar pista"
                                  >
                                    <Lightbulb className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>

                              {/* Feedback */}
                              <AnimatePresence>
                                {currentStepState === "wrong" && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-destructive text-sm"
                                  >
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    Respuesta incorrecta — revisa la notación e intenta de nuevo.
                                    {session!.wrongCount[idx] >= 2 && !hintShown && (
                                      <button
                                        className="underline text-accent ml-1"
                                        onClick={handleHint}
                                      >
                                        Ver pista
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Error count */}
                              {session!.wrongCount[idx] > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Intentos incorrectos en este paso: {session!.wrongCount[idx]}
                                </p>
                              )}

                              {/* Notation reminder */}
                              <p className="text-xs text-muted-foreground">
                                Usa: <code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code>,{" "}
                                <code>sin^2(x)</code>, <code>sin(2x)</code>, <code>sec(x)</code>, etc.
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion banner */}
              <AnimatePresence>
                {session?.done && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700 p-6 text-center space-y-3"
                  >
                    <div className="text-4xl">🎉</div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                      ¡Ejercicio Completado!
                    </h3>
                    <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground">{session.totalErrors}</span> error{session.totalErrors !== 1 ? "es" : ""}
                      </div>
                      <div>
                        <span className="font-bold text-foreground">{session.hintUsed.some(Boolean) ? "Con pista" : "Sin pistas"}</span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button onClick={resetExercise} variant="outline" data-testid="button-retry">
                        <RotateCcw className="w-4 h-4 mr-2" /> Repetir
                      </Button>
                      <Button
                        onClick={() => {
                          const idx = EXERCISES.findIndex((e) => e.id === activeExId);
                          if (idx < EXERCISES.length - 1) startExercise(EXERCISES[idx + 1]);
                        }}
                        data-testid="button-next-exercise"
                      >
                        Siguiente ejercicio <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Achievement toast */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <AchievementToast ids={newAchievements} onClose={() => setNewAchievements([])} />
        )}
      </AnimatePresence>
    </div>
  );
}
