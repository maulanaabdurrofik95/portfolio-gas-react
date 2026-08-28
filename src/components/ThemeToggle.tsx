import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 p-1 rounded-full flex items-center transition-colors duration-300 focus:outline-none shadow-inner border border-slate-200/50 dark:border-slate-700/50 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
      aria-label="Toggle Dark Mode"
    >
      <div 
        className={`w-5 h-5 rounded-full shadow-md transition-transform duration-500 flex items-center justify-center ${isDark ? 'translate-x-7 bg-slate-900' : 'translate-x-0 bg-white'}`}
      >
        {isDark ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
      </div>
    </button>
  );
}
