'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader, Sparkles, Trash2 } from 'lucide-react';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { useAuth } from '@/context/AuthContext';
import { DrawerNorma } from '@/components/salas/DrawerNorma';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Source {
  id: string;
  title: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}


function AssistantText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split('\n').filter(l => l.trim());

        // Bloco de lista numerada
        const isNumberedList = lines.every(l => /^\d+\./.test(l.trim()));
        if (isNumberedList && lines.length > 1) {
          return (
            <ol key={i} className="space-y-1.5">
              {lines.map((line, j) => {
                const match = line.match(/^(\d+)\.\s+(.*)/);
                if (!match) return null;
                return (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold flex items-center justify-center mt-0.5">
                      {match[1]}
                    </span>
                    <span>{match[2]}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Parágrafo com múltiplas linhas (não numeradas) — exibe como lista simples
        if (lines.length > 1) {
          return (
            <div key={i} className="space-y-1">
              {lines.map((line, j) => (
                <p key={j} className="text-sm leading-relaxed">{line}</p>
              ))}
            </div>
          );
        }

        // Parágrafo simples
        return <p key={i} className="text-sm leading-relaxed">{paragraph}</p>;
      })}
    </div>
  );
}

function ChatContent() {
  const { profile } = useAuth();
  const CACHE_KEY = 'oraculo_chat_history';

  const loadCached = (): Message[] => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
      return [];
    }
  };

  const [messages, setMessages] = useState<Message[]>(loadCached);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [drawerRuleId, setDrawerRuleId] = useState<string | null>(null);
  const welcomeShown = useRef(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
      }
    });
  }, []);

  // Persiste no sessionStorage sempre que as mensagens mudam
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Boas-vindas apenas se não há histórico em cache
  useEffect(() => {
    if (!profile || welcomeShown.current) return;
    welcomeShown.current = true;
    if (messages.length > 0) return; // já tem histórico

    const greeting = getGreeting();
    const nome = profile.full_name || 'Colaborador';
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}, ${nome}! Estou aqui para ajudar. Como posso assisti-lo hoje?`,
      timestamp: new Date(),
    }]);
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !authToken || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Envia histórico (exclui a mensagem de boas-vindas e a atual)
    const history = updatedMessages
      .filter(m => m.id !== 'welcome')
      .slice(0, -1) // remove a mensagem que acabou de ser adicionada (já vai como `message`)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: input, history }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao processar mensagem');

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        sources: data.sources,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const suggestions = [
    'Como funciona o processo de vendas?',
    'Qual a política de home office?',
    'Quais são as regras de atendimento ao cliente?',
  ];

  return (
    <AuthGuard>
      <EmployeeLayout>
        <PageHeader
          title="Oráculo IA"
          description="Faça perguntas sobre as normas e políticas da WinAudio"
          actions={
            messages.length > 0 && (
              <button
                onClick={() => { sessionStorage.removeItem(CACHE_KEY); setMessages([]); welcomeShown.current = false; }}
                className="flex items-center gap-1.5 text-xs text-[var(--color-text-light)] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={13} />
                Limpar conversa
              </button>
            )
          }
        />

        <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-bg-base)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">

            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-primary-dark)] mb-2">Bem-vindo ao Oráculo</h3>
                  <p className="text-[var(--color-text-muted)] max-w-sm text-sm">
                    Faça perguntas sobre as normativas e políticas da WinAudio.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-white)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar do Oráculo */}
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}

                <div className={`${message.role === 'user' ? 'max-w-[60%] items-end' : 'max-w-[80%] items-start'} flex flex-col gap-1`}>
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      message.role === 'user'
                        ? 'bg-[var(--color-primary)] text-white rounded-tr-sm'
                        : 'bg-white text-[var(--color-text-primary)] rounded-tl-sm border border-[var(--color-border-light)] shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant'
                      ? <AssistantText text={message.content} />
                      : <p className="text-sm leading-relaxed">{message.content}</p>
                    }

                    {message.id !== 'welcome' && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
                        <p className="text-xs font-semibold mb-1.5 text-[var(--color-text-muted)]">Baseado em:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source) => (
                            <button
                              key={source.id}
                              onClick={() => setDrawerRuleId(source.id)}
                              className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors font-medium"
                            >
                              {source.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-[var(--color-text-light)] px-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-[var(--color-bg-white)] border border-[var(--color-border-light)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader size={14} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-sm text-[var(--color-text-muted)]">Consultando as normas...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-white)] p-4 md:p-5">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Faça uma pergunta sobre as normas..."
                disabled={loading || !authToken}
                className="flex-1 bg-[var(--color-bg-muted)] border border-[var(--color-border-light)] rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || !authToken}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl w-12 h-12 flex items-center justify-center transition-all shadow-md hover:shadow-lg flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        <DrawerNorma ruleId={drawerRuleId} onFechar={() => setDrawerRuleId(null)} />
      </EmployeeLayout>
    </AuthGuard>
  );
}
