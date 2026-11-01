import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Sparkles, BookOpen } from 'lucide-react';

interface ReplEntry {
  input: string;
  output: string;
  type: string;
  isError?: boolean;
}

export const PythonRepl: React.FC = () => {
  const [inputExpr, setInputExpr] = useState<string>('2 ** 10 + (100 // 7)');
  const [history, setHistory] = useState<ReplEntry[]>([
    {
      input: '15 * 4 + 20',
      output: '80',
      type: 'int'
    },
    {
      input: '17 // 3',
      output: '5',
      type: 'int (divisão inteira)'
    },
    {
      input: '17 % 3',
      output: '2',
      type: 'int (resto da divisão)'
    },
    {
      input: '2 ** 8',
      output: '256',
      type: 'int (potenciação)'
    },
    {
      input: 'round(355 / 113, 6)',
      output: '3.141593',
      type: 'float'
    }
  ]);

  const executePythonExpression = (expr: string) => {
    if (!expr.trim()) return;

    try {
      // Map Python math functions and operators safely in JavaScript
      let jsExpr = expr
        .replace(/math\.sqrt/g, 'Math.sqrt')
        .replace(/math\.pow/g, 'Math.pow')
        .replace(/math\.sin/g, 'Math.sin')
        .replace(/math\.cos/g, 'Math.cos')
        .replace(/math\.pi/g, 'Math.PI')
        .replace(/math\.e/g, 'Math.E')
        .replace(/round\(/g, 'Math.round(')
        .replace(/abs\(/g, 'Math.abs(');

      // Handle Python floor division `//` -> Math.floor(a / b)
      jsExpr = jsExpr.replace(/(\d+(?:\.\d+)?)\s*\/\/\s*(\d+(?:\.\d+)?)/g, 'Math.floor($1 / $2)');

      // Validate characters
      if (!/^[\d\.\+\-\*\/\%\(\)\s\*\*\,\>\<\=Math\.a-z]+$/i.test(jsExpr)) {
        throw new Error('Sintaxe não permitida');
      }

      const fn = new Function(`'use strict'; return (${jsExpr});`);
      const val = fn();

      let detectedType: string = typeof val;
      if (typeof val === 'number') {
        detectedType = Number.isInteger(val) ? 'int' : 'float';
      }

      const newEntry: ReplEntry = {
        input: expr,
        output: String(val),
        type: detectedType
      };

      setHistory((prev) => [...prev, newEntry]);
      setInputExpr('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de sintaxe';
      setHistory((prev) => [
        ...prev,
        {
          input: expr,
          output: `Erro de sintaxe Python: ${msg}`,
          type: 'SyntaxError',
          isError: true
        }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executePythonExpression(inputExpr);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Console Interativo de Aritmética Python</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Testador REPL de Expressões Python
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
          Teste expressões aritméticas e veja como o interpretador Python avalia números inteiros, ponto flutuante, divisão inteira (<code className="font-mono text-zinc-700 dark:text-zinc-300">//</code>), resto (<code className="font-mono text-zinc-700 dark:text-zinc-300">%</code>) e exponenciação (<code className="font-mono text-zinc-700 dark:text-zinc-300">**</code>).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Terminal Output */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
            {/* Terminal bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-zinc-300 font-semibold">Python 3.12 Interactive Session</span>
              </div>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Terminal lines */}
            <div className="p-5 max-h-[440px] overflow-y-auto space-y-4">
              <div className="text-zinc-500 text-xs">
                Type Python math expressions and press Enter. Examples: <span className="text-zinc-400">2 ** 10</span>, <span className="text-zinc-400">100 // 6</span>, <span className="text-zinc-400">math.sqrt(64)</span>.
              </div>

              {history.map((entry, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <span className="text-blue-400 select-none font-bold">&gt;&gt;&gt;</span>
                    <span className="font-semibold text-white">{entry.input}</span>
                  </div>
                  <div className="flex items-center justify-between pl-6 text-xs">
                    <span className={entry.isError ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-bold'}>
                      {entry.output}
                    </span>
                    <span className="text-[11px] text-zinc-600 font-mono">
                      &lt;class '{entry.type}'&gt;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal Input Row */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2">
              <span className="text-blue-400 font-bold pl-2 select-none">&gt;&gt;&gt;</span>
              <input
                type="text"
                value={inputExpr}
                onChange={(e) => setInputExpr(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 5 * 10 ** 2 + (50 // 4)"
                className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-hidden placeholder-zinc-600"
              />
              <button
                onClick={() => executePythonExpression(inputExpr)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Executar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Reference Cheat Sheet */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Operadores Aritméticos Python</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { op: '+', name: 'Adição', ex: '25 + 15', res: '40' },
                { op: '-', name: 'Subtração', ex: '100 - 35', res: '65' },
                { op: '*', name: 'Multiplicação', ex: '12 * 8', res: '96' },
                { op: '/', name: 'Divisão Real', ex: '7 / 2', res: '3.5' },
                { op: '//', name: 'Divisão Inteira', ex: '7 // 2', res: '3' },
                { op: '%', name: 'Módulo (Resto)', ex: '7 % 2', res: '1' },
                { op: '**', name: 'Potência', ex: '2 ** 8', res: '256' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInputExpr(item.ex)}
                  className="w-full text-left p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-blue-600 dark:text-blue-400 w-6">
                      {item.op}
                    </code>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <code className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-mono">
                    {item.ex} = {item.res}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
