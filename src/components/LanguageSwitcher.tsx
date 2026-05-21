import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'ar', label: 'العربية', native: 'AR' },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('language', code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    window.dispatchEvent(new CustomEvent('languagechange', { detail: code }));
    setOpen(false);
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-[10px] transition-all duration-300 hover:bg-white/5"
      >
        <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
        {!compact && <span className="text-sm font-medium text-[var(--text-secondary)]">{current.native}</span>}
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 right-0 w-[180px] rounded-[12px] border border-[var(--border-subtle)] shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between hover:bg-[rgba(37,99,235,0.08)] ${
                currentLang === lang.code ? 'text-[#2563EB] font-semibold' : 'text-[var(--text-primary)]'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-xs opacity-60">{lang.native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
