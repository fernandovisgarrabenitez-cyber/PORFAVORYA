import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import { ACHIEVEMENTS, RARITY_STYLES, useAchievements } from "@/lib/achievements";

const RARITY_ORDER = ["common", "rare", "epic", "legendary"] as const;

export default function Achievements() {
  const { stats, unlockedIds, unlockedCount, totalCount } = useAchievements();

  const pct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-display">Logros</h1>
        </div>
        <p className="text-muted-foreground">
          Completa ejercicios para desbloquear logros. Algunos requieren esfuerzo extra — ¡inténtalo!
        </p>

        {/* Overall progress */}
        <div className="mt-5 p-5 rounded-xl border bg-card/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-foreground">Progreso total</span>
            <span className="text-2xl font-bold text-primary">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{pct}% completado</p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{stats.completedExercises.length}</p>
              <p className="text-xs text-muted-foreground">ejercicios</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.noHintExercises.length}</p>
              <p className="text-xs text-muted-foreground">sin pistas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.perfectExercises.length}</p>
              <p className="text-xs text-muted-foreground">sin errores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement grid by rarity */}
      <div className="space-y-10">
        {RARITY_ORDER.map((rarity) => {
          const group = ACHIEVEMENTS.filter((a) => a.rarity === rarity);
          const style = RARITY_STYLES[rarity];

          return (
            <section key={rarity}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.badge}`}>
                  {style.label}
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {group.filter((a) => unlockedIds.includes(a.id)).length}/{group.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.map((ach, idx) => {
                  const unlocked = unlockedIds.includes(ach.id);
                  const prog = ach.progress ? ach.progress(stats) : null;

                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className={`relative rounded-xl border-2 p-5 transition-all ${
                        unlocked
                          ? `${style.border} ${style.bg}`
                          : "border-muted bg-muted/10"
                      }`}
                      data-testid={`achievement-${ach.id}`}
                    >
                      {/* Locked overlay */}
                      {!unlocked && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`text-4xl shrink-0 transition-all ${unlocked ? "" : "grayscale opacity-40"}`}>
                          {ach.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                            {ach.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ach.description}
                          </p>

                          {/* Progress bar for multi-step achievements */}
                          {prog && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progreso</span>
                                <span>{prog.current}/{prog.total}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  className={`h-1.5 rounded-full ${unlocked ? "bg-primary" : "bg-muted-foreground/40"}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((prog.current / prog.total) * 100, 100)}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.07 + 0.2 }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Unlocked badge */}
                          {unlocked && (
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-2 ${style.badge}`}>
                              Desbloqueado
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
