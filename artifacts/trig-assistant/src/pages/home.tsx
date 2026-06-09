import { Link } from "wouter";
import { Triangle, Activity, Waves, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
      <div className="text-center mb-16 space-y-4">
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
          te mostramos el camino para llegar a ella con explicaciones claras y visualizaciones interactivas.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Triangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Triángulos</CardTitle>
              <CardDescription className="text-base">
                El Constructor de Triángulos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground">
              <p>Resuelve triángulos rectángulos y oblicuángulos. Ingresa los lados o ángulos que conoces y descubre el resto con explicaciones paso a paso usando leyes de senos, cosenos o Pitágoras.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full group" data-testid="link-triangles">
                <Link href="/triangulos">
                  Comenzar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-chart-4" />
              </div>
              <CardTitle className="text-2xl font-display">Identidades</CardTitle>
              <CardDescription className="text-base">
                El Desarmador de Identidades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground">
              <p>Domina las identidades trigonométricas con nuestro sistema de pistas. Un rompecabezas paso a paso que te enseña a transformar y simplificar expresiones complejas.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full group" data-testid="link-identities">
                <Link href="/identidades">
                  Comenzar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Waves className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-2xl font-display">Gráficas</CardTitle>
              <CardDescription className="text-base">
                El Generador de Gráficas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-muted-foreground">
              <p>Visualiza el círculo unitario y las ondas sinusoidales en tiempo real. Resuelve ecuaciones trigonométricas y mira cómo las soluciones se mapean en la gráfica.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full group" data-testid="link-graphs">
                <Link href="/graficas">
                  Comenzar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        className="mt-20 p-8 rounded-2xl bg-muted/50 border flex flex-col md:flex-row items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Metodología de Aprendizaje
          </h3>
          <p className="text-muted-foreground">
            Creemos que las matemáticas se entienden mejor cuando ves el "por qué" y el "cómo". 
            Nuestra plataforma no es una simple calculadora: es un entorno diseñado para construir 
            intuición matemática paso a paso.
          </p>
        </div>
        <div className="w-full md:w-1/3 aspect-video relative bg-card rounded-lg border shadow-sm flex items-center justify-center overflow-hidden">
          {/* Simple decorative graphic */}
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