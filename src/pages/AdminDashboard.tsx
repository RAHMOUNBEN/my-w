import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  House, Key, Users, Headset, ChatText, Wallet, Package, SignOut,
  GameController, Plus, Copy, Pencil, Trash, PaperPlane,
  X, CurrencyDollar, ShoppingCart, LockOpen, Video, Globe,
  FileArchive, Check, DiscordLogo, YoutubeLogo, PaperPlaneTilt,
} from '@phosphor-icons/react';
import { trpc } from '@/providers/trpc';

type Section = 'dashboard' | 'keys' | 'customers' | 'salesChat' | 'chat' | 'balance' | 'products' | 'video' | 'files' | 'social';

const t = (key: string, lang: string): string => {
  const dict: Record<string, Record<string, string>> = {
    dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
    keyManagement: { ar: 'إدارة المفاتيح', en: 'Key Management' },
    customers: { ar: 'العملاء', en: 'Customers' },
    visitorChat: { ar: 'دردشة الزوار', en: 'Visitor Chat' },
    playerChat: { ar: 'دردشة اللاعبين', en: 'Player Chat' },
    balance: { ar: 'الرصيد', en: 'Balance' },
    products: { ar: 'المنتجات', en: 'Products' },
    video: { ar: 'الفيديو', en: 'Video' },
    files: { ar: 'الملفات', en: 'Files' },
    social: { ar: 'روابط التواصل', en: 'Social Links' },
    logout: { ar: 'تسجيل خروج', en: 'Logout' },
    createKey: { ar: 'إنشاء مفتاح', en: 'Create Key' },
    totalPlayers: { ar: 'إجمالي اللاعبين', en: 'Total Players' },
    monthlyRevenue: { ar: 'الإيرادات', en: 'Revenue' },
    activeKeys: { ar: 'المفاتيح النشطة', en: 'Active Keys' },
    supportInquiries: { ar: 'الاستفسارات', en: 'Inquiries' },
    name: { ar: 'الاسم', en: 'Name' },
    email: { ar: 'البريد', en: 'Email' },
    plan: { ar: 'الخطة', en: 'Plan' },
    actions: { ar: 'إجراءات', en: 'Actions' },
    typeReply: { ar: 'اكتب رداً...', en: 'Type a reply...' },
    selectVisitor: { ar: 'اختر زائراً', en: 'Select a visitor' },
    selectPlayer: { ar: 'اختر لاعباً', en: 'Select a player' },
    typeMessage: { ar: 'اكتب رسالة...', en: 'Type a message...' },
    addBalance: { ar: 'إضافة رصيد', en: 'Add Balance' },
    balanceLabel: { ar: 'الرصيد', en: 'Balance' },
    yourKey: { ar: 'المفتاح', en: 'Key' },
    videoUrl: { ar: 'رابط الفيديو', en: 'Video URL' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    addFile: { ar: 'إضافة ملف', en: 'Add File' },
    fileName: { ar: 'اسم الملف', en: 'File Name' },
    fileUrl: { ar: 'رابط الملف', en: 'File URL' },
    description: { ar: 'الوصف', en: 'Description' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    download: { ar: 'تحميل', en: 'Download' },
    socialPlatform: { ar: 'المنصة', en: 'Platform' },
    socialUrl: { ar: 'الرابط', en: 'URL' },
    updateSocial: { ar: 'تحديث الرابط', en: 'Update Link' },
    closeChat: { ar: 'إغلاق المحادثة', en: 'Close Chat' },
  };
  return dict[key]?.[lang] || key;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('language') || 'ar');
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState('');

  // Chat states
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [salesReply, setSalesReply] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerMsg, setPlayerMsg] = useState('');
  const [addBalanceMap, setAddBalanceMap] = useState<Record<string, string>>({});

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [videoUrl, setVideoUrl] = useState('');
  const [fileForm, setFileForm] = useState({ fileName: '', fileUrl: '', description: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // tRPC queries
  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { refetchInterval: 5000 });
  const { data: keys, refetch: refetchKeys } = trpc.admin.listKeys.useQuery();
  const { data: visitorChats, refetch: refetchVisitorChats } = trpc.admin.getVisitorChats.useQuery(undefined, { refetchInterval: 3000 });
  const { data: playerChats } = trpc.admin.getPlayerChats.useQuery(undefined, { refetchInterval: 3000 });
  const { data: products, refetch: refetchProducts } = trpc.admin.listProducts.useQuery();
  const { data: heroVideoData, refetch: refetchHeroVideo } = trpc.admin.getHeroVideo.useQuery();
  const { data: files, refetch: refetchFiles } = trpc.admin.listFiles.useQuery();
  const { data: socialLinks, refetch: refetchSocial } = trpc.admin.listSocialLinks.useQuery();

  // Mutations
  const createKey = trpc.admin.createKey.useMutation({ onSuccess: () => { refetchKeys(); setShowCreateModal(false); showToast(t('createKey', lang) + ' OK'); } });
  const deleteKey = trpc.admin.deleteKey.useMutation({ onSuccess: () => { refetchKeys(); showToast('Deleted'); } });
  const addBalance = trpc.admin.addBalance.useMutation({ onSuccess: () => { refetchKeys(); showToast('Balance added'); } });
  const sendVisitorReply = trpc.admin.sendVisitorReply.useMutation({ onSuccess: () => { refetchVisitorChats(); setSalesReply(''); } });
  const closeVisitorChat = trpc.admin.closeVisitorChat.useMutation({ onSuccess: () => { refetchVisitorChats(); showToast('Chat closed'); } });
  const sendPlayerReply = trpc.admin.sendPlayerReply.useMutation({ onSuccess: () => { utils.admin.getPlayerChats.invalidate(); setPlayerMsg(''); } });
  const upsertProduct = trpc.admin.upsertProduct.useMutation({ onSuccess: () => { refetchProducts(); setShowProductModal(false); showToast('Product saved'); } });
  const setHeroVideo = trpc.admin.setHeroVideo.useMutation({ onSuccess: () => { refetchHeroVideo(); setShowVideoModal(false); showToast('Video updated'); } });
  const addFile = trpc.admin.addFile.useMutation({ onSuccess: () => { refetchFiles(); setShowFileModal(false); setFileForm({ fileName: '', fileUrl: '', description: '' }); showToast('File added'); } });
  const deleteFile = trpc.admin.deleteFile.useMutation({ onSuccess: () => { refetchFiles(); showToast('File deleted'); } });
  const toggleFile = trpc.admin.toggleFile.useMutation({ onSuccess: () => { refetchFiles(); } });
  const setSocialLink = trpc.admin.setSocialLink.useMutation({ onSuccess: () => { refetchSocial(); showToast('Link updated'); } });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    createKey.mutate({
      name: data.get('name') as string,
      email: data.get('email') as string,
      balance: Number(data.get('balance')) || 0,
      plan: (data.get('plan') as 'basic' | 'beta' | 'combo') || 'basic',
    });
    form.reset();
  };

  const handleAddBalance = (key: string) => {
    const amount = Number(addBalanceMap[key]);
    if (!amount || amount <= 0) return;
    addBalance.mutate({ key, amount });
    setAddBalanceMap(p => ({ ...p, [key]: '' }));
  };

  const handleSendVisitorReply = () => {
    if (!salesReply.trim() || !selectedVisitor) return;
    sendVisitorReply.mutate({ visitorId: selectedVisitor, text: salesReply.trim() });
  };

  const handleSendPlayerMsg = () => {
    if (!playerMsg.trim() || !selectedPlayer) return;
    sendPlayerReply.mutate({ buyerKey: selectedPlayer, text: playerMsg.trim() });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    upsertProduct.mutate({
      plan: (data.get('plan') as 'basic' | 'beta' | 'combo') || editingProduct?.plan || 'basic',
      name: data.get('name') as string,
      description: (data.get('description') as string) || undefined,
      price: Number(data.get('price')) || 0,
      image: (data.get('image') as string) || undefined,
      badge: (data.get('badge') as string) || undefined,
      badgeClass: (data.get('badgeClass') as string) || undefined,
      cta: (data.get('cta') as string) || undefined,
      highlight: Number(data.get('highlight')) || 0,
      period: (data.get('period') as string) || undefined,
    });
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) setHeroVideo.mutate({ videoUrl: videoUrl.trim() });
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileForm.fileName && fileForm.fileUrl) {
      addFile.mutate(fileForm);
    }
  };

  const handleUpdateSocial = (platform: string, url: string) => {
    setSocialLink.mutate({ platform, url });
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/');
  };

  const navItems: { id: Section; icon: typeof House; label: string; badge?: boolean }[] = [
    { id: 'dashboard', icon: House, label: 'dashboard' },
    { id: 'keys', icon: Key, label: 'keyManagement' },
    { id: 'customers', icon: Users, label: 'customers' },
    { id: 'salesChat', icon: Headset, label: 'visitorChat', badge: true },
    { id: 'chat', icon: ChatText, label: 'playerChat', badge: true },
    { id: 'balance', icon: Wallet, label: 'balance' },
    { id: 'products', icon: Package, label: 'products' },
    { id: 'video', icon: Video, label: 'video' },
    { id: 'files', icon: FileArchive, label: 'files' },
    { id: 'social', icon: Globe, label: 'social' },
  ];

  const selectedVisitorData = visitorChats?.find(v => v.visitorId === selectedVisitor);

  return (
    <div className="min-h-[100dvh] flex" style={{ background: 'var(--bg-primary)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] px-7 py-3.5 rounded-xl text-white font-semibold text-sm animate-slide-down"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 z-[1000] transition-all duration-350 ${sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: lang === 'ar' ? 'none' : '1px solid var(--border-subtle)', borderLeft: lang === 'ar' ? '1px solid var(--border-subtle)' : 'none' }}>
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-center gap-3">
          <GameController className="w-6 h-6 text-[#2563EB] flex-shrink-0" weight="fill" />
          {!sidebarCollapsed && <span className="text-sm font-semibold text-[var(--text-secondary)] truncate">SAM X</span>}
        </div>

        <nav className="p-3 flex flex-col gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`sidebar-nav-item ${section === item.id ? 'active' : ''} ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" weight={section === item.id ? 'fill' : 'regular'} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm">{t(item.label, lang)}</span>
                  {item.badge && (
                    <span className="bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.id === 'salesChat' ? (visitorChats?.length ?? 0) : (playerChats?.length ?? 0)}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}

          <button onClick={logout} className={`sidebar-nav-item mt-4 hover:bg-[rgba(239,68,68,0.1)] hover:text-red-500 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <SignOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">{t('logout', lang)}</span>}
          </button>
        </nav>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB] transition-colors">
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-350 ${sidebarCollapsed ? (lang === 'ar' ? 'mr-[80px]' : 'ml-[80px]') : (lang === 'ar' ? 'mr-[280px]' : 'ml-[280px]')}`}>
        <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--border-subtle)]">
          <h1 className="font-display text-xl font-bold">{t(section, lang)}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard', lang)}</span>
            <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-8">
          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { icon: Users, color: 'text-purple-500', bg: 'rgba(168,85,247,0.15)', label: t('totalPlayers', lang), value: stats?.totalPlayers ?? 0 },
                  { icon: CurrencyDollar, color: 'text-green-500', bg: 'rgba(34,197,94,0.15)', label: t('monthlyRevenue', lang), value: '$' + (stats?.monthlyRevenue ?? 0) },
                  { icon: Key, color: 'text-orange-500', bg: 'rgba(249,115,22,0.15)', label: t('activeKeys', lang), value: stats?.activeKeys ?? 0 },
                  { icon: Headset, color: 'text-pink-500', bg: 'rgba(236,72,153,0.15)', label: t('supportInquiries', lang), value: stats?.supportInquiries ?? 0 },
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

              <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-display text-lg font-semibold mb-4">Recent Keys</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      <th className="text-left pb-3">{t('name', lang)}</th>
                      <th className="text-left pb-3">{t('plan', lang)}</th>
                      <th className="text-left pb-3">{t('balanceLabel', lang)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(keys ?? []).slice(-5).reverse().map((buyer) => (
                      <tr key={buyer.id} className="border-t border-[var(--border-subtle)]">
                        <td className="py-3 text-sm">{buyer.name}</td>
                        <td className="py-3 text-sm"><span className={buyer.plan === 'combo' ? 'badge-premium' : buyer.plan === 'beta' ? 'badge-warning' : 'badge-success'}>{buyer.plan.toUpperCase()}</span></td>
                        <td className="py-3 text-sm text-green-500 font-semibold">${buyer.balance}</td>
                      </tr>
                    ))}
                    {(!keys || keys.length === 0) && <tr><td colSpan={3} className="py-8 text-center text-[var(--text-muted)]">No activity</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* KEYS */}
          {section === 'keys' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-semibold">{t('keyManagement', lang)}</h3>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary-blue text-sm py-2 px-4">
                  <Plus className="w-4 h-4" /> {t('createKey', lang)}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {(keys ?? []).map((buyer) => (
                  <div key={buyer.key} className="rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex-1">
                      <code className="px-3 py-1.5 rounded-lg text-sm font-bold text-[#2563EB]" style={{ background: 'rgba(37,99,235,0.08)', border: '1px dashed rgba(37,99,235,0.3)' }}>{buyer.key}</code>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-semibold">{buyer.name}</span>
                        <span className={buyer.plan === 'combo' ? 'badge-premium' : buyer.plan === 'beta' ? 'badge-warning' : 'badge-success'}>{buyer.plan.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(buyer.key); showToast('Copied'); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-orange-500 hover:bg-[rgba(249,115,22,0.1)]" title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteKey.mutate({ key: buyer.key })} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-[rgba(239,68,68,0.1)]" title="Delete">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!keys || keys.length === 0) && <div className="text-center py-12 text-[var(--text-muted)]">No keys yet</div>}
              </div>
            </>
          )}

          {/* CUSTOMERS */}
          {section === 'customers' && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    <th className="text-left p-4">{t('name', lang)}</th>
                    <th className="text-left p-4">Key</th>
                    <th className="text-left p-4">{t('email', lang)}</th>
                    <th className="text-left p-4">{t('balanceLabel', lang)}</th>
                    <th className="text-left p-4">{t('plan', lang)}</th>
                    <th className="text-left p-4">{t('actions', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {(keys ?? []).map((buyer) => (
                    <tr key={buyer.key} className="border-t border-[var(--border-subtle)]">
                      <td className="p-4 text-sm font-semibold">{buyer.name}</td>
                      <td className="p-4 text-sm font-mono text-[#2563EB]">{buyer.key}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{buyer.email}</td>
                      <td className="p-4 text-sm text-green-500 font-semibold">${buyer.balance}</td>
                      <td className="p-4"><span className={buyer.plan === 'combo' ? 'badge-premium' : buyer.plan === 'beta' ? 'badge-warning' : 'badge-success'}>{buyer.plan.toUpperCase()}</span></td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => deleteKey.mutate({ key: buyer.key })} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-[rgba(239,68,68,0.1)]"><Trash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {(!keys || keys.length === 0) && <tr><td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">No customers</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* VISITOR CHAT */}
          {section === 'salesChat' && (
            <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] flex flex-col md:grid md:grid-cols-[320px_1fr]" style={{ height: '650px', background: 'var(--bg-secondary)' }}>
              <div className="border-b md:border-b-0 md:border-r border-[var(--border-subtle)] overflow-y-auto">
                {(visitorChats ?? []).length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)]"><ShoppingCart className="w-12 h-12 mx-auto mb-4" /><p>No visitor chats</p></div>
                ) : (
                  (visitorChats ?? []).map((c) => (
                    <button key={c.visitorId} onClick={() => setSelectedVisitor(c.visitorId)}
                      className={`w-full p-4 text-left border-b border-[var(--border-subtle)] transition-all flex items-center gap-3 ${selectedVisitor === c.visitorId ? 'bg-[rgba(37,99,235,0.05)] border-l-[3px] border-l-[#2563EB]' : 'hover:bg-[rgba(37,99,235,0.03)]'}`}>
                      <div className="w-9 h-9 rounded-full bg-gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{c.visitorName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{c.visitorName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{c.messages.length} msgs</div>
                      </div>
                      <span className={c.status === 'closed' ? 'badge-info !text-[10px]' : c.status === 'replied' ? 'badge-success !text-[10px]' : 'badge-warning !text-[10px]'}>{c.status.toUpperCase()}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-col" style={{ background: 'var(--bg-primary)' }}>
                <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center text-white font-bold">{selectedVisitorData ? selectedVisitorData.visitorName.charAt(0) : '?'}</div>
                    <div>
                      <div className="font-semibold">{selectedVisitorData ? selectedVisitorData.visitorName : t('selectVisitor', lang)}</div>
                      <div className="text-xs text-[var(--text-muted)]">Visitor Chat</div>
                    </div>
                  </div>
                  {selectedVisitorData && selectedVisitorData.status !== 'closed' && (
                    <button onClick={() => selectedVisitor && closeVisitorChat.mutate({ visitorId: selectedVisitor })} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-[rgba(239,68,68,0.1)]">
                      <LockOpen className="w-4 h-4" /> {t('closeChat', lang)}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                  {selectedVisitorData ? selectedVisitorData.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sent === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${msg.sent === 0 ? 'bg-gradient-blue text-white rounded-br-md' : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-md'}`}>
                        <div>{msg.text}</div>
                        <div className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )) : <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]"><Headset className="w-16 h-16 opacity-30" /></div>}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-5 border-t border-[var(--border-subtle)] flex gap-3">
                  <input type="text" value={salesReply} onChange={e => setSalesReply(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendVisitorReply()}
                    placeholder={selectedVisitor ? t('typeReply', lang) : t('selectVisitor', lang)}
                    disabled={!selectedVisitor || selectedVisitorData?.status === 'closed'}
                    className="flex-1 input-field text-sm" />
                  <button onClick={handleSendVisitorReply} disabled={!selectedVisitor || !salesReply.trim() || selectedVisitorData?.status === 'closed'}
                    className="w-12 h-12 rounded-xl bg-gradient-blue text-white flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-50">
                    <PaperPlane className="w-5 h-5" weight="fill" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PLAYER CHAT */}
          {section === 'chat' && (
            <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] flex flex-col md:grid md:grid-cols-[300px_1fr]" style={{ height: '600px', background: 'var(--bg-secondary)' }}>
              <div className="border-b md:border-b-0 md:border-r border-[var(--border-subtle)] overflow-y-auto">
                {(keys ?? []).map(b => (
                  <button key={b.key} onClick={() => setSelectedPlayer(b.key)}
                    className={`w-full p-4 text-left border-b border-[var(--border-subtle)] transition-all flex items-center gap-3 ${selectedPlayer === b.key ? 'bg-[rgba(37,99,235,0.05)] border-l-[3px] border-l-[#2563EB]' : 'hover:bg-[rgba(37,99,235,0.03)]'}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{b.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{b.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{b.plan.toUpperCase()}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  </button>
                ))}
              </div>

              <div className="flex flex-col" style={{ background: 'var(--bg-primary)' }}>
                <div className="p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-blue flex items-center justify-center text-white font-bold">{selectedPlayer ? (keys ?? []).find(b => b.key === selectedPlayer)?.name.charAt(0) || '?' : '?'}</div>
                  <div>
                    <div className="font-semibold">{selectedPlayer ? (keys ?? []).find(b => b.key === selectedPlayer)?.name : t('selectPlayer', lang)}</div>
                    <div className="text-xs text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                  {selectedPlayer && playerChats?.filter(m => m.buyerKey === selectedPlayer).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sent === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${msg.sent === 0 ? 'bg-gradient-blue text-white rounded-br-md' : 'bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] rounded-bl-md'}`}>
                        <div>{msg.text}</div>
                        <div className="text-[10px] mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                  {(!selectedPlayer || !playerChats?.filter(m => m.buyerKey === selectedPlayer).length) && (
                    <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]"><ChatText className="w-16 h-16 opacity-30" /></div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-5 border-t border-[var(--border-subtle)] flex gap-3">
                  <input type="text" value={playerMsg} onChange={e => setPlayerMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendPlayerMsg()}
                    placeholder={t('typeMessage', lang)} disabled={!selectedPlayer} className="flex-1 input-field text-sm" />
                  <button onClick={handleSendPlayerMsg} disabled={!selectedPlayer || !playerMsg.trim()}
                    className="w-12 h-12 rounded-xl bg-gradient-blue text-white flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-50">
                    <PaperPlane className="w-5 h-5" weight="fill" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BALANCE */}
          {section === 'balance' && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    <th className="text-left p-4">{t('name', lang)}</th>
                    <th className="text-left p-4">Key</th>
                    <th className="text-left p-4">{t('balanceLabel', lang)}</th>
                    <th className="text-left p-4">{t('actions', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {(keys ?? []).map(b => (
                    <tr key={b.key} className="border-t border-[var(--border-subtle)]">
                      <td className="p-4 text-sm font-semibold">{b.name}</td>
                      <td className="p-4 text-sm font-mono text-[#2563EB]">{b.key}</td>
                      <td className="p-4 text-sm text-green-500 font-semibold">${b.balance}</td>
                      <td className="p-4 flex gap-2">
                        <input type="number" value={addBalanceMap[b.key] || ''} onChange={e => setAddBalanceMap(p => ({ ...p, [b.key]: e.target.value }))}
                          placeholder="Amount" className="input-field w-24 text-sm py-2" />
                        <button onClick={() => handleAddBalance(b.key)} className="btn-primary-blue text-sm py-2 px-4">Add</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PRODUCTS */}
          {section === 'products' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-semibold">{t('products', lang)}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(products ?? []).map((p) => (
                  <div key={p.plan} className="stat-card" style={p.highlight ? { borderColor: 'rgba(37,99,235,0.4)' } : {}}>
                    <h4 className="font-display text-lg font-semibold mb-2">{p.name}</h4>
                    <p className="text-[var(--text-secondary)] text-sm mb-1">${p.price}/month</p>
                    <p className="text-[var(--text-muted)] text-xs mb-4">{p.description}</p>
                    <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-500 hover:bg-[rgba(168,85,247,0.1)]">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!products || products.length === 0) && ['basic', 'beta', 'combo'].map(plan => (
                  <div key={plan} className="stat-card">
                    <h4 className="font-display text-lg font-semibold mb-2">{plan.toUpperCase()}</h4>
                    <p className="text-[var(--text-muted)] text-xs mb-4">No data</p>
                    <button onClick={() => { setEditingProduct({ plan }); setShowProductModal(true); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-500 hover:bg-[rgba(168,85,247,0.1)]">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VIDEO */}
          {section === 'video' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-semibold">{t('video', lang)}</h3>
                <button onClick={() => { setVideoUrl(heroVideoData?.videoUrl || ''); setShowVideoModal(true); }} className="btn-primary-blue text-sm py-2 px-4">
                  <Pencil className="w-4 h-4" /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)]" style={{ background: 'var(--bg-secondary)' }}>
                <div className="relative aspect-video">
                  <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                    <source src={heroVideoData?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-gaming-setup-with-neon-lights-4827-large.mp4"} type="video/mp4" />
                  </video>
                </div>
                <div className="p-6">
                  <p className="text-[var(--text-secondary)] text-sm">{t('videoUrl', lang)}:</p>
                  <code className="text-xs text-[#2563EB] break-all">{heroVideoData?.videoUrl || 'Default'}</code>
                </div>
              </div>
            </div>
          )}

          {/* FILES */}
          {section === 'files' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-semibold">{t('files', lang)}</h3>
                <button onClick={() => setShowFileModal(true)} className="btn-primary-blue text-sm py-2 px-4">
                  <Plus className="w-4 h-4" /> {t('addFile', lang)}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {(files ?? []).map((file) => (
                  <div key={file.id} className="rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{file.fileName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{file.description}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={file.active ? 'badge-success' : 'badge-info'}>{file.active ? t('active', lang) : t('inactive', lang)}</span>
                      <button onClick={() => toggleFile.mutate({ id: file.id, active: file.active ? 0 : 1 })} className="w-9 h-9 rounded-lg flex items-center justify-center text-green-500 hover:bg-[rgba(34,197,94,0.1)]">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteFile.mutate({ id: file.id })} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-[rgba(239,68,68,0.1)]">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!files || files.length === 0) && <div className="text-center py-12 text-[var(--text-muted)]">No files yet</div>}
              </div>
            </div>
          )}

          {/* SOCIAL LINKS */}
          {section === 'social' && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-6">{t('social', lang)}</h3>
              <div className="flex flex-col gap-4">
                {['discord', 'youtube', 'telegram'].map((platform) => {
                  const existing = socialLinks?.find(s => s.platform === platform);
                  const [url, setUrl] = useState(existing?.url || '');
                  useEffect(() => { setUrl(existing?.url || ''); }, [existing]);
                  return (
                    <div key={platform} className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        {platform === 'discord' && <DiscordLogo className="w-6 h-6 text-[#5865F2]" />}
                        {platform === 'youtube' && <YoutubeLogo className="w-6 h-6 text-red-500" />}
                        {platform === 'telegram' && <PaperPlaneTilt className="w-6 h-6 text-[#0088CC]" />}
                        <span className="font-semibold capitalize">{platform}</span>
                      </div>
                      <div className="flex gap-3">
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                          placeholder={`https://${platform}.com/...`} className="flex-1 input-field text-sm" />
                        <button onClick={() => handleUpdateSocial(platform, url)} className="btn-primary-blue text-sm py-2 px-4">
                          {t('save', lang)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-[500px] mx-4 rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold">{t('createKey', lang)}</h3>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateKey}>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('name', lang)}</label><input type="text" name="name" required className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('email', lang)}</label><input type="email" name="email" required className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Balance ($)</label><input type="number" name="balance" defaultValue="0" min="0" className="input-field" /></div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('plan', lang)}</label>
                <select name="plan" className="input-field" defaultValue="basic">
                  <option value="basic">Basic - $12</option>
                  <option value="beta">Beta - $15</option>
                  <option value="combo">Combo - $17</option>
                </select>
              </div>
              <button type="submit" className="btn-primary-blue w-full">{t('createKey', lang)}</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowProductModal(false)}>
          <div className="w-full max-w-[500px] mx-4 rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold">{lang === 'ar' ? 'تعديل منتج' : 'Edit Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <input type="hidden" name="plan" value={editingProduct.plan} />
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('name', lang)}</label><input type="text" name="name" defaultValue={editingProduct.name || ''} required className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('description', lang)}</label><textarea name="description" defaultValue={editingProduct.description || ''} className="input-field" rows={3} /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Price ($)</label><input type="number" name="price" defaultValue={editingProduct.price || ''} step="0.01" required className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Image URL</label><input type="url" name="image" defaultValue={editingProduct.image || ''} className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Badge</label><input type="text" name="badge" defaultValue={editingProduct.badge || ''} className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">CTA</label><input type="text" name="cta" defaultValue={editingProduct.cta || ''} className="input-field" /></div>
              <div className="mb-6"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Highlight</label><select name="highlight" defaultValue={editingProduct.highlight || 0} className="input-field"><option value={0}>No</option><option value={1}>Yes</option></select></div>
              <button type="submit" className="btn-primary-blue w-full">{t('save', lang)}</button>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowVideoModal(false)}>
          <div className="w-full max-w-[500px] mx-4 rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold">{t('video', lang)}</h3>
              <button onClick={() => setShowVideoModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVideo}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('videoUrl', lang)}</label>
                <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required className="input-field" placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary-blue w-full">{t('save', lang)}</button>
            </form>
          </div>
        </div>
      )}

      {/* File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowFileModal(false)}>
          <div className="w-full max-w-[500px] mx-4 rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold">{t('addFile', lang)}</h3>
              <button onClick={() => setShowFileModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[#2563EB]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFile}>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('fileName', lang)}</label><input type="text" value={fileForm.fileName} onChange={e => setFileForm(p => ({ ...p, fileName: e.target.value }))} required className="input-field" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('fileUrl', lang)}</label><input type="url" value={fileForm.fileUrl} onChange={e => setFileForm(p => ({ ...p, fileUrl: e.target.value }))} required className="input-field" placeholder="https://..." /></div>
              <div className="mb-6"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('description', lang)}</label><textarea value={fileForm.description} onChange={e => setFileForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} /></div>
              <button type="submit" className="btn-primary-blue w-full">{t('save', lang)}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
