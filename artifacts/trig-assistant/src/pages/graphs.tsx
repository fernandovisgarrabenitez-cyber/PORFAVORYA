import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EQUATIONS = [
  { id: "e1", label: "sin(x) = 0.5", type: "sin", A: 1, B: 0, C: 0.5 },
  { id: "e2", label: "2cos(x) - 1 = 0", type: "cos", A: 2, B: -1, C: 0 },
  { id: "e3", label: "tan(x) = 1", type: "tan", A: 1, B: 0, C: 1 },
];

export default function Graphs() {
  const [selectedEq, setSelectedEq] = useState(EQUATIONS[0].id);
  const [time, setTime] = useState(0);

  // Animation loop for unit circle
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTime(t => (t + 0.02) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const eqData = useMemo(() => EQUATIONS.find(e => e.id === selectedEq)!, [selectedEq]);

  // Solve the equation: A*fn(x) + B = C  => fn(x) = (C - B) / A
  const fnValue = (eqData.C - eqData.B) / eqData.A;
  
  // Calculate principal solutions in [0, 2PI)
  const solutions = useMemo(() => {
    let sols: number[] = [];
    if (eqData.type === "sin") {
      if (fnValue >= -1 && fnValue <= 1) {
        let s = Math.asin(fnValue);
        if (s < 0) s += 2 * Math.PI;
        sols.push(s);
        let s2 = Math.PI - Math.asin(fnValue);
        if (s2 < 0) s2 += 2 * Math.PI;
        if (Math.abs(s - s2) > 0.001) sols.push(s2);
      }
    } else if (eqData.type === "cos") {
      if (fnValue >= -1 && fnValue <= 1) {
        let s = Math.acos(fnValue);
        sols.push(s);
        let s2 = 2 * Math.PI - s;
        if (Math.abs(s - s2) > 0.001) sols.push(s2);
      }
    } else if (eqData.type === "tan") {
      let s = Math.atan(fnValue);
      if (s < 0) s += Math.PI;
      sols.push(s);
      sols.push(s + Math.PI);
    }
    return sols.sort((a,b) => a - b);
  }, [eqData, fnValue]);

  // Generate graph data from -2PI to 2PI
  const graphData = useMemo(() => {
    const data = [];
    for (let x = -2 * Math.PI; x <= 2 * Math.PI; x += 0.1) {
      let y = 0;
      if (eqData.type === "sin") y = Math.sin(x);
      else if (eqData.type === "cos") y = Math.cos(x);
      else if (eqData.type === "tan") {
        y = Math.tan(x);
        if (y > 5 || y < -5) y = NaN; // Prevent vertical asymptotes from drawing weirdly
      }
      data.push({ x, y, rawX: x });
    }
    return data;
  }, [eqData.type]);

  const formatRad = (val: number) => {
    const fraction = val / Math.PI;
    if (Math.abs(fraction) < 0.01) return "0";
    if (Math.abs(fraction - 1) < 0.01) return "π";
    if (Math.abs(fraction + 1) < 0.01) return "-π";
    if (Math.abs(fraction - 0.5) < 0.01) return "π/2";
    if (Math.abs(fraction + 0.5) < 0.01) return "-π/2";
    if (Math.abs(fraction - 2) < 0.01) return "2π";
    if (Math.abs(fraction + 2) < 0.01) return "-2π";
    return `${(fraction).toFixed(2)}π`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">El Generador de Gráficas</h1>
        <p className="text-muted-foreground">Visualiza ecuaciones trigonométricas en el círculo unitario y su onda correspondiente.</p>
      </div>

      <div className="mb-6 max-w-md">
        <Label className="mb-2 block">Selecciona una ecuación para analizar:</Label>
        <Select value={selectedEq} onValueChange={setSelectedEq}>
          <SelectTrigger className="font-mono text-lg py-6" data-testid="select-equation">
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            {EQUATIONS.map(eq => (
              <SelectItem key={eq.id} value={eq.id} className="font-mono">{eq.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {solutions.length === 0 ? (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin solución real</AlertTitle>
          <AlertDescription>Esta ecuación no tiene soluciones en los números reales.</AlertDescription>
        </Alert>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-wrap gap-4 items-center">
          <span className="font-semibold text-primary">Soluciones Principales [0, 2π):</span>
          {solutions.map((sol, i) => (
            <div key={i} className="bg-background px-3 py-1 rounded border font-mono text-sm shadow-sm">
              x = {(sol).toFixed(3)} rad ({Math.round((sol * 180)/Math.PI)}°)
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unit Circle */}
        <Card>
          <CardHeader>
            <CardTitle>Círculo Unitario</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="relative w-full max-w-[350px] aspect-square">
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full overflow-visible">
                <defs>
                  <pattern id="grid-small" width="0.2" height="0.2" patternUnits="userSpaceOnUse">
                    <path d="M 0.2 0 L 0 0 0 0.2" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.005" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect x="-1.2" y="-1.2" width="2.4" height="2.4" fill="url(#grid-small)" />
                
                {/* Axes */}
                <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="hsl(var(--foreground))" strokeWidth="0.01" />
                <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="hsl(var(--foreground))" strokeWidth="0.01" />
                
                {/* Circle */}
                <circle cx="0" cy="0" r="1" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.015" />

                {/* Animated Point */}
                <circle 
                  cx={Math.cos(time)} 
                  cy={-Math.sin(time)} 
                  r="0.03" 
                  fill="hsl(var(--accent))" 
                  opacity="0.5"
                />
                
                {/* Solution Points */}
                {solutions.map((sol, i) => (
                  <g key={i}>
                    <line 
                      x1="0" y1="0" 
                      x2={Math.cos(sol)} y2={-Math.sin(sol)} 
                      stroke="hsl(var(--destructive))" strokeWidth="0.01" strokeDasharray="0.05,0.02" 
                    />
                    <circle cx={Math.cos(sol)} cy={-Math.sin(sol)} r="0.04" fill="hsl(var(--destructive))" />
                    <text 
                      x={Math.cos(sol) * 1.15} 
                      y={-Math.sin(sol) * 1.15} 
                      fontSize="0.08" 
                      fill="hsl(var(--foreground))" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                    >
                      {Math.round((sol * 180)/Math.PI)}°
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Wave Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Onda Trigonométrica</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="x" 
                  type="number"
                  domain={[-2 * Math.PI, 2 * Math.PI]}
                  ticks={[-2*Math.PI, -Math.PI, 0, Math.PI, 2*Math.PI]}
                  tickFormatter={formatRad}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  domain={eqData.type === 'tan' ? [-3, 3] : [-1.5, 1.5]} 
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(2)}
                  labelFormatter={(label: number) => formatRad(label)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                
                {/* The wave line */}
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={false}
                  isAnimationActive={false}
                />
                
                {/* Horizontal line for the equation target C/A */}
                <ReferenceLine y={fnValue} stroke="hsl(var(--destructive))" strokeDasharray="5 5" strokeWidth={2} />
                
                {/* Vertical lines for solutions */}
                {solutions.map((sol, i) => (
                  <ReferenceLine key={`sol-pos-${i}`} x={sol} stroke="hsl(var(--destructive))" strokeWidth={1} />
                ))}
                {solutions.map((sol, i) => (
                  <ReferenceLine key={`sol-neg-${i}`} x={sol - 2*Math.PI} stroke="hsl(var(--destructive))" strokeWidth={1} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}