import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-all duration-300 hover:bg-white/5"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
      )}
    </button>
  );
}
