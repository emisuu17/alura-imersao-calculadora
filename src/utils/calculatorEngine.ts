/**
 * Safe expression evaluation for the calculator.
 * Handles instant calculations, floating point normalization, and history tracking.
 */

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

/**
 * Normalizes user-friendly symbols to JavaScript / Python math operators.
 */
export function normalizeExpression(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**')
    .replace(/,/g, '.');
}

/**
 * Rounds a floating point number to eliminate standard IEEE-754 precision issues
 * like 0.1 + 0.2 = 0.30000000000000004
 */
export function formatResult(num: number): string {
  if (isNaN(num)) return 'Erro';
  if (!isFinite(num)) return 'Infinito';

  // Format with high precision and strip trailing zeros
  const rounded = Number(Math.round(Number(num + 'e+10')) + 'e-10');
  
  // If the number is an integer or has clean decimals
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  // Format to max 8 decimal places without trailing zeros
  const str = rounded.toFixed(8).replace(/\.?0+$/, '');
  return str;
}

/**
 * Safely evaluates an arithmetic expression using AST-like parsing logic.
 * Returns null if expression is incomplete or invalid (for live instant preview).
 */
export function evaluateExpressionSafely(expr: string): { result: string | null; error: string | null } {
  if (!expr || expr.trim() === '') {
    return { result: null, error: null };
  }

  const clean = normalizeExpression(expr).trim();

  // Strip trailing operators for instant preview (e.g. "45 +" -> preview 45)
  let evalTarget = clean;
  // Handle trailing incomplete operators or open parentheses
  while (evalTarget.length > 0 && /[\+\-\*\/\%\^\.]$/.test(evalTarget)) {
    evalTarget = evalTarget.slice(0, -1).trim();
  }

  // Auto-close open parentheses for live preview
  const openParens = (evalTarget.match(/\(/g) || []).length;
  const closeParens = (evalTarget.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    evalTarget += ')'.repeat(openParens - closeParens);
  }

  if (!evalTarget) {
    return { result: null, error: null };
  }

  // Security check: Only allow numbers, math operators, parentheses, and spaces
  if (!/^[\d\.\+\-\*\/\%\(\)\s\*\*]+$/.test(evalTarget)) {
    return { result: null, error: 'Caractere inválido' };
  }

  try {
    // Check for division by zero before evaluation
    if (/\/0(?!\.)(?!\d)/.test(evalTarget.replace(/\s+/g, ''))) {
      return { result: 'Divisão por zero', error: 'Divisão por zero' };
    }

    // Safely evaluate standard arithmetic
    // Using Function constructor with strict sanitized string of arithmetic tokens
    const fn = new Function(`'use strict'; return (${evalTarget});`);
    const val = fn();

    if (typeof val !== 'number' || isNaN(val)) {
      return { result: null, error: 'Cálculo inválido' };
    }

    if (!isFinite(val)) {
      return { result: 'Infinito', error: null };
    }

    return { result: formatResult(val), error: null };
  } catch {
    return { result: null, error: null };
  }
}

/**
 * Synthesizes a subtle, pleasant mechanical click sound using Web Audio API
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playClick(type: 'number' | 'operator' | 'action' = 'number') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      let freq = 600;
      let duration = 0.035;

      if (type === 'operator') {
        freq = 820;
        duration = 0.045;
      } else if (type === 'action') {
        freq = 1050;
        duration = 0.05;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext may be blocked by autoplay policies until user interacts
    }
  }
}

export const soundEngine = new SoundEngine();
