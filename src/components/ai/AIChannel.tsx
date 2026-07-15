import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { resolveProvider } from '../../services/brokerProvider';
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  pending: boolean;
}
function streamLetters(full: string, onFrame: (partial: string, done: boolean) => void): () => void {
  let i = 0;
  const id = setInterval(() => {
    i += 1;
    const done = i >= full.length;
    onFrame(full.slice(0, i), done);
    if (done) clearInterval(id);
  }, 16);
  return () => clearInterval(id);
}
const PRESETS = [
  'Why is AMD flagged STRONG_BUY?',
  'Summarize today\'s macro regime',
  'What is my portfolio beta?',
  'Which gate failed on COIN?',
];
export function AIChannel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cancelRef.current?.(), []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  const send = async (prompt: string) => {
    if (!prompt.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: prompt, pending: false };
    const botId = crypto.randomUUID();
    setMessages((m) => [...m, userMsg, { id: botId, role: 'assistant', text: '', pending: true }]);
    setDraft('');
    const provider = await resolveProvider();
    const answer = await provider.askAssistant({ userId: 'dev-user', accessToken: 'dev-token' }, prompt);
    cancelRef.current = streamLetters(answer, (partial, done) =>
      setMessages((m) => m.map((msg) => (msg.id === botId ? { ...msg, text: partial, pending: !done } : msg))),
    );
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); void send(draft); };
  return (
    <section className="flex h-[calc(100dvh-11.5rem)] flex-col justify-between">
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => <ChatBubble key={m.id} msg={m} />)}
      </div>
      <div className="pt-3">
        <div className="no-scrollbar -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => void send(p)}
              className="shrink-0 rounded-full border border-catalyst/30 bg-catalyst/10 px-3 py-1.5 text-xs text-catalyst-light transition-colors duration-300 hover:bg-catalyst/20"
            >
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask MeritQuant AI…"
            className="h-12 w-full rounded-full border border-white/10 bg-void-base/90 px-5 pr-14
                       font-interface text-sm text-white placeholder:text-system-slate shadow-glass-inset
                       outline-none transition-all duration-300 ease-out-expo
                       focus:ring-1 focus:ring-catalyst focus:border-catalyst"
          />
          <button
            type="submit"
            aria-label="Send"
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-catalyst text-white shadow-purple-glow transition-transform active:scale-90"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md border border-catalyst/25 bg-catalyst/15 text-white'
            : 'glass-surface rounded-bl-md text-white/85'
        }`}
      >
        {msg.text}
        {msg.pending && <span className="ml-0.5 inline-block w-2 animate-pulse text-catalyst-light">▍</span>}
      </div>
    </div>
  );
}
