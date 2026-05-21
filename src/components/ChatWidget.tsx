import { useState, useRef, useEffect, useCallback } from 'react';
import { Headset, PaperPlane, CircleNotch, X } from '@phosphor-icons/react';
import { trpc } from '@/providers/trpc';

const MAX_DAILY_MSG = 50;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getVisitorId = () => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = 'VIS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('visitorId', id);
    }
    return id;
  };
  const [visitorId] = useState(getVisitorId);

  // Fetch messages for this visitor
  const { data: serverMessages, refetch: refetchMessages } = trpc.visitor.getMessages.useQuery(
    { visitorId },
    { enabled: open, refetchInterval: 2000 }
  );

  const sendMessage = trpc.visitor.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serverMessages, typing]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setTyping(true);

    sendMessage.mutate({
      visitorId,
      visitorName: 'Visitor ' + visitorId.slice(-4),
      text,
    }, {
      onSuccess: () => {
        setTimeout(() => setTyping(false), 500);
      },
      onError: () => setTyping(false),
    });
  }, [input, sendMessage, refetchMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const msgCount = parseInt(localStorage.getItem('msgCount_' + today) || '0');
  const remaining = MAX_DAILY_MSG - msgCount;

  const isArabic = document.documentElement.lang === 'ar';

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" style={{ direction: 'ltr' }}>
      {/* Chat Window */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? 'max-h-[520px] opacity-100 mb-2' : 'max-h-0 opacity-0 pointer-events-none mb-0'
        }`}
        style={{
          width: '380px',
          maxWidth: 'calc(100vw - 48px)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-blue flex items-center justify-center">
              <Headset className="w-4 h-4 text-white" weight="bold" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {isArabic ? 'الدعم الفني' : 'Support'}
              </div>
              <div className="text-[10px] text-green-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col" style={{ height: '400px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {(!serverMessages || serverMessages.length === 0) && (
              <div className="text-center text-[var(--text-muted)] text-sm py-8">
                {isArabic ? 'مرحباً! كيف يمكننا مساعدتك؟' : 'Welcome! How can we help you?'}
              </div>
            )}
            {serverMessages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent === 0 ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sent === 0
                      ? 'bg-gradient-blue text-white rounded-br-md'
                      : 'bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-md'
                  }`}
                >
                  {msg.sent === 1 && (
                    <div className="text-xs font-semibold mb-1 opacity-70 flex items-center gap-1">
                      <Headset className="w-3 h-3" weight="bold" />
                      {isArabic ? 'الدعم' : 'Support'}
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <div className={`text-[10px] mt-1 opacity-60 ${msg.sent === 0 ? 'text-left' : 'text-right'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] rounded-2xl rounded-bl-md px-4 py-3 text-xs text-[var(--text-muted)] italic flex items-center gap-2">
                  <CircleNotch className="w-3 h-3 animate-spin" />
                  {isArabic ? 'يكتب...' : 'Typing...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Counter */}
          <div className="text-center text-xs text-[var(--text-muted)] font-semibold px-4 mb-2">
            {remaining <= 0 ? (
              <span className="text-red-500">{isArabic ? 'تم الوصول للحد اليومي' : 'Daily limit reached'}</span>
            ) : (
              <span style={{ color: remaining <= 3 ? '#F59E0B' : 'var(--text-muted)' }}>
                {isArabic ? `${remaining} رسالة متبقية` : `${remaining} messages remaining`}
              </span>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 border-t border-[var(--border-subtle)] pt-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isArabic ? 'اكتب رسالتك...' : 'Type your message...'}
              disabled={remaining <= 0}
              maxLength={500}
              className="flex-1 input-field text-sm py-3"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || remaining <= 0}
              className="w-10 h-10 rounded-xl bg-gradient-blue text-white flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <PaperPlane className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gradient-blue cursor-pointer select-none flex items-center justify-center"
        style={{
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginLeft: 'auto',
          display: 'flex',
        }}
      >
        <Headset className="w-5 h-5 text-white" weight="bold" />
      </button>
    </div>
  );
}
