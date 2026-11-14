/**
 * Safe math expressions for plot scenes and simulation blocks: numbers, x, y, + - * / ^ ( ) , pi e and Math functions.
 * Anything else throws — content can never run arbitrary code.
 */
const FN = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'sqrt', 'abs', 'pow', 'min', 'max', 'floor', 'ceil', 'sign'];

/** Whitelisted expression → (x, y) => number. Only numbers, x, y, operators, parentheses and Math functions. */
export function compileFn(expr: string): (x: number, y: number) => number {
  const src = expr.replace(/\s+/g, '').replace(/\^/g, '**').replace(/·|×/g, '*');
  const tokens = src.match(/[a-z]+|\d*\.?\d+(?:e[+-]?\d+)?|\*\*|[-+*/(),]/gi) ?? [];
  if (tokens.join('') !== src) throw new Error(`expression: unsupported characters in "${expr}"`);
  const js = tokens
    .map((t) => {
      if (/^[a-z]+$/i.test(t)) {
        const l = t.toLowerCase();
        if (l === 'x' || l === 'y') return l;
        if (l === 'pi') return 'Math.PI';
        if (l === 'e') return 'Math.E';
        if (FN.includes(l)) return `Math.${l}`;
        throw new Error(`expression: unknown identifier "${t}"`);
      }
      return t;
    })
    .join('');
  return new Function('x', 'y', `"use strict"; return (${js});`) as (x: number, y: number) => number;
}

