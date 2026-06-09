import { Link, useLocation } from "wouter";
import { Calculator, Triangle, Activity, Waves, Dumbbell, Trophy } from "lucide-react";
import { useAchievements } from "@/lib/achievements";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { unlockedCount, totalCount } = useAchievements();

  const navItems = [
    { path: "/", label: "Inicio", icon: Calculator },
    { path: "/triangulos", label: "Triángulos", icon: Triangle },
    { path: "/identidades", label: "Identidades", icon: Activity },
    { path: "/graficas", label: "Gráficas", icon: Waves },
    { path: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
  ];

  const isActive = (path: string) =>
    location === path || (path !== "/" && location.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Triangle className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg hidden sm:inline-block font-display">
              El Asistente Trigonométrico
            </span>
          </Link>

          <nav className="flex items-center space-x-1 flex-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logros button — always visible */}
          <Link
            href="/logros"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ml-2 ${
              isActive("/logros")
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "text-muted-foreground hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
            }`}
            data-testid="nav-logros"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline-block">Logros</span>
            {unlockedCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {unlockedCount}/{totalCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative grid-bg">
        {children}
      </main>

      <footer className="py-6 border-t bg-card mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>Diseñado con precisión matemática.</p>
        </div>
      </footer>
    </div>
  );
}
