import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, ArrowLeft, Warning, GameController } from '@phosphor-icons/react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { trpc } from '@/providers/trpc';

const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    title: { ar: 'بوابة اللاعب', en: 'Player Portal' },
    subtitle: { ar: 'أدخل مفتاحك للوصول', en: 'Enter your key to access' },
    error: { ar: 'مفتاح غير صالح أو منتهي', en: 'Invalid or expired key' },
    button: { ar: 'الدخول', en: 'Enter' },
    back: { ar: 'العودة للرئيسية', en: 'Back to Home' },
  };
  return dict[key]?.[lang] || key;
};

export default function BuyerLogin() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('language') || 'ar');
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const loginMutation = trpc.buyer.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('buyerKey', data.key);
      localStorage.setItem('buyerData', JSON.stringify(data));
      navigate('/buyer-dashboard');
    },
    onError: () => {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    loginMutation.mutate({ key: key.trim().toUpperCase() });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 50%, rgba(37,99,235,0.08) 0%, transparent 50%),
          var(--bg-primary)
        `,
      }}>
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>

      <div className={`animate-fadeInUp w-full max-w-[480px] mx-4 rounded-3xl p-10 md:p-12 ${shaking ? 'animate-shake' : ''}`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(37,99,235,0.08)',
        }}>
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center gap-2">
            <GameController className="w-7 h-7 text-[#2563EB]" weight="fill" />
            <span className="font-display text-xl font-bold">SAM <span className="text-[#2563EB]">X</span></span>
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <Key className="w-12 h-12" style={{ color: '#2563EB' }} weight="fill" />
        </div>

        <h2 className="font-display text-2xl md:text-[28px] font-bold text-center mb-2">{t('title', lang)}</h2>
        <p className="text-[var(--text-secondary)] text-sm text-center mb-6">{t('subtitle', lang)}</p>

        {error && (
          <div className="mb-5 flex items-center gap-3 p-4 rounded-xl animate-shake" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Warning className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-sm font-semibold text-red-500">{t('error', lang)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <Key className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]`} />
            <input
              type="text"
              value={key}
              onChange={e => { setKey(e.target.value); setError(false); }}
              placeholder="SAMX-2026-XXXXXX"
              maxLength={20}
              className={`input-field ${lang === 'ar' ? 'pr-12' : 'pl-12'} text-center font-semibold tracking-[4px] uppercase h-14`}
              style={{ fontSize: '16px' }}
            />
          </div>

          <button type="submit" disabled={loginMutation.isPending} className="btn-primary-blue w-full h-14 text-lg font-bold disabled:opacity-50">
            <ArrowLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            {loginMutation.isPending ? '...' : t('button', lang)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[var(--text-secondary)] text-sm hover:text-[#2563EB] transition-colors inline-flex items-center gap-2">
            <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            {t('back', lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
