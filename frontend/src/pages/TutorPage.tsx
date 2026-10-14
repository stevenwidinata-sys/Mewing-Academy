import { useEffect, useRef, useState } from 'react';
import { MAX_MESSAGE_LENGTH } from '../../../shared/tutor';
import { Mewy } from '../components/Mewy';
import { askTutor, fetchConfig } from '../lib/api';
import { useSettings } from '../state/settings';

interface Msg {
  from: 'you' | 'mewy';
  text: string;
  confidence?: number;
}

export function TutorPage() {
  const { tr, settings } = useSettings();
  const [messages, setMessages] = useState<Msg[]>([{ from: 'mewy', text: tr('tutorIntro') }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [smart, setSmart] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchConfig().then((c) => setSmart(Boolean(c?.llm)));
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { from: 'you', text }]);
    setInput('');
    setBusy(true);
    const reply = await askTutor(text, settings.lang);
    setMessages((m) => [...m, { from: 'mewy', text: reply.reply, confidence: reply.confidence }]);
    setBusy(false);
    requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight));
  };

  return (
    <section>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        💬 {tr('navTutor')}
        {smart && (
          <span className="pixel-panel" style={{ fontSize: '0.6rem', padding: '0.3rem 0.6rem', background: 'var(--pink)', color: 'var(--ink)' }}>
            ✨ Smart Mewy
          </span>
        )}
      </h1>
      <div
        ref={listRef}
        aria-live="polite"
        className="pixel-panel"
        style={{ height: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg)' }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', flexDirection: m.from === 'you' ? 'row-reverse' : 'row' }}>
            {m.from === 'mewy' && <Mewy size={36} />}
            <div
              style={{
                maxWidth: '75%',
                background: m.from === 'you' ? 'var(--cyan)' : 'var(--panel-light)',
                color: m.from === 'you' ? 'var(--ink)' : 'var(--white)',
                border: '3px solid var(--ink)',
                padding: '0.6rem 0.8rem',
                fontFamily: 'var(--font-read)',
              }}
            >
              {m.text}
              {m.from === 'mewy' && m.confidence != null && (
                <div style={{ marginTop: 6, fontSize: '0.7rem', opacity: 0.85 }}>
                  {tr('tutorConfident')}: {'●'.repeat(Math.round(m.confidence * 5)).padEnd(5, '○')}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <p style={{ fontFamily: 'var(--font-read)' }}>{tr('tutorThinking')}</p>}
      </div>

      <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <label htmlFor="tutor-input" className="sr-only">{tr('tutorPlaceholder')}</label>
        <input
          id="tutor-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tr('tutorPlaceholder')}
          maxLength={MAX_MESSAGE_LENGTH}
          style={{ flex: 1 }}
          autoComplete="off"
        />
        <button type="submit" className="btn" disabled={busy || !input.trim()}>{tr('tutorSend')}</button>
      </form>
    </section>
  );
}
