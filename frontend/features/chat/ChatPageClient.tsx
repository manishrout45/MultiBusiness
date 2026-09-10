'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth';
import { RequireAuth } from '@/features/auth/RequireRole';
import { apiRequest } from '@/lib/api';

interface Thread {
  id: number;
  subject?: string;
  business_name?: string;
  customer_name?: string;
  status: string;
  last_message_at?: string;
}

interface Message {
  id: number;
  body: string;
  sender_id: number;
  sender_name?: string;
  created_at: string;
}

function ChatInbox({ basePath }: { basePath: '/customer' | '/vendor' | '/admin' }) {
  const { token, user } = useAuth();
  const { id } = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('Support');
  const [newMsg, setNewMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadThreads = useCallback(async () => {
    if (!token) return;
    const res = await apiRequest<{ data: Thread[] }>(`${basePath}/chat`, { token });
    setThreads(res.data || []);
  }, [token, basePath]);

  const loadThread = useCallback(async () => {
    if (!token || !id) return;
    const res = await apiRequest<{ data: Thread & { messages: Message[] } }>(
      `${basePath}/chat/${id}`,
      { token }
    );
    setMessages(res.data?.messages || []);
  }, [token, basePath, id]);

  useEffect(() => {
    void loadThreads().catch(() => setThreads([]));
  }, [loadThreads]);

  useEffect(() => {
    if (id) void loadThread().catch(() => setMessages([]));
  }, [id, loadThread]);

  async function send() {
    if (!token || !id || !text.trim()) return;
    setBusy(true);
    try {
      await apiRequest(`${basePath}/chat/${id}/messages`, {
        method: 'POST',
        token,
        body: { message: text.trim() },
      });
      setText('');
      await loadThread();
      await loadThreads();
    } finally {
      setBusy(false);
    }
  }

  async function startSupport() {
    if (!token || !newMsg.trim() || basePath !== '/customer') return;
    setBusy(true);
    try {
      const res = await apiRequest<{ data: { id: number } }>('/customer/chat', {
        method: 'POST',
        token,
        body: { subject, message: newMsg.trim() },
      });
      setNewMsg('');
      window.location.href = `/chat/${res.data.id}`;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3">
        <h1 className="text-xl font-bold">Chat</h1>
        {basePath === '/customer' && (
          <div className="space-y-2 rounded-xl border p-3">
            <p className="text-sm font-medium">Start support chat</p>
            <input
              className="h-9 w-full rounded-md border px-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
            <Textarea rows={2} value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
            <Button size="sm" disabled={busy} onClick={() => void startSupport()}>
              Start
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={basePath === '/vendor' ? `/vendor/chat/${t.id}` : `/chat/${t.id}`}
              className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
            >
              <p className="font-medium truncate">
                {t.business_name || t.customer_name || t.subject || `Chat #${t.id}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{t.status}</p>
            </Link>
          ))}
          {!threads.length && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </aside>

      <section className="min-h-[420px] rounded-2xl border bg-card p-4">
        {!id ? (
          <p className="text-sm text-muted-foreground">Select a conversation.</p>
        ) : (
          <div className="flex h-full flex-col gap-3">
            <div className="flex-1 space-y-2 overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    Number(m.sender_id) === Number(user?.id)
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-[11px] opacity-70">{m.sender_name}</p>
                  <p>{m.body}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
              />
              <Button disabled={busy} onClick={() => void send()}>
                Send
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function CustomerChatPage() {
  return (
    <RequireAuth fallbackHref="/login">
      <ChatInbox basePath="/customer" />
    </RequireAuth>
  );
}

export function VendorChatPage() {
  return (
    <RequireAuth fallbackHref="/login">
      <ChatInbox basePath="/vendor" />
    </RequireAuth>
  );
}
