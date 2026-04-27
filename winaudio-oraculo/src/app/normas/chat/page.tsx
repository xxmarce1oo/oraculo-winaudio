'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, Loader } from 'lucide-react';
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

function ChatContent() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [drawerRuleId, setDrawerRuleId] = useState<string | null>(null);
  const welcomeShown = useRef(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Busca apenas o token — perfil já vem do contexto
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
      }
    });
  }, []);

  // Gera a boas-vindas uma única vez quando o perfil estiver disponível
  useEffect(() => {
    if (!profile || welcomeShown.current) return;
    welcomeShown.current = true;

    const greeting = getGreeting();
    const nome = profile.full_name || 'Colaborador';
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}, ${nome}! Estou aqui para ajudar. Como posso assisti-lo hoje?`,
      timestamp: new Date(),
    }]);
  }, [profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout>
      <PageHeader
        title="Oráculo IA"
        description="Faça perguntas sobre as normas e políticas da WinAudio"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-2">
                  Bem-vindo ao Oráculo
                </h3>
                <p className="text-[var(--color-text-muted)] max-w-sm">
                  Faça perguntas sobre as normativas e políticas da WinAudio. O Oráculo usará inteligência artificial para responder com base nas regras cadastradas.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                      : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] rounded-bl-none border border-[var(--color-border-light)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.id !== 'welcome' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/10">
                      <p className="text-xs font-semibold mb-1.5 opacity-60">Fontes:</p>
                      <ul className="text-xs space-y-1">
                        {message.sources.map((source) => (
                          <li key={source.id}>
                            <button
                              onClick={() => setDrawerRuleId(source.id)}
                              className="flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:underline transition-opacity text-left"
                            >
                              <span>•</span>
                              <span>{source.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-50">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-bg-muted)] border border-[var(--color-border-light)] rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader size={16} className="animate-spin text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">Oráculo está pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-white)] p-4 md:p-6">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Faça uma pergunta sobre as normas..."
              disabled={loading || !authToken}
              className="flex-1 bg-[var(--color-bg-muted)] border border-[var(--color-border-light)] rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !authToken}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-4 py-3 transition-colors flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      <DrawerNorma ruleId={drawerRuleId} onFechar={() => setDrawerRuleId(null)} />
    </EmployeeLayout>
  );
}
