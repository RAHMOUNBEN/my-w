import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  House, ChatText, Gear, SignOut, GameController,
  Wallet, CalendarCheck, Key, User, Envelope,
  Calendar, Shield, PaperPlane, Fire, ChartLine,
  Crown, Bell, Moon, Globe, CircleNotch,
  FileArchive, Download,
} from '@phosphor-icons/react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { trpc } from '@/providers/trpc';

type Section = 'overview' | 'features' | 'chat' | 'files' | 'settings';

const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    overview: { ar: 'نظرة عامة', en: 'Overview' },
    features: { ar: 'المميزات', en: 'Features' },
    chat: { ar: 'الدردشة', en: 'Chat' },
    files: { ar: 'الملفات', en: 'Files' },
    settings: { ar: 'الإعدادات', en: 'Settings' },
    logout: { ar: 'تسجيل خروج', en: 'Logout' },
    yourKey: { ar: 'مفتاحك', en: 'Your Key' },
    currentBalance: { ar: 'الرصيد', en: 'Balance' },
    daysRemaining: { ar: 'الأيام المتبقية', en: 'Days Remaining' },
    currentPlan: { ar: 'الخطة', en: 'Current Plan' },
    accountStatus: { ar: 'حالة الحساب', en: 'Account Status' },
    name: { ar: 'الاسم', en: 'Name' },
    email: { ar: 'البريد', en: 'Email' },
    creationDate: { ar: 'تاريخ الإنشاء', en: 'Creation Date' },
    active: { ar: 'نشط', en: 'Active' },
    typeMessage: { ar: 'اكتب رسالة...', en: 'Type a message...' },
    downloadFile: { ar: 'تحميل الملف', en: 'Download File' },
    fileName: { ar: 'اسم الملف', en: 'File Name' },
    description: { ar: 'الوصف', en: 'Description' },
    notifications: { ar: 'الإشعارات', en: 'Notifications' },
    notificationsDesc: { ar: 'تفعيل الإشعارات', en: 'Enable notifications' },
    darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
    darkModeDesc: { ar: 'تبديل الوضع الداكن', en: 'Toggle dark mode' },
    language: { ar: 'اللغة', en: 'Language' },
    languageDesc: { ar: 'تغيير اللغة', en: 'Change language' },
    noFiles: { ar: 'لا توجد ملفات متاحة', en: 'No files available' },
  };
  return dict[key]?.[lang] || key;
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('language') || 'ar');
  const [section, setSection] = useState<Section>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sent: number; createdAt: Date }>>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const buyerKey = localStorage.getItem('buyerKey');
  const buyerData = JSON.parse(localStorage.getItem('buyerData') || '{}');

  // Auth check
  useEffect(() => {
    if (!buyerKey) navigate('/buyer-login');
  }, [buyerKey, navigate]);

  // Fetch messages from server
  const { data: serverMessages, refetch: refetchMessages } = trpc.buyer.getMessages.useQuery(
    { key: buyerKey || '' },
    { enabled: !!buyerKey, refetchInterval: 2000 }
  );

  // Fetch downloadable files
  const { data: downloadableFiles } = trpc.buyer.getFiles.useQuery();

  const sendMessage = trpc.buyer.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  useEffect(() => {
    if (serverMessages) {
      setMessages(serverMessages);
    }
  }, [serverMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || !buyerKey) return;
    setTyping(true);
    sendMessage.mutate({ key: buyerKey, text: input.trim() }, {
      onSuccess: () => {
        setInput('');
        setTimeout(() => setTyping(false), 500);
      },
      onError: () => setTyping(false),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const logout = () => {
    localStorage.removeItem('buyerKey');
    localStorage.removeItem('buyerData');
    navigate('/buyer-login');
  };

  if (!buyerKey) return null;

  const planLabels: Record<string, string> = { basic: 'Basic', beta: 'Beta', combo: 'Combo' };

  const navItems: { id: Section; icon: typeof House; label: string }[] = [
    { id: 'overview', icon: House, label: 'overview' },
    { id: 'features', icon: GameController, label: 'features' },
    { id: 'chat', icon: ChatText, label: 'chat' },
    { id: 'files', icon: FileArchive, label: 'files' },
    { id: 'settings', icon: Gear, label: 'settings' },
  ];

  const features = [
    { icon: Fire, title: 'Free Fire Support', desc: lang === 'ar' ? 'إعدادات فري فاير مخصصة' : 'Custom Free Fire settings', activePlans: ['basic', 'beta', 'combo'] },
    { icon: ChartLine, title: 'Basic Stats', desc: lang === 'ar' ? 'تتبع الأداء' : 'Performance tracking', activePlans: ['basic', 'beta', 'combo'] },
    { icon: Crown, title: 'Premium Features', desc: lang === 'ar' ? 'مميزات فري فاير المتقدمة' : 'Advanced Free Fire features', activePlans: ['combo'] },
  ];

  return (
    <div className="min-h-[100dvh] flex" style={{ background: 'var(--bg-primary)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 z-[1000] transition-all duration-350 ${sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: lang === 'ar' ? 'none' : '1px solid var(--border-subtle)', borderLeft: lang === 'ar' ? '1px solid var(--border-subtle)' : 'none' }}>
        <div className="p-6 border-b border-[var(--border-subtle)] text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-blue flex items-center justify-center text-white mx-auto mb-4 font-display text-2xl font-bold"
            style={{ border: '3px solid rgba(37,99,235,0.4)', boxShadow: '0 0 20px rgba(37,99,235,0.2)' }}>
            {buyerData.name?.charAt(0) || '?'}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="text-base font-semibold mb-1">{buyerData.name}</div>
              <span className={buyerData.plan === 'combo' ? 'badge-premium' : buyerData.plan === 'beta' ? 'badge-warning' : 'badge-success'}>
                {planLabels[buyerData.plan] || buyerData.plan}
              </span>
            </>
          )}
        </div>

        <nav className="p-3 flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`sidebar-nav-item ${section === item.id ? 'active' : ''} ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" weight={section === item.id ? 'fill' : 'regular'} />
              {!sidebarCollapsed && <span className="text-sm">{t(item.label, lang)}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <button onClick={logout} className={`w-full sidebar-nav-item hover:bg-[rgba(239,68,68,0.1)] hover:text-red-500 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <SignOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">{t('logout', lang)}</span>}
          </button>
        </div>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB]">
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-350 ${sidebarCollapsed ? (lang === 'ar' ? 'mr-[80px]' : 'ml-[80px]') : (lang === 'ar' ? 'mr-[280px]' : 'ml-[280px]')}`}>
        <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--border-subtle)]">
          <h1 className="font-display text-xl font-bold">{t(section, lang)}</h1>
          <div className="flex items-center gap-2 px-5 py-2 rounded-full" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
            <Wallet className="w-5 h-5 text-white" />
            <span className="text-white font-display font-bold">${buyerData.balance || 0}</span>
          </div>
        </header>

        <div className="p-8">
          {/* Key Info */}
          <div className="mb-8 flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <Key className="w-5 h-5 text-[#2563EB]" />
            <span className="text-sm text-[var(--text-secondary)]">{t('yourKey', lang)}:</span>
            <code className="text-sm font-bold text-[#2563EB] tracking-wider">{buyerKey}</code>
          </div>

          {/* OVERVIEW */}
          {section === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { icon: Wallet, color: 'text-purple-500', bg: 'rgba(168,85,247,0.15)', label: t('currentBalance', lang), value: '$' + (buyerData.balance || 0) },
                  { icon: CalendarCheck, color: 'text-green-500', bg: 'rgba(34,197,94,0.15)', label: t('daysRemaining', lang), value: '30' },
                  { icon: GameController, color: 'text-orange-500', bg: 'rgba(249,115,22,0.15)', label: t('currentPlan', lang), value: planLabels[buyerData.plan] || buyerData.plan },
                ].map((stat, i) => (
                  <div key={i} className="stat-card">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.bg }}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="font-display text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold mb-4">{t('accountStatus', lang)}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: t('name', lang), value: buyerData.name },
                    { icon: Envelope, label: t('email', lang), value: buyerData.email },
                    { icon: Calendar, label: t('creationDate', lang), value: buyerData.created ? new Date(buyerData.created).toLocaleDateString() : '-' },
                    { icon: Shield, label: t('accountStatus', lang), value: <span className="badge-success">{t('active', lang)}</span> },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2 mb-2 text-[#2563EB]">
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* FEATURES */}
          {section === 'features' && (
            <>
              <h3 className="font-display text-lg font-semibold mb-4">{t('features', lang)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, i) => {
                  const isActive = feature.activePlans.includes(buyerData.plan);
                  return (
                    <div key={i} className="rounded-xl p-5 transition-all hover:border-[rgba(37,99,235,0.3)]"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div className="w-11 h-11 rounded-xl bg-gradient-blue flex items-center justify-center text-white mb-3">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">{feature.desc}</p>
                      <span className={isActive ? 'badge-success' : 'badge-info !bg-[rgba(239,68,68,0.15)] !text-red-500'}>
                        {isActive ? t('active', lang) : lang === 'ar' ? 'مغلق' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* CHAT - FIXED MESSAGING */}
          {section === 'chat' && (
            <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] flex flex-col" style={{ height: '520px', background: 'var(--bg-secondary)' }}>
              <div className="p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="font-semibold">Admin</div>
                  <div className="text-xs text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3" style={{ background: 'var(--bg-primary)' }}>
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                    <ChatText className="w-12 h-12 mb-4 opacity-30" />
                    <p>{lang === 'ar' ? 'ابدأ المحادثة مع الأدمن' : 'Start your conversation with admin'}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sent === 1 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${msg.sent === 1 ? 'bg-gradient-blue text-white rounded-br-md' : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-md'}`}>
                        <div>{msg.text}</div>
                        <div className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                )}
                {typing && (
                  <div className="text-xs text-[var(--text-muted)] italic flex items-center gap-1">
                    <CircleNotch className="w-3 h-3 animate-spin" />
                    {lang === 'ar' ? 'يكتب...' : 'Typing...'}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] flex gap-3">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder={t('typeMessage', lang)} className="flex-1 input-field text-sm" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-11 h-11 rounded-xl bg-gradient-blue text-white flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-50">
                  <PaperPlane className="w-5 h-5" weight="fill" />
                </button>
              </div>
            </div>
          )}

          {/* FILES - NEW TAB FOR DOWNLOADABLE FILES */}
          {section === 'files' && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">{t('files', lang)}</h3>
              {(downloadableFiles ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
                  <FileArchive className="w-16 h-16 mb-4 opacity-30" />
                  <p>{t('noFiles', lang)}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(downloadableFiles ?? []).map((file) => (
                    <div key={file.id} className="rounded-xl p-6 transition-all hover:border-[rgba(37,99,235,0.3)]"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div className="w-14 h-14 rounded-xl bg-gradient-blue flex items-center justify-center text-white mb-4">
                        <FileArchive className="w-7 h-7" />
                      </div>
                      <h4 className="font-semibold mb-1">{file.fileName}</h4>
                      {file.description && <p className="text-sm text-[var(--text-secondary)] mb-4">{file.description}</p>}
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary-blue text-sm py-2 px-4 inline-flex">
                        <Download className="w-4 h-4" />
                        {t('downloadFile', lang)}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div className="max-w-[600px]">
              <h3 className="font-display text-lg font-semibold mb-6">{t('settings', lang)}</h3>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#2563EB]" />
                    <div>
                      <div className="font-semibold">{t('notifications', lang)}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{t('notificationsDesc', lang)}</div>
                    </div>
                  </div>
                  <div className="w-11 h-6 rounded-full bg-gradient-blue relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </div>
                </div>

                <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-[#2563EB]" />
                    <div>
                      <div className="font-semibold">{t('darkMode', lang)}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{t('darkModeDesc', lang)}</div>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#2563EB]" />
                    <div>
                      <div className="font-semibold">{t('language', lang)}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{t('languageDesc', lang)}</div>
                    </div>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
