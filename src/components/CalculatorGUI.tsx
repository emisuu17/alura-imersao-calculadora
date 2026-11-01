import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  evaluateExpressionSafely,
  HistoryItem,
  soundEngine
} from '../utils/calculatorEngine';
import {
  History,
  RotateCcw,
  Copy,
  Check,
  Delete,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface CalculatorGUIProps {
  soundEnabled: boolean;
  isDarkMode: boolean;
  onSwitchToCode: () => void;
}

export const CalculatorGUI: React.FC<CalculatorGUIProps> = ({
  soundEnabled,
  isDarkMode,
  onSwitchToCode,
}) => {
  const [expression, setExpression] = useState<string>('125 * 8 - 45');
  const [instantResult, setInstantResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      expression: '2 ** 8',
      result: '256',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: 'init-2',
      expression: '1500 * (1 + 0.15)',
      result: '1725',
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    }
  ]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [memory, setMemory] = useState<number | null>(null);
  const [activePressedKey, setActivePressedKey] = useState<string | null>(null);

  const displayInputRef = useRef<HTMLInputElement>(null);

  // Recalculate live result whenever expression changes
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setInstantResult(null);
      setErrorMsg(null);
      return;
    }

    const { result, error } = evaluateExpressionSafely(expression);
    if (error) {
      setErrorMsg(error);
      setInstantResult(null);
    } else {
      setErrorMsg(null);
      setInstantResult(result);
    }
  }, [expression]);

  const playSound = useCallback((type: 'number' | 'operator' | 'action') => {
    if (soundEnabled) {
      soundEngine.playClick(type);
    }
  }, [soundEnabled]);

  const handleAppend = useCallback((char: string) => {
    playSound(char.match(/[0-9.]/) ? 'number' : 'operator');
    setExpression((prev) => {
      // Prevent consecutive identical operators like ++ or ** (unless exponentiation)
      if (['+', '-', '×', '÷', '%'].includes(char)) {
        if (prev.endsWith('+') || prev.endsWith('-') || prev.endsWith('×') || prev.endsWith('÷')) {
          return prev.slice(0, -1) + char;
        }
      }
      return prev + char;
    });
  }, [playSound]);

  const handleClear = useCallback(() => {
    playSound('action');
    setExpression('');
    setInstantResult(null);
    setErrorMsg(null);
  }, [playSound]);

  const handleBackspace = useCallback(() => {
    playSound('action');
    setExpression((prev) => prev.slice(0, -1));
  }, [playSound]);

  const handleEquals = useCallback(() => {
    playSound('action');
    if (!expression.trim()) return;

    const { result, error } = evaluateExpressionSafely(expression);
    if (result && !error && result !== 'Divisão por zero') {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression: expression,
        result: result,
        timestamp: new Date(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
      setExpression(result);
    } else if (error) {
      setErrorMsg(error);
    }
  }, [expression, playSound]);

  const handleToggleNegate = useCallback(() => {
    playSound('operator');
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, [playSound]);

  // Memory buttons
  const handleMemoryAdd = () => {
    playSound('action');
    const val = parseFloat(instantResult || expression);
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) + val);
    }
  };

  const handleMemorySub = () => {
    playSound('action');
    const val = parseFloat(instantResult || expression);
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) - val);
    }
  };

  const handleMemoryRecall = () => {
    playSound('number');
    if (memory !== null) {
      setExpression((prev) => prev + memory.toString());
    }
  };

  const handleMemoryClear = () => {
    playSound('action');
    setMemory(null);
  };

  const handleCopyResult = () => {
    const textToCopy = instantResult || expression;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in standard textarea outside calculator
      if (e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;
      setActivePressedKey(key);
      setTimeout(() => setActivePressedKey(null), 150);

      if (key >= '0' && key <= '9') {
        handleAppend(key);
      } else if (key === '+' || key === '-') {
        handleAppend(key);
      } else if (key === '*') {
        handleAppend('×');
      } else if (key === '/') {
        e.preventDefault();
        handleAppend('÷');
      } else if (key === '%') {
        handleAppend('%');
      } else if (key === '^') {
        handleAppend('^');
      } else if (key === '.' || key === ',') {
        handleAppend('.');
      } else if (key === '(' || key === ')') {
        handleAppend(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAppend, handleBackspace, handleClear, handleEquals]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Hero Section */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interface Gráfica & Motor Python</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Calculadora com Cálculo Instantâneo
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Insira os números pelo teclado ou botões. O resultado é calculado em tempo real a cada dígito.
          </p>
        </div>

        <button
          onClick={onSwitchToCode}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer self-center sm:self-auto"
        >
          <span>Ver Código Python (.py)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Calculator & Side Info/History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calculator Box */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-200">
            {/* Top Toolbar inside Calculator Device */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 dark:bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/80" />
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-2">
                  Python GUI Simulator
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {memory !== null && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                    M: {memory}
                  </span>
                )}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    showHistory
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Histórico de cálculos"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Screen Display Area */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex flex-col justify-end min-h-[130px] relative">
              {/* Copy floating button */}
              <button
                onClick={handleCopyResult}
                className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copiar resultado"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Expression input field */}
              <input
                ref={displayInputRef}
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-right font-mono font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight focus:outline-hidden placeholder-zinc-300 dark:placeholder-zinc-700"
              />

              {/* Instant Live Result Preview Indicator */}
              <div className="mt-2 flex items-center justify-end gap-2 min-h-[28px]">
                {errorMsg ? (
                  <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                    {errorMsg}
                  </span>
                ) : instantResult !== null && instantResult !== expression ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg sm:text-xl transition-all">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Instantâneo
                    </span>
                    <span>=</span>
                    <span>{instantResult}</span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-600 italic">
                    Digite para ver o resultado em tempo real
                  </span>
                )}
              </div>
            </div>

            {/* Memory Toolbar Row */}
            <div className="grid grid-cols-4 gap-1 px-4 py-2 bg-zinc-100/70 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800/80 text-xs font-semibold">
              <button
                onClick={handleMemoryClear}
                className="py-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                MC
              </button>
              <button
                onClick={handleMemoryRecall}
                className="py-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                MR
              </button>
              <button
                onClick={handleMemoryAdd}
                className="py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                M+
              </button>
              <button
                onClick={handleMemorySub}
                className="py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                M-
              </button>
            </div>

            {/* Main Keypad Grid */}
            <div className="p-4 grid grid-cols-4 gap-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
              {/* Row 1: AC, Backspace, Modulo, Division */}
              <button
                onClick={handleClear}
                className="h-13 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-base transition-all active:scale-95 cursor-pointer border border-rose-200/50 dark:border-rose-900/40 shadow-xs"
              >
                AC
              </button>
              <button
                onClick={handleBackspace}
                className="h-13 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/80 dark:hover:bg-zinc-700 font-bold text-base flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Apagar último caractere"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleAppend('%')}
                className="h-13 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/80 dark:hover:bg-zinc-700 font-bold text-base transition-all active:scale-95 cursor-pointer shadow-xs font-mono"
              >
                %
              </button>
              <button
                onClick={() => handleAppend('÷')}
                className="h-13 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                ÷
              </button>

              {/* Row 2: 7, 8, 9, Multiplication */}
              <button
                onClick={() => handleAppend('7')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '7' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                7
              </button>
              <button
                onClick={() => handleAppend('8')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '8' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                8
              </button>
              <button
                onClick={() => handleAppend('9')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '9' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                9
              </button>
              <button
                onClick={() => handleAppend('×')}
                className="h-13 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                ×
              </button>

              {/* Row 3: 4, 5, 6, Subtraction */}
              <button
                onClick={() => handleAppend('4')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '4' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                4
              </button>
              <button
                onClick={() => handleAppend('5')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '5' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                5
              </button>
              <button
                onClick={() => handleAppend('6')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '6' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                6
              </button>
              <button
                onClick={() => handleAppend('-')}
                className="h-13 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                −
              </button>

              {/* Row 4: 1, 2, 3, Addition */}
              <button
                onClick={() => handleAppend('1')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '1' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                1
              </button>
              <button
                onClick={() => handleAppend('2')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '2' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                2
              </button>
              <button
                onClick={() => handleAppend('3')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '3' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                3
              </button>
              <button
                onClick={() => handleAppend('+')}
                className="h-13 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                +
              </button>

              {/* Row 5: 0, Decimal, Power/Exponent, Equals */}
              <button
                onClick={() => handleAppend('0')}
                className={`h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60 ${
                  activePressedKey === '0' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                0
              </button>
              <button
                onClick={() => handleAppend('.')}
                className="h-13 rounded-xl bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-mono font-bold text-xl transition-all active:scale-95 cursor-pointer shadow-xs border border-zinc-200/60 dark:border-zinc-700/60"
              >
                .
              </button>
              <button
                onClick={() => handleAppend('^')}
                className="h-13 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300/80 dark:hover:bg-zinc-700 font-bold text-base transition-all active:scale-95 cursor-pointer shadow-xs font-mono"
                title="Potência (xʸ ou **)"
              >
                xʸ
              </button>
              <button
                onClick={handleEquals}
                className="h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                =
              </button>
            </div>

            {/* Auxiliary Functions Footer */}
            <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex gap-2">
                <button
                  onClick={() => handleAppend('(')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono font-semibold transition-colors cursor-pointer"
                >
                  (
                </button>
                <button
                  onClick={() => handleAppend(')')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono font-semibold transition-colors cursor-pointer"
                >
                  )
                </button>
                <button
                  onClick={handleToggleNegate}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono font-semibold transition-colors cursor-pointer"
                  title="Inverter sinal (+/-)"
                >
                  ±
                </button>
              </div>

              <span className="text-[11px] font-medium text-zinc-400">
                Atalhos: [0-9] [+-*/] [Enter] [Esc]
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: History & Python Features */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Instant Calculation Examples */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center justify-between">
              <span>Testar Operações Rápidas</span>
              <span className="text-xs font-normal text-zinc-500">Clique para carregar</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Multiplicação e Soma', expr: '45 * 12 + 180' },
                { label: 'Potenciação (2⁸)', expr: '2 ^ 8' },
                { label: 'Expressão com Parênteses', expr: '(150 + 50) * 1.2' },
                { label: 'Divisão Decimal', expr: '355 / 113' },
                { label: 'Cálculo de Porcentagem', expr: '1500 * (15 % 100)' },
                { label: 'Raiz/Potência Fracionária', expr: '144 ^ 0.5' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExpression(item.expr);
                    playSound('action');
                  }}
                  className="p-2.5 text-left rounded-xl bg-zinc-50 dark:bg-zinc-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer group"
                >
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {item.label}
                  </div>
                  <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-0.5">
                    {item.expr}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History Panel */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Histórico de Cálculos</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                Nenhum cálculo registrado ainda. Pressione '=' para salvar.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        {item.expression}
                      </span>
                      <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        = {item.result}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setExpression(item.expression);
                          playSound('action');
                        }}
                        title="Restaurar expressão"
                        className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.result);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        title="Copiar resultado"
                        className="p-1 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Python Architecture Card */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-blue-900 dark:text-blue-200 block mb-1">
                  Como funciona o cálculo instantâneo em Python?
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  No script Python disponibilizado na aba <strong>Código Python (.py)</strong>, usamos <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200">var.trace_add("write", ...)</code> e o evento de teclado <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200">&lt;KeyRelease&gt;</code>. Isso dispara uma avaliação segura da sintaxe via AST a cada tecla digitada!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
