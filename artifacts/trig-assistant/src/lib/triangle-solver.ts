// Triangle Logic Solver
export type TriangleData = {
  a: number | null;
  b: number | null;
  c: number | null;
  A: number | null;
  B: number | null;
  C: number | null;
};

export type Step = {
  id: string;
  title: string;
  description: string;
  formula: string;
};

const round = (n: number) => Math.round(n * 100) / 100;
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export function solveTriangle(input: TriangleData): { solved: TriangleData, steps: Step[], isRight: boolean, error?: string } {
  let t = { ...input };
  let steps: Step[] = [];
  let changesMade = true;
  let iterations = 0;

  // Basic validation
  let knownCount = Object.values(t).filter(v => v !== null).length;
  if (knownCount < 3) {
    return { solved: t, steps, isRight: false, error: "Se necesitan al menos 3 valores." };
  }
  let knownSides = [t.a, t.b, t.c].filter(v => v !== null).length;
  if (knownSides === 0) {
    return { solved: t, steps, isRight: false, error: "Se necesita al menos 1 lado para calcular las proporciones." };
  }

  while (changesMade && iterations < 10) {
    changesMade = false;
    iterations++;

    // 1. Sum of Angles = 180
    if (t.A !== null && t.B !== null && t.C === null) {
      t.C = round(180 - t.A - t.B);
      steps.push({ id: `ang-C-${iterations}`, title: "Suma de Ángulos", description: "La suma de los ángulos internos de un triángulo es 180°.", formula: `C = 180° - A - B = 180° - ${t.A}° - ${t.B}° = ${t.C}°` });
      changesMade = true;
    } else if (t.A !== null && t.C !== null && t.B === null) {
      t.B = round(180 - t.A - t.C);
      steps.push({ id: `ang-B-${iterations}`, title: "Suma de Ángulos", description: "La suma de los ángulos internos es 180°.", formula: `B = 180° - A - C = 180° - ${t.A}° - ${t.C}° = ${t.B}°` });
      changesMade = true;
    } else if (t.B !== null && t.C !== null && t.A === null) {
      t.A = round(180 - t.B - t.C);
      steps.push({ id: `ang-A-${iterations}`, title: "Suma de Ángulos", description: "La suma de los ángulos internos es 180°.", formula: `A = 180° - B - C = 180° - ${t.B}° - ${t.C}° = ${t.A}°` });
      changesMade = true;
    }

    // Right triangle specific rules (Pythagoras)
    let isRight = t.A === 90 || t.B === 90 || t.C === 90;
    if (isRight) {
      let hyp = t.C === 90 ? 'c' : (t.A === 90 ? 'a' : 'b');
      let leg1 = hyp === 'c' ? 'a' : (hyp === 'a' ? 'b' : 'a');
      let leg2 = hyp === 'c' ? 'b' : (hyp === 'a' ? 'c' : 'c');
      
      // Pythagorean
      if (t[hyp] === null && t[leg1] !== null && t[leg2] !== null) {
        t[hyp] = round(Math.sqrt(Math.pow(t[leg1]!, 2) + Math.pow(t[leg2]!, 2)));
        steps.push({ id: `pyth-hyp-${iterations}`, title: "Teorema de Pitágoras", description: `En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos.`, formula: `${hyp} = \\sqrt{${leg1}^2 + ${leg2}^2} = ${t[hyp]}` });
        changesMade = true;
      } else if (t[leg1] === null && t[hyp] !== null && t[leg2] !== null) {
        t[leg1] = round(Math.sqrt(Math.pow(t[hyp]!, 2) - Math.pow(t[leg2]!, 2)));
        steps.push({ id: `pyth-leg1-${iterations}`, title: "Teorema de Pitágoras", description: "Despejamos el cateto restante.", formula: `${leg1} = \\sqrt{${hyp}^2 - ${leg2}^2} = ${t[leg1]}` });
        changesMade = true;
      } else if (t[leg2] === null && t[hyp] !== null && t[leg1] !== null) {
        t[leg2] = round(Math.sqrt(Math.pow(t[hyp]!, 2) - Math.pow(t[leg1]!, 2)));
        steps.push({ id: `pyth-leg2-${iterations}`, title: "Teorema de Pitágoras", description: "Despejamos el cateto restante.", formula: `${leg2} = \\sqrt{${hyp}^2 - ${leg1}^2} = ${t[leg2]}` });
        changesMade = true;
      }
    }

    // Law of Sines: a/sinA = b/sinB = c/sinC
    const findSineMissing = (side1: 'a'|'b'|'c', ang1: 'A'|'B'|'C', side2: 'a'|'b'|'c', ang2: 'A'|'B'|'C') => {
      if (t[side1] !== null && t[ang1] !== null) {
        if (t[side2] === null && t[ang2] !== null) {
          t[side2] = round((t[side1]! * Math.sin(degToRad(t[ang2]!))) / Math.sin(degToRad(t[ang1]!)));
          steps.push({ id: `sin-side-${side2}-${iterations}`, title: "Ley de Senos", description: "Usamos la Ley de Senos porque conocemos una pareja lado-ángulo y un ángulo adicional (AAL o ALA).", formula: `${side2} = \\frac{${side1} \\cdot \\sin(${ang2})}{\\sin(${ang1})} = ${t[side2]}` });
          return true;
        }
        if (t[ang2] === null && t[side2] !== null) {
          let sinVal = (t[side2]! * Math.sin(degToRad(t[ang1]!))) / t[side1]!;
          if (sinVal <= 1) {
            t[ang2] = round(radToDeg(Math.asin(sinVal)));
            steps.push({ id: `sin-ang-${ang2}-${iterations}`, title: "Ley de Senos", description: "Conocemos dos lados y el ángulo opuesto a uno de ellos (LLA). Encontramos el ángulo opuesto al otro.", formula: `${ang2} = \\arcsin\\left(\\frac{${side2} \\cdot \\sin(${ang1})}{${side1}}\\right) = ${t[ang2]}°` });
            return true;
          }
        }
      }
      return false;
    };

    if (!changesMade) changesMade = findSineMissing('a','A','b','B') || findSineMissing('b','B','a','A') ||
                                    findSineMissing('b','B','c','C') || findSineMissing('c','C','b','B') ||
                                    findSineMissing('a','A','c','C') || findSineMissing('c','C','a','A');

    // Law of Cosines
    // c^2 = a^2 + b^2 - 2ab*cos(C)
    const findCosSide = (side1:'a'|'b'|'c', side2:'a'|'b'|'c', side3:'a'|'b'|'c', ang3:'A'|'B'|'C') => {
      if (t[side3] === null && t[side1] !== null && t[side2] !== null && t[ang3] !== null) {
        t[side3] = round(Math.sqrt(Math.pow(t[side1]!, 2) + Math.pow(t[side2]!, 2) - 2 * t[side1]! * t[side2]! * Math.cos(degToRad(t[ang3]!))));
        steps.push({ id: `cos-side-${side3}-${iterations}`, title: "Ley de Cosenos", description: "Conocemos dos lados y el ángulo entre ellos (LAL). Usamos la Ley de Cosenos para encontrar el tercer lado.", formula: `${side3} = \\sqrt{${side1}^2 + ${side2}^2 - 2(${side1})(${side2})\\cos(${ang3})} = ${t[side3]}` });
        return true;
      }
      return false;
    };
    if (!changesMade) changesMade = findCosSide('a','b','c','C') || findCosSide('a','c','b','B') || findCosSide('b','c','a','A');

    const findCosAng = (side1:'a'|'b'|'c', side2:'a'|'b'|'c', side3:'a'|'b'|'c', ang3:'A'|'B'|'C') => {
      if (t[ang3] === null && t[side1] !== null && t[side2] !== null && t[side3] !== null) {
        let cosVal = (Math.pow(t[side1]!, 2) + Math.pow(t[side2]!, 2) - Math.pow(t[side3]!, 2)) / (2 * t[side1]! * t[side2]!);
        if (cosVal >= -1 && cosVal <= 1) {
          t[ang3] = round(radToDeg(Math.acos(cosVal)));
          steps.push({ id: `cos-ang-${ang3}-${iterations}`, title: "Ley de Cosenos", description: "Conocemos los tres lados (LLL). Encontramos un ángulo usando la Ley de Cosenos despejada.", formula: `${ang3} = \\arccos\\left(\\frac{${side1}^2 + ${side2}^2 - ${side3}^2}{2(${side1})(${side2})}\\right) = ${t[ang3]}°` });
          return true;
        }
      }
      return false;
    };
    if (!changesMade) changesMade = findCosAng('a','b','c','C') || findCosAng('a','c','b','B') || findCosAng('b','c','a','A');
  }

  let isComplete = Object.values(t).every(v => v !== null);
  if (!isComplete && steps.length === 0) {
    return { solved: t, steps, isRight: false, error: "Datos insuficientes o configuración imposible." };
  }

  let finalRightCheck = t.A === 90 || t.B === 90 || t.C === 90;
  return { solved: t, steps, isRight: finalRightCheck };
}