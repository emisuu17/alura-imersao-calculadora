import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'code' | 'repl';
  setActiveTab: (tab: 'calculator' | 'code' | 'repl') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  onDownloadPy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  soundEnabled,
  setSoundEnabled,
  onDownloadPy,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-4 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
          Py
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
            Calculadora Python
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Calculadora GUI
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'code'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Código Python (.py)
        </button>

        <button
          onClick={() => setActiveTab('repl')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'repl'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Testador REPL
        </button>
      </nav>

      {/* Zone 3: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          title={soundEnabled ? 'Silenciar cliques' : 'Ativar som dos cliques'}
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          title={isDarkMode ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Alternar tema claro e escuro"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Tema Escuro</span>
            </>
          )}
        </button>

        {/* Download .py Script */}
        <button
          onClick={onDownloadPy}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar .py</span>
        </button>
      </div>
    </header>
  );
};
