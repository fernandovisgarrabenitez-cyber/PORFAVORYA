import { useState, useEffect, useCallback } from "react";
import { EXERCISES } from "./exercises";

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: Rarity;
  check: (stats: UserStats) => boolean;
  /** Progress-based achievements can show a fraction */
  progress?: (stats: UserStats) => { current: number; total: number };
};

export type UserStats = {
  completedExercises: string[];       // IDs of completed exercises
  noHintExercises: string[];          // completed without using any hint
  perfectExercises: string[];         // completed with 0 wrong answers
  totalSolvingAttempts: number;       // total "Check" button presses across all exercises
  unlockedAchievements: string[];     // IDs of already-unlocked achievements
};

const STORAGE_KEY = "trig_user_stats";

const DEFAULT_STATS: UserStats = {
  completedExercises: [],
  noHintExercises: [],
  perfectExercises: [],
  totalSolvingAttempts: 0,
  unlockedAchievements: [],
};

// ══════════════════════════════════════════════════════════
// ACHIEVEMENT DEFINITIONS
// ══════════════════════════════════════════════════════════

const easyIds = EXERCISES.filter((e) => e.difficulty === "easy").map((e) => e.id);
const mediumIds = EXERCISES.filter((e) => e.difficulty === "medium").map((e) => e.id);
const hardIds = EXERCISES.filter((e) => e.difficulty === "hard").map((e) => e.id);
const allIds = EXERCISES.map((e) => e.id);

export const ACHIEVEMENTS: Achievement[] = [
  // ── Common ───────────────────────────────────────────
  {
    id: "first-step",
    title: "Primer Paso",
    description: "Completa tu primer ejercicio.",
    icon: "🎯",
    rarity: "common",
    check: (s) => s.completedExercises.length >= 1,
    progress: (s) => ({ current: Math.min(s.completedExercises.length, 1), total: 1 }),
  },
  {
    id: "three-done",
    title: "Estudiante Dedicado",
    description: "Completa 3 ejercicios.",
    icon: "📚",
    rarity: "common",
    check: (s) => s.completedExercises.length >= 3,
    progress: (s) => ({ current: Math.min(s.completedExercises.length, 3), total: 3 }),
  },
  {
    id: "easy-master",
    title: "Básicos Dominados",
    description: "Completa todos los ejercicios fáciles.",
    icon: "✅",
    rarity: "common",
    check: (s) => easyIds.every((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: easyIds.filter((id) => s.completedExercises.includes(id)).length,
      total: easyIds.length,
    }),
  },

  // ── Rare ─────────────────────────────────────────────
  {
    id: "five-done",
    title: "En Racha",
    description: "Completa 5 ejercicios.",
    icon: "🔥",
    rarity: "rare",
    check: (s) => s.completedExercises.length >= 5,
    progress: (s) => ({ current: Math.min(s.completedExercises.length, 5), total: 5 }),
  },
  {
    id: "medium-first",
    title: "Nivel Medio",
    description: "Completa un ejercicio de dificultad media.",
    icon: "⚡",
    rarity: "rare",
    check: (s) => mediumIds.some((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: mediumIds.filter((id) => s.completedExercises.includes(id)).length >= 1 ? 1 : 0,
      total: 1,
    }),
  },
  {
    id: "no-hints",
    title: "Sin Pistas",
    description: "Completa un ejercicio sin usar ninguna pista.",
    icon: "🧠",
    rarity: "rare",
    check: (s) => s.noHintExercises.length >= 1,
    progress: (s) => ({ current: Math.min(s.noHintExercises.length, 1), total: 1 }),
  },
  {
    id: "double-angle",
    title: "Ángulo Doble",
    description: "Completa el ejercicio de seno del ángulo doble.",
    icon: "〽️",
    rarity: "rare",
    check: (s) => s.completedExercises.includes("ex-m3"),
  },
  {
    id: "perfect-first",
    title: "Sin Errores",
    description: "Completa un ejercicio sin ninguna respuesta incorrecta.",
    icon: "💎",
    rarity: "rare",
    check: (s) => s.perfectExercises.length >= 1,
    progress: (s) => ({ current: Math.min(s.perfectExercises.length, 1), total: 1 }),
  },

  // ── Epic ─────────────────────────────────────────────
  {
    id: "medium-master",
    title: "Intermedio Dominado",
    description: "Completa todos los ejercicios de dificultad media.",
    icon: "🏆",
    rarity: "epic",
    check: (s) => mediumIds.every((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: mediumIds.filter((id) => s.completedExercises.includes(id)).length,
      total: mediumIds.length,
    }),
  },
  {
    id: "hard-first",
    title: "Desafío Aceptado",
    description: "Completa un ejercicio de dificultad difícil.",
    icon: "⚔️",
    rarity: "epic",
    check: (s) => hardIds.some((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: hardIds.filter((id) => s.completedExercises.includes(id)).length >= 1 ? 1 : 0,
      total: 1,
    }),
  },
  {
    id: "three-no-hints",
    title: "Mente Pura",
    description: "Completa 3 ejercicios sin usar ninguna pista.",
    icon: "🌟",
    rarity: "epic",
    check: (s) => s.noHintExercises.length >= 3,
    progress: (s) => ({ current: Math.min(s.noHintExercises.length, 3), total: 3 }),
  },

  // ── Legendary ────────────────────────────────────────
  {
    id: "hard-master",
    title: "Élite Trigonométrica",
    description: "Completa todos los ejercicios difíciles.",
    icon: "👑",
    rarity: "legendary",
    check: (s) => hardIds.every((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: hardIds.filter((id) => s.completedExercises.includes(id)).length,
      total: hardIds.length,
    }),
  },
  {
    id: "all-done",
    title: "Maestro Trigonométrico",
    description: "Completa todos los ejercicios de la plataforma.",
    icon: "🎓",
    rarity: "legendary",
    check: (s) => allIds.every((id) => s.completedExercises.includes(id)),
    progress: (s) => ({
      current: allIds.filter((id) => s.completedExercises.includes(id)).length,
      total: allIds.length,
    }),
  },
  {
    id: "invincible",
    title: "Invicto",
    description: "Completa todos los ejercicios sin ningún error en ninguno.",
    icon: "⭐",
    rarity: "legendary",
    check: (s) => allIds.every((id) => s.perfectExercises.includes(id)),
    progress: (s) => ({
      current: allIds.filter((id) => s.perfectExercises.includes(id)).length,
      total: allIds.length,
    }),
  },
];

// ══════════════════════════════════════════════════════════
// STORAGE HELPERS
// ══════════════════════════════════════════════════════════

// A02: Validate localStorage data shape before trusting it
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function sanitizeStats(raw: unknown): UserStats {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...DEFAULT_STATS };
  const r = raw as Record<string, unknown>;
  return {
    completedExercises: isStringArray(r.completedExercises) ? r.completedExercises.slice(0, 100) : [],
    noHintExercises: isStringArray(r.noHintExercises) ? r.noHintExercises.slice(0, 100) : [],
    perfectExercises: isStringArray(r.perfectExercises) ? r.perfectExercises.slice(0, 100) : [],
    totalSolvingAttempts: typeof r.totalSolvingAttempts === "number" && r.totalSolvingAttempts >= 0
      ? Math.min(Math.floor(r.totalSolvingAttempts), 1_000_000)
      : 0,
    unlockedAchievements: isStringArray(r.unlockedAchievements) ? r.unlockedAchievements.slice(0, 100) : [],
  };
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    // A02: Guard against oversized or malformed localStorage data
    if (raw.length > 10_000) {
      localStorage.removeItem(STORAGE_KEY);
      return { ...DEFAULT_STATS };
    }
    return sanitizeStats(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // silently fail
  }
}

// Evaluate which achievements just became unlocked given new stats
export function evaluateNewAchievements(
  newStats: UserStats,
  previouslyUnlocked: string[]
): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!previouslyUnlocked.includes(ach.id) && ach.check(newStats)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

// ══════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════

export function useAchievements() {
  const [stats, setStats] = useState<UserStats>(loadStats);

  // Sync to localStorage whenever stats change
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordCompletion = useCallback(
    (exerciseId: string, usedHints: boolean, hadErrors: boolean) => {
      setStats((prev) => {
        const updated: UserStats = {
          ...prev,
          completedExercises: prev.completedExercises.includes(exerciseId)
            ? prev.completedExercises
            : [...prev.completedExercises, exerciseId],
          noHintExercises:
            !usedHints && !prev.noHintExercises.includes(exerciseId)
              ? [...prev.noHintExercises, exerciseId]
              : prev.noHintExercises,
          perfectExercises:
            !hadErrors && !prev.perfectExercises.includes(exerciseId)
              ? [...prev.perfectExercises, exerciseId]
              : prev.perfectExercises,
        };

        // Compute newly unlocked achievements
        const newlyUnlocked = evaluateNewAchievements(updated, prev.unlockedAchievements);
        if (newlyUnlocked.length > 0) {
          updated.unlockedAchievements = [...prev.unlockedAchievements, ...newlyUnlocked];
        }

        return updated;
      });
    },
    []
  );

  const recordAttempt = useCallback(() => {
    setStats((prev) => ({ ...prev, totalSolvingAttempts: prev.totalSolvingAttempts + 1 }));
  }, []);

  const unlockedIds = stats.unlockedAchievements;
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return { stats, unlockedIds, unlockedCount, totalCount, recordCompletion, recordAttempt };
}

// ══════════════════════════════════════════════════════════
// RARITY STYLES
// ══════════════════════════════════════════════════════════

export const RARITY_STYLES: Record<Rarity, { border: string; bg: string; badge: string; label: string }> = {
  common: {
    border: "border-gray-300 dark:border-gray-600",
    bg: "bg-gray-50 dark:bg-gray-900/30",
    badge: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    label: "Común",
  },
  rare: {
    border: "border-blue-400 dark:border-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    label: "Raro",
  },
  epic: {
    border: "border-purple-400 dark:border-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    label: "Épico",
  },
  legendary: {
    border: "border-yellow-400 dark:border-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    label: "Legendario",
  },
};
