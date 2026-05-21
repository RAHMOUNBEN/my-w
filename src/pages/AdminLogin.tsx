import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowLeft } from '@phosphor-icons/react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    title: { ar: 'دخول الأدمن', en: 'Admin Login' },
    subtitle: { ar: 'لوحة التحكم الخاصة', en: 'Private Admin Panel' },
    username: { ar: 'اسم المستخدم', en: 'Username' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    error: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid credentials' },
    button: { ar: 'تسجيل الدخول', en: 'Login' },
    back: { ar: 'العودة للرئيسية', en: 'Back to Home' },
  };
  return dict[key]?.[lang] || key;
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('language') || 'ar');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded secure credentials
    if (username === 'SAMX_ADMIN_2026' && password === 'Xq9#mK2$pL5@vN8*wQ3') {
      const auth = btoa(`${username}:${password}`);
      localStorage.setItem('adminAuth', auth);
      navigate('/admin-dashboard');
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
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

      <div className={`animate-fadeInUp w-full max-w-[420px] mx-4 rounded-3xl p-10 md:p-12 ${shaking ? 'animate-shake' : ''}`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(37,99,235,0.08)',
        }}>
        <div className="flex justify-center mb-6">
          <Shield className="w-12 h-12" weight="fill" style={{ color: '#2563EB' }} />
        </div>

        <h2 className="font-display text-2xl md:text-[28px] font-bold text-center mb-2">{t('title', lang)}</h2>
        <p className="text-[var(--text-secondary)] text-sm text-center mb-8">{t('subtitle', lang)}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('username', lang)}</label>
            <div className="relative">
              <User className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]`} />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(false); }}
                placeholder=""
                className={`input-field ${lang === 'ar' ? 'pr-12' : 'pl-12'}`}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('password', lang)}</label>
            <div className="relative">
              <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]`} />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder=""
                className={`input-field ${lang === 'ar' ? 'pr-12' : 'pl-12'}`}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-red-500 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {t('error', lang)}
            </div>
          )}

          <button type="submit" className="btn-primary-blue w-full">
            <ArrowLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            {t('button', lang)}
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
