import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GameController,
  Fire,
  Calendar,
  Crown,
  Shield,
  CaretDown,
  Key,
  Lock,
  YoutubeLogo,
  PaperPlaneTilt,
  DiscordLogo,
} from '@phosphor-icons/react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import ChatWidget from '../components/ChatWidget';
import { trpc } from '@/providers/trpc';

// Simple translations
const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    hero: {
      ar: 'لوحات فري فاير الاحترافية',
      en: 'Professional Free Fire Dashboards',
    },
    subtitle: {
      ar: 'أفضل لوحات Free Fire بمميزات احترافية ودعم فني 24/7',
      en: 'Best Free Fire dashboards with professional features & 24/7 support',
    },
    established: {
      ar: 'موثوق منذ 2024',
      en: 'Trusted since 2024',
    },
    freeFire: {
      ar: 'فري فاير',
      en: 'Free Fire',
    },
    nav_home: {
      ar: 'الرئيسية',
      en: 'Home',
    },
    nav_products: {
      ar: 'اللوحات',
      en: 'Dashboards',
    },
    nav_payment: {
      ar: 'الدفع',
      en: 'Payment',
    },
    nav_player: {
      ar: 'بوابة اللاعب',
      en: 'Player Portal',
    },
    nav_admin: {
      ar: 'دخول الأدمن',
      en: 'Admin Login',
    },
    products_title: {
      ar: 'اختر لوحتك',
      en: 'Choose Your Dashboard',
    },
    products_subtitle: {
      ar: 'لوحات احترافية لمختلف الاحتياجات',
      en: 'Professional dashboards for all needs',
    },
    payment_title: {
      ar: 'طرق الدفع',
      en: 'Payment Methods',
    },
    payment_subtitle: {
      ar: 'ادفع بأمان عبر وسائل دفع موثوقة',
      en: 'Pay securely via trusted payment methods',
    },
    access_player_title: {
      ar: 'بوابة اللاعب',
      en: 'Player Portal',
    },
    access_player_desc: {
      ar: 'أدخل مفتاحك للوصول إلى لوحتك',
      en: 'Enter your key to access your dashboard',
    },
    access_player_cta: {
      ar: 'دخول',
      en: 'Enter',
    },
    access_admin_title: {
      ar: 'لوحة التحكم',
      en: 'Admin Panel',
    },
    access_admin_desc: {
      ar: 'إدارة الموقع والمستخدمين',
      en: 'Manage site and users',
    },
    access_admin_cta: {
      ar: 'دخول الأدمن',
      en: 'Admin Login',
    },
    footer_tagline: {
      ar: 'أفضل لوحات فري فاير الاحترافية',
      en: 'Best professional Free Fire dashboards',
    },
    footer_quickLinks: {
      ar: 'روابط سريعة',
      en: 'Quick Links',
    },
    footer_contact: {
      ar: 'تواصل معنا',
      en: 'Contact Us',
    },
    footer_status: {
      ar: 'النظام يعمل',
      en: 'System Online',
    },
    footer_response: {
      ar: 'رد سريع',
      en: 'Fast Response',
    },
    footer_copyright: {
      ar: '© 2026 SAM X. جميع الحقوق محفوظة.',
      en: '© 2026 SAM X. All rights reserved.',
    },
  };
  return dict[key]?.[lang] || key;
};

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lang, setLang] = useState('ar');

  // Fetch data from database
  const { data: products } = trpc.public.getProducts.useQuery();
  const { data: heroVideoData } = trpc.public.getHeroVideo.useQuery();
  const { data: socialLinks } = trpc.public.getSocialLinks.useQuery();

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      setLang((e as CustomEvent).detail);
    };
    window.addEventListener('languagechange', handleLangChange);
    const stored = localStorage.getItem('language') || 'ar';
    setLang(stored);
    document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = stored;
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSocialUrl = (platform: string) => {
    return socialLinks?.find(s => s.platform === platform)?.url || '#';
  };

  const planLabels: Record<string, { ar: string; en: string }> = {
    basic: { ar: 'أساسي', en: 'Basic' },
    beta: { ar: 'بيتا', en: 'Beta' },
    combo: { ar: 'كومبو', en: 'Combo' },
  };

  const badgeClasses: Record<string, string> = {
    basic: 'badge-success',
    beta: 'badge-warning',
    combo: 'badge-premium',
  };

  return (
    <div className="min-h-[100dvh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] border-b border-[var(--border-subtle)]" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GameController className="w-7 h-7 text-[#2563EB]" weight="fill" />
            <span className="font-display text-xl font-bold">
              SAM <span className="text-[#2563EB]">X</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('home')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors">
              {t('nav_home', lang)}
            </button>
            <button onClick={() => scrollTo('products')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors">
              {t('nav_products', lang)}
            </button>
            <button onClick={() => scrollTo('payment')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors">
              {t('nav_payment', lang)}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/buyer-login" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
              <Key className="w-4 h-4" />
              {t('nav_player', lang)}
            </Link>
            <Link to="/admin-login" className="btn-primary-blue text-sm py-2 px-4">
              <Lock className="w-4 h-4" />
              {t('nav_admin', lang)}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(37,99,235,0.05) 0%, transparent 50%),
            var(--bg-primary)
          `,
        }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563EB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center pt-12 pb-20">
          <div className="reveal opacity-0 inline-flex items-center gap-2 px-6 py-2 rounded-full mb-8" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#2563EB]">{t('established', lang)}</span>
          </div>

          <h1 className="reveal opacity-0 font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            {t('hero', lang)}
          </h1>

          <p className="reveal opacity-0 text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto mb-8">
            {t('subtitle', lang)}
          </p>

          {/* Free Fire Tag */}
          <div className="reveal opacity-0 flex flex-wrap justify-center gap-3 mb-12">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-300 cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-[#2563EB]"><Fire className="w-4 h-4" /></span>
              {t('freeFire', lang)}
            </span>
          </div>

          {/* Hero Video Container - Under Free Fire */}
          <div className="reveal opacity-0 animate-float relative max-w-[900px] mx-auto rounded-3xl overflow-hidden border-2 border-[rgba(37,99,235,0.25)]" style={{ boxShadow: '0 0 60px rgba(37,99,235,0.15), 0 0 120px rgba(37,99,235,0.08)' }}>
            <video ref={videoRef} autoPlay muted loop playsInline className="w-full block">
              <source src={heroVideoData?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-gaming-setup-with-neon-lights-4827-large.mp4"} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={toggleVideo}>
              <div className="w-20 h-20 rounded-full bg-gradient-blue flex items-center justify-center animate-pulse-glow">
                <GameController className="w-8 h-8 text-white" weight="fill" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <CaretDown className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
      </section>

      {/* Products Showcase */}
      <section id="products" className="py-24 md:py-32" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="reveal opacity-0 text-center mb-16">
            <h2 className="font-display text-3xl md:text-[42px] font-bold mb-4">{t('products_title', lang)}</h2>
            <p className="text-[var(--text-secondary)] text-base">{t('products_subtitle', lang)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(products ?? []).map((plan) => (
              <div
                key={plan.plan}
                className={`reveal opacity-0 card-hover rounded-2xl overflow-hidden relative ${plan.highlight ? 'border-[rgba(37,99,235,0.4)]' : ''}`}
                style={{
                  background: 'var(--bg-secondary)',
                  boxShadow: plan.highlight ? '0 20px 60px rgba(37,99,235,0.2)' : undefined,
                }}
              >
                {plan.highlight === 1 && (
                  <div className="absolute top-4 right-0 bg-gradient-blue text-white text-xs font-bold px-4 py-1 z-10" style={{ transform: 'translateX(8px) rotate(45deg)', transformOrigin: 'top right' }}>
                    {lang === 'ar' ? 'الأفضل' : 'BEST'}
                  </div>
                )}

                <div className="overflow-hidden h-[220px]">
                  <img
                    src={plan.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop'}
                    alt={plan.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-8">
                  <span className={badgeClasses[plan.plan] || 'badge-info'}>
                    {planLabels[plan.plan]?.[lang as 'ar' | 'en'] || plan.plan}
                  </span>
                  <h3 className="font-display text-xl font-semibold mt-4 mb-2">{plan.name}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold text-gradient-blue">${plan.price}</span>
                    <span className="text-sm text-[var(--text-muted)] ml-1">/{plan.period || 'month'}</span>
                  </div>
                  <button className="btn-primary-blue w-full">
                    {plan.highlight === 1 && <Crown className="w-5 h-5" />}
                    {plan.cta || (lang === 'ar' ? 'اشتر الآن' : 'Subscribe')}
                  </button>
                </div>
              </div>
            ))}

            {(!products || products.length === 0) && (
              <>
                {/* Default products if none in DB */}
                {[
                  { plan: 'basic' as const, name: lang === 'ar' ? 'أساسي' : 'Basic', price: '12', desc: lang === 'ar' ? 'لوحة أساسية للمبتدئين' : 'Basic dashboard for beginners', badge: lang === 'ar' ? 'شائع' : 'Popular' },
                  { plan: 'beta' as const, name: lang === 'ar' ? 'بيتا' : 'Beta', price: '15', desc: lang === 'ar' ? 'مميزات متقدمة' : 'Advanced features', badge: 'Beta' },
                  { plan: 'combo' as const, name: lang === 'ar' ? 'كومبو' : 'Combo', price: '17', desc: lang === 'ar' ? 'جميع اللوحات' : 'All dashboards', badge: lang === 'ar' ? 'الأفضل' : 'Best' },
                ].map((plan) => (
                  <div key={plan.plan} className="reveal opacity-0 card-hover rounded-2xl overflow-hidden relative" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="overflow-hidden h-[220px]">
                      <img src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop' alt={plan.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-8">
                      <span className={badgeClasses[plan.plan]}>{plan.badge}</span>
                      <h3 className="font-display text-xl font-semibold mt-4 mb-2">{plan.name}</h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-6">{plan.desc}</p>
                      <div className="mb-6">
                        <span className="font-display text-4xl font-bold text-gradient-blue">${plan.price}</span>
                        <span className="text-sm text-[var(--text-muted)] ml-1">/month</span>
                      </div>
                      <button className="btn-primary-blue w-full">
                        {lang === 'ar' ? 'اشتر الآن' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section id="payment" className="relative py-24 md:py-32" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #2563EB, transparent)' }} />
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="reveal opacity-0 text-center mb-16">
            <h2 className="font-display text-3xl md:text-[42px] font-bold mb-4">{t('payment_title', lang)}</h2>
            <p className="text-[var(--text-secondary)] text-base">{t('payment_subtitle', lang)}</p>
          </div>

          <div className="reveal opacity-0 flex flex-wrap justify-center gap-6">
            {[
              { icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#F0B90B" />
                  <path d="M17.5 24L14 20.5L10.5 24L14 27.5L17.5 24Z" fill="white" />
                  <path d="M24 17.5L27.5 14L24 10.5L20.5 14L24 17.5Z" fill="white" />
                  <path d="M24 30.5L20.5 34L24 37.5L27.5 34L24 30.5Z" fill="white" />
                  <path d="M30.5 24L34 27.5L37.5 24L34 20.5L30.5 24Z" fill="white" />
                  <path d="M18.8 24L24 18.8L29.2 24L24 29.2L18.8 24Z" fill="white" />
                </svg>
              ), title: 'Binance Pay', desc: lang === 'ar' ? 'الدفع عبر بينانس' : 'Pay via Binance' },
              { icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <rect x="4" y="8" width="40" height="32" rx="4" fill="#1E2026" stroke="#F0B90B" strokeWidth="2" />
                  <rect x="8" y="14" width="14" height="10" rx="2" fill="#F0B90B" opacity="0.3" />
                </svg>
              ), title: 'Binance Card', desc: lang === 'ar' ? 'بطاقة بينانس' : 'Binance Card' },
              { icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <rect x="4" y="10" width="40" height="28" rx="6" fill="url(#redotGrad)" />
                  <defs>
                    <linearGradient id="redotGrad" x1="4" y1="10" x2="44" y2="38" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" />
                      <stop offset="1" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </svg>
              ), title: 'RedotPay', desc: lang === 'ar' ? 'ريدو باي' : 'RedotPay' },
            ].map((method, i) => (
              <div key={i} className="card-hover rounded-2xl p-8 text-center min-w-[220px] flex-1 max-w-[280px]" style={{ background: 'var(--bg-primary)' }}>
                <div className="mb-4 flex justify-center">{method.icon}</div>
                <h4 className="font-display text-base font-semibold mb-2">{method.title}</h4>
                <p className="text-[var(--text-secondary)] text-sm">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Portal */}
      <section className="py-24 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0F0F, #1A1A1A)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="reveal opacity-0 text-center md:text-left p-8 rounded-2xl relative" style={{ background: 'rgba(37,99,235,0.03)', border: '1px solid rgba(37,99,235,0.1)' }}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, rgba(37,99,235,0.15), transparent 70%)' }} />
              <div className="relative z-10">
                <Crown className="w-12 h-12 text-[#2563EB] mb-4 mx-auto md:mx-0" />
                <h3 className="font-display text-2xl md:text-[32px] font-bold mb-4">{t('access_player_title', lang)}</h3>
                <p className="text-[var(--text-secondary)] mb-8">{t('access_player_desc', lang)}</p>
                <Link to="/buyer-login" className="btn-primary-blue">
                  <Key className="w-5 h-5" />
                  {t('access_player_cta', lang)}
                </Link>
              </div>
            </div>

            <div className="reveal opacity-0 text-center md:text-left p-8 rounded-2xl relative" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 70%)' }} />
              <div className="relative z-10">
                <Shield className="w-12 h-12 text-[var(--text-primary)] mb-4 mx-auto md:mx-0" />
                <h3 className="font-display text-2xl md:text-[32px] font-bold mb-4">{t('access_admin_title', lang)}</h3>
                <p className="text-[var(--text-secondary)] mb-8">{t('access_admin_desc', lang)}</p>
                <Link to="/admin-login" className="btn-outline">
                  <Shield className="w-5 h-5" />
                  {t('access_admin_cta', lang)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-16" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <GameController className="w-6 h-6 text-[#2563EB]" weight="fill" />
                <span className="font-display text-lg font-bold">SAM <span className="text-[#2563EB]">X</span></span>
              </Link>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{t('footer_tagline', lang)}</p>
              <div className="flex gap-4">
                <a href={getSocialUrl('discord')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB] hover:border-[#2563EB] transition-all">
                  <DiscordLogo className="w-5 h-5" />
                </a>
                <a href={getSocialUrl('youtube')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB] hover:border-[#2563EB] transition-all">
                  <YoutubeLogo className="w-5 h-5" />
                </a>
                <a href={getSocialUrl('telegram')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB] hover:border-[#2563EB] transition-all">
                  <PaperPlaneTilt className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-display font-semibold mb-4">{t('footer_quickLinks', lang)}</h4>
              <div className="flex flex-col gap-3">
                {['home', 'products', 'payment'].map((key) => (
                  <button key={key} onClick={() => scrollTo(key === 'home' ? 'home' : key)} className="text-[var(--text-secondary)] text-sm hover:text-[#2563EB] transition-colors text-left">
                    {t('nav_' + key, lang)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-semibold mb-4">{t('footer_contact', lang)}</h4>
              <div className="flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t('footer_status', lang)}
                </span>
                <span className="badge-success inline-flex w-fit">{t('footer_response', lang)}</span>
                <span>support@samx.pro</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--text-muted)] text-sm">{t('footer_copyright', lang)}</p>
            <LanguageSwitcher compact />
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
