import { Link, useLocation } from "wouter";
import { Calculator, Triangle, Activity, Waves } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Inicio", icon: Calculator },
    { path: "/triangulos", label: "Triángulos", icon: Triangle },
    { path: "/identidades", label: "Identidades", icon: Activity },
    { path: "/graficas", label: "Gráficas", icon: Waves },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 mr-8">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Triangle className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg hidden sm:inline-block font-display">
              El Asistente Trigonométrico
            </span>
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-4 flex-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive 
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