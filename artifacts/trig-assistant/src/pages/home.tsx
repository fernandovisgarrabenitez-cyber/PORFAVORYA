import { Link } from "wouter";
import { Triangle, Activity, Waves, ArrowRight, BookOpen, Dumbbell, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAchievements } from "@/lib/achievements";

export default function Home() {
  const { unlockedCount, totalCount } = useAchievements();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      {/* Hero */}
      <div className="text-center mb-14 space-y-4">
        <motion.h1
          className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Domina la <span className="text-primary">Trigonometría</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          El Asistente Trigonométrico te guía paso a paso. No solo te damos la respuesta,
          te mostramos el camino con explicaciones claras y visualizaciones interactivas.
        </motion.p>

        {/* Logros button — prominent CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-2"
        >
          <Button asChild variant="outline" className="border-yellow-400 hover:bg-yellow-50 hover:border-yellow-500 dark:hover:bg-yellow-900/20 gap-2 text-yellow-700 dark:text-yellow-400" data-testid="link-logros">
            <Link href="/logros">
              <Trophy className="w-4 h-4" />
              Mis Logros
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {unlockedCount}/{totalCount}
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Main cards grid — 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {/* Triángulos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Triangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Triángulos</CardTitle>
              <CardDescription>El Constructor de Triángulos</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground text-sm">
              Resuelve triángulos rectángulos y oblicuángulos. Ingresa los datos que conoces y descubre el resto con explicaciones usando la ley de senos, cosenos o Pitágoras.
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full group" data-testid="link-triangles">
                <Link href="/triangulos">
                  Comenzar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Identidades */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-chart-4" />
              </div>
              <CardTitle className="text-xl font-display">Identidades</CardTitle>
              <CardDescription>El Desarmador de Identidades</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground text-sm">
              Escribe tu ejercicio y la app lo demuestra paso a paso. Aprende cada transformación con su regla, fórmula y explicación.
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full group" data-testid="link-identities">
                <Link href="/identidades">
                  Comenzar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Gráficas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-3">
                <Waves className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-xl font-display">Gráficas</CardTitle>
              <CardDescription>El Generador de Gráficas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground text-sm">
              Visualiza el círculo unitario y las ondas sinusoidales en tiempo real. Resuelve ecuaciones trigonométricas y mira cómo las soluciones aparecen en la gráfica.
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full group" data-testid="link-graphs">
                <Link href="/graficas">
                  Comenzar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Ejercicios — highlighted */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="h-full flex flex-col border-primary/40 hover:border-primary transition-colors bg-primary/5 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center mb-3">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Ejercicios</CardTitle>
              <CardDescription>Practica y Gana Logros</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground text-sm">
              Resuelve 9 ejercicios de tres niveles escribiendo cada paso tú mismo. La app te confirma si vas bien o mal. Completa ejercicios para desbloquear logros.
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full group" data-testid="link-exercises">
                <Link href="/ejercicios">
                  Practicar ahora <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Methodology */}
      <motion.div
        className="p-8 rounded-2xl bg-muted/50 border flex flex-col md:flex-row items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div className="flex-1 space-y-3">
          <h3 className="text-2xl font-bold font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Metodología de Aprendizaje
          </h3>
          <p className="text-muted-foreground">
            Creemos que las matemáticas se entienden mejor cuando ves el "por qué" y el "cómo".
            Practica, comete errores, usa pistas y gana logros. El progreso se guarda automáticamente.
          </p>
        </div>
        <div className="w-full md:w-1/3 aspect-video bg-card rounded-lg border shadow-sm flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
            <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="90" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
            <path d="M 10 90 Q 50 10 90 90" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
