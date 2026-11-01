import React, { useState } from 'react';
import { PYTHON_SCRIPTS, PythonScript } from '../data/pythonCodes';
import {
  Download,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  SunMoon,
  Zap,
  ExternalLink
} from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('tkinter');
  const [copied, setCopied] = useState<boolean>(false);

  const currentScript: PythonScript =
    PYTHON_SCRIPTS.find((s) => s.id === selectedScriptId) || PYTHON_SCRIPTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentScript.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentScript.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header & Description */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Código Fonte Python Desktop</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Calculadora Python com Interface Gráfica
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Código completo pronto para execução local com suporte a operações aritméticas, cálculo instantâneo e alternância de temas claro e escuro.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {currentScript.filename}</span>
          </button>
        </div>
      </div>

      {/* Script Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PYTHON_SCRIPTS.map((script) => (
          <button
            key={script.id}
            onClick={() => setSelectedScriptId(script.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              selectedScriptId === script.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{script.title}</span>
          </button>
        ))}
      </div>

      {/* Info Pills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Cálculo Instantâneo</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Usa trace no <code className="font-mono text-zinc-700 dark:text-zinc-300">StringVar</code> para recalcular a cada tecla.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <SunMoon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Temas Claro & Escuro</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Alternância dinâmica completa de paletas de cores em 1 clique.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Segurança AST</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Não usa eval vulnerável; avalia a árvore sintática matemática.
            </span>
          </div>
        </div>
      </div>

      {/* How to Run Box */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            Como Executar no seu Computador
          </span>
          <span className="text-xs text-zinc-400">{currentScript.prerequisites}</span>
        </div>

        <div className="p-3 bg-zinc-950 rounded-lg font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto">
          <code>
            {currentScript.id === 'customtkinter'
              ? 'pip install customtkinter && python calculadora_customtkinter.py'
              : 'python calculadora_tkinter.py'}
          </code>
          <button
            onClick={() => {
              const cmd =
                currentScript.id === 'customtkinter'
                  ? 'pip install customtkinter && python calculadora_customtkinter.py'
                  : 'python calculadora_tkinter.py';
              navigator.clipboard.writeText(cmd);
            }}
            className="text-zinc-400 hover:text-zinc-200 ml-4 p-1 transition-colors cursor-pointer shrink-0"
            title="Copiar comando de execução"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative rounded-2xl bg-zinc-950 text-zinc-200 border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Code Bar Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-zinc-300 font-semibold">{currentScript.filename}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Python 3.8+</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Code Lines Container */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[640px] font-mono text-xs sm:text-[13px] leading-relaxed select-text">
          <pre className="text-zinc-200">
            <code>
              {currentScript.code.split('\n').map((line, idx) => {
                // Simple highlight tinting for comments and keywords
                const isComment = line.trim().startsWith('#') || line.trim().startsWith('"""') || line.trim().startsWith('*');
                const isDef = line.includes('def ') || line.includes('class ');
                const isImport = line.startsWith('import ') || line.startsWith('from ');

                let colorClass = 'text-zinc-300';
                if (isComment) colorClass = 'text-zinc-500 italic';
                else if (isDef) colorClass = 'text-blue-400 font-semibold';
                else if (isImport) colorClass = 'text-purple-400';

                return (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 text-right select-none text-zinc-600 text-xs w-10">
                      {idx + 1}
                    </span>
                    <span className={`table-cell whitespace-pre ${colorClass}`}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
