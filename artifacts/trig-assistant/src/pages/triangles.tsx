import { useState } from "react";
import { solveTriangle, TriangleData, Step } from "@/lib/triangle-solver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Math as MathRenderer } from "@/components/math-renderer";

export default function Triangles() {
  const [data, setData] = useState<TriangleData>({
    a: null, b: null, c: null,
    A: null, B: null, C: null
  });

  const [result, setResult] = useState<{solved: TriangleData, steps: Step[], isRight: boolean, error?: string} | null>(null);

  const handleSolve = () => {
    setResult(solveTriangle(data));
  };

  const handleClear = () => {
    setData({ a: null, b: null, c: null, A: null, B: null, C: null });
    setResult(null);
  };

  const currentDisplay = result ? result.solved : data;

  // Simple SVG Drawing logic based on coordinates
  // Place vertex C at origin (0,0), vertex A at (b, 0), and vertex B calculated using angle A or side c.
  const drawTriangle = () => {
    let { a, b, c, A, B, C } = currentDisplay;
    // Fallbacks if not solved to make a placeholder triangle
    if (!a || !b || !c) {
      a = 50; b = 60; c = 70; A = 44; B = 57; C = 79;
    }
    
    // Scale everything to fit in a 300x200 viewBox
    const scale = 200 / Math.max(a, b, c);
    
    const bx = b * scale;
    const ax = 0;
    const ay = 0;
    
    // Using law of cosines to find coordinates of vertex B
    // We know C is at origin. B is at (c*cos(A), c*sin(A)) relative to A?
    // Let's put A at origin (0,0). C at (b, 0).
    const pxA = 20; // offset
    const pyA = 250; 
    
    const pxC = pxA + (b * scale);
    const pyC = pyA;

    // Angle at A is A degrees.
    const radA = (A * Math.PI) / 180;
    const pxB = pxA + (c * scale * Math.cos(radA));
    const pyB = pyA - (c * scale * Math.sin(radA)); // SVG y is down

    return (
      <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grid)" />
        
        {/* Triangle path */}
        <polygon 
          points={`${pxA},${pyA} ${pxB},${pyB} ${pxC},${pyC}`} 
          fill="hsl(var(--primary) / 0.1)" 
          stroke="hsl(var(--primary))" 
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Labels */}
        <text x={pxA - 10} y={pyA + 15} fill="hsl(var(--foreground))" fontWeight="bold" fontSize="14">A {currentDisplay.A ? `${currentDisplay.A}°` : ''}</text>
        <text x={pxB - 5} y={pyB - 10} fill="hsl(var(--foreground))" fontWeight="bold" fontSize="14">B {currentDisplay.B ? `${currentDisplay.B}°` : ''}</text>
        <text x={pxC + 10} y={pyC + 15} fill="hsl(var(--foreground))" fontWeight="bold" fontSize="14">C {currentDisplay.C ? `${currentDisplay.C}°` : ''}</text>

        {/* Side labels */}
        <text x={(pxA + pxB)/2 - 15} y={(pyA + pyB)/2 - 10} fill="hsl(var(--accent))" fontWeight="bold" fontSize="14">c={currentDisplay.c || '?'}</text>
        <text x={(pxB + pxC)/2 + 10} y={(pyB + pyC)/2 - 10} fill="hsl(var(--accent))" fontWeight="bold" fontSize="14">a={currentDisplay.a || '?'}</text>
        <text x={(pxA + pxC)/2} y={pyC + 20} fill="hsl(var(--accent))" fontWeight="bold" fontSize="14" textAnchor="middle">b={currentDisplay.b || '?'}</text>
      </svg>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">El Constructor de Triángulos</h1>
        <p className="text-muted-foreground">Ingresa al menos 3 valores (incluyendo un lado) para resolver el triángulo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Datos del Triángulo</CardTitle>
              <CardDescription>Lados (a, b, c) y Ángulos opuestos en grados (A, B, C)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="side-a" className="text-accent font-semibold">Lado a</Label>
                    <Input id="side-a" type="number" placeholder="Ej: 5" value={data.a || ''} onChange={e => setData({...data, a: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="side-b" className="text-accent font-semibold">Lado b</Label>
                    <Input id="side-b" type="number" placeholder="Ej: 7" value={data.b || ''} onChange={e => setData({...data, b: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="side-c" className="text-accent font-semibold">Lado c</Label>
                    <Input id="side-c" type="number" placeholder="Ej: 8" value={data.c || ''} onChange={e => setData({...data, c: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ang-A" className="text-primary font-semibold">Ángulo A (°)</Label>
                    <Input id="ang-A" type="number" placeholder="Ej: 40" value={data.A || ''} onChange={e => setData({...data, A: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ang-B" className="text-primary font-semibold">Ángulo B (°)</Label>
                    <Input id="ang-B" type="number" placeholder="Ej: 60" value={data.B || ''} onChange={e => setData({...data, B: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ang-C" className="text-primary font-semibold">Ángulo C (°)</Label>
                    <Input id="ang-C" type="number" placeholder="Ej: 80" value={data.C || ''} onChange={e => setData({...data, C: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSolve} className="flex-1" data-testid="button-solve-triangle">Resolver Triángulo</Button>
                <Button variant="outline" onClick={handleClear} data-testid="button-clear-triangle">
                  <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {result?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden bg-card/50">
            <div className="aspect-video w-full bg-white relative">
              {drawTriangle()}
              {result && (
                <div className="absolute top-4 right-4 bg-background/90 px-3 py-1.5 rounded-md border text-sm font-medium">
                  {result.isRight ? "Triángulo Rectángulo" : "Triángulo Oblicuángulo"}
                </div>
              )}
            </div>
          </Card>

          <AnimatePresence>
            {result && !result.error && result.steps.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-display font-semibold border-b pb-2">Pasos de Resolución</h3>
                <div className="space-y-4">
                  {result.steps.map((step, idx) => (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                    >
                      <Card className="border-l-4 border-l-primary">
                        <CardHeader className="py-3 bg-muted/30">
                          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 space-y-3">
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <div className="bg-muted/50 p-3 rounded-md text-sm border flex items-center justify-center">
                            <MathRenderer formula={step.formula} display />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {result && !result.error && result.steps.length === 0 && (
              <Alert className="bg-primary/5 border-primary/20 text-primary">
                <AlertDescription>El triángulo ya estaba completamente resuelto con los datos proporcionados.</AlertDescription>
              </Alert>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}