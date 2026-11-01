/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalculatorGUI } from './components/CalculatorGUI';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { PythonRepl } from './components/PythonRepl';
import { PYTHON_TKINTER_CODE } from './data/pythonCodes';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'code' | 'repl'>('calculator');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize theme from localStorage or preferred scheme (default dark for high developer polish)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Keep <html> class in sync with isDarkMode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calc_theme', 'light');
    }
  }, [isDarkMode]);

  const handleDownloadPy = () => {
    const blob = new Blob([PYTHON_TKINTER_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calculadora.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onDownloadPy={handleDownloadPy}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'calculator' && (
          <CalculatorGUI
            soundEnabled={soundEnabled}
            isDarkMode={isDarkMode}
            onSwitchToCode={() => setActiveTab('code')}
          />
        )}

        {activeTab === 'code' && <PythonCodeViewer />}

        {activeTab === 'repl' && <PythonRepl />}
      </main>

      {/* Clean, unboxed footer compliant with Frontend Design Constitution */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Calculadora Python GUI</span>
            <span aria-hidden="true">·</span>
            <span>Tkinter & CustomTkinter</span>
            <span aria-hidden="true">·</span>
            <span>Cálculo Instantâneo</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('calculator')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Calculadora
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Código .py
            </button>
            <button
              onClick={() => setActiveTab('repl')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              REPL
            </button>
            <button
              onClick={handleDownloadPy}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
