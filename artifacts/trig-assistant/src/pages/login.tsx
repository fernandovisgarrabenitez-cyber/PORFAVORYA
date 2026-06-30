import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn, UserPlus, Triangle } from "lucide-react";

type Mode = "login" | "register";

interface FieldError {
  email?: string;
  username?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiCall(path: string, body: object) {
  const res = await fetch(`${BASE}/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error desconocido");
  return data;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function switchMode(m: Mode) {
    setMode(m);
    setErrors({});
  }

  function validateRegister(): boolean {
    const e: FieldError = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Ingresa un correo electrónico válido";
    if (!username || username.length < 3)
      e.username = "Mínimo 3 caracteres";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      e.username = "Solo letras, números y guión bajo";
    if (!password || password.length < 8)
      e.password = "Mínimo 8 caracteres";
    if (password !== confirm)
      e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateLogin(): boolean {
    const e: FieldError = {};
    if (!username) e.username = "Ingresa tu nombre de usuario";
    if (!password) e.password = "Ingresa tu contraseña";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && !validateRegister()) return;
    if (mode === "login" && !validateLogin()) return;

    setLoading(true);
    setErrors({});
    try {
      let data;
      if (mode === "register") {
        data = await apiCall("/register", { email, username, password });
      } else {
        data = await apiCall("/login", { username, password });
      }
      login(data.username, data.token);
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : "Error al conectar" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-blue-600 text-white rounded-lg p-2">
              <Triangle className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">El Asistente Trigonométrico</span>
          </div>
          <p className="text-slate-500 text-sm">Tu plataforma de aprendizaje de trigonometría</p>
        </div>

        <div className="flex rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 p-1 gap-1">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Registrarse
          </button>
        </div>

        <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Ingresa tu usuario y contraseña para continuar"
                : "Completa los campos para registrarte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    disabled={loading}
                    className={errors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={mode === "register" ? "ej. alumno_123" : "Tu usuario"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  disabled={loading}
                  autoComplete={mode === "login" ? "username" : "off"}
                  className={errors.username ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.username && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={72}
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={errors.password ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    maxLength={72}
                    disabled={loading}
                    autoComplete="new-password"
                    className={errors.confirm ? "border-red-400 focus-visible:ring-red-300" : ""}
                  />
                  {errors.confirm && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.confirm}
                    </p>
                  )}
                </div>
              )}

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Entrando..." : "Registrando..."}
                  </span>
                ) : mode === "login" ? (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Iniciar Sesión
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Crear Cuenta
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="text-blue-600 hover:underline font-medium"
          >
            {mode === "login" ? "Regístrate aquí" : "Inicia sesión aquí"}
          </button>
        </p>
      </div>
    </div>
  );
}
