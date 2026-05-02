'use client';

import { useEffect, useState, FormEvent, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

type Message = {
    id: number;
    content: string;
    sender_id: string;
    conversation_id: string;
    created_at?: string;
};

export default function Chat(props: { id?: string }) {
    const params = useParams();
    const convoId = props.id ?? (params?.id as string);
    const router = useRouter();
    const isEmbedded = !!props.id;

    const [userId, setUserId] = useState<string | null>(null);
    const [companionId, setCompanionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [usernames, setUsernames] = useState<Record<string, string>>({});
    const [draft, setDraft] = useState('');
    const [optimisticIds, setOptimisticIds] = useState<number[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!draft.trim() || !userId || !convoId) return;

        const supabase = createClient();
        const content = draft.trim();
        setDraft('');

        const { data, error } = await supabase
            .from('messages')
            .insert([{ content, sender_id: userId, conversation_id: convoId }])
            .select()
            .single();

        if (error) {
            console.error('Error inserting message:', error);
            return;
        }

        if (data) {
            setOptimisticIds((prev) => [...prev, data.id]);
            setMessages((prev) => [...prev, data]);

            await supabase
                .from('conversations')
                .update({ last_message_at: data.created_at })
                .eq('id', convoId);
        }
    };

    useEffect(() => {
        const supabase = createClient();
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data: convo } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', convoId)
                .single();
            if (!convo) return;

            const other = convo.user1_id === user.id ? convo.user2_id : convo.user1_id;
            setCompanionId(other);

            const { data: users } = await supabase
                .from('users')
                .select('id, username')
                .in('id', [user.id, other]);
            if (users) {
                setUsernames(
                    users.reduce<Record<string, string>>(
                        (a, u) => ({ ...a, [u.id]: u.username }),
                        {}
                    )
                );
            }

            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convoId)
                .order('created_at');
            if (msgs) setMessages(msgs as Message[]);
        };
        load();
    }, [convoId]);

    useEffect(() => {
        if (!convoId) return;
        const supabase = createClient();

        const channel = supabase
            .channel(`conversation-${convoId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${convoId}`,
                },
                (payload: RealtimePostgresInsertPayload<Message>) => {
                    if (optimisticIds.includes(payload.new.id)) return;
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [convoId, optimisticIds]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    if (!convoId) {
        return <div className="p-6 text-ink-500">Error: no conversation ID provided.</div>;
    }

    if (!companionId) {
        return (
            <div className="flex-1 flex items-center justify-center text-ink-500">
                Loading conversation…
            </div>
        );
    }

    const companionName = usernames[companionId] ?? 'Unknown';
    const companionInitial = companionName.charAt(0).toUpperCase();

    const containerClass = isEmbedded
        ? 'flex flex-col w-full h-full bg-surface rounded-xl border border-line overflow-hidden'
        : 'mx-auto max-w-2xl w-full h-[calc(100dvh-64px-2rem)] my-4 flex flex-col bg-surface rounded-xl border border-line shadow-card overflow-hidden';

    return (
        <div className={containerClass}>
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-white/70 backdrop-blur">
                {!isEmbedded && (
                    <button
                        onClick={() => router.back()}
                        aria-label="Back"
                        className="grid place-items-center h-9 w-9 rounded-full text-ink-700 hover:bg-surface-muted"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                )}
                <div className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold">
                    {companionInitial}
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-ink-900 truncate">{companionName}</h2>
                    <p className="text-[11px] text-ink-500">Direct message</p>
                </div>
            </header>

            {/* Messages */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-surface-muted/40"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-ink-500">
                        Say hi to {companionName} — your messages will appear here.
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const mine = m.sender_id === userId;
                        const prev = messages[idx - 1];
                        const showStamp =
                            !prev ||
                            (prev.created_at &&
                                m.created_at &&
                                Math.abs(
                                    new Date(m.created_at).getTime() -
                                        new Date(prev.created_at).getTime()
                                ) > 5 * 60 * 1000);

                        return (
                            <div key={m.id} className="flex flex-col">
                                {showStamp && m.created_at && (
                                    <p className="text-[11px] text-ink-400 text-center my-2">
                                        {new Date(m.created_at).toLocaleString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                                <div
                                    className={[
                                        'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-snug break-words shadow-sm',
                                        mine
                                            ? 'ml-auto bg-brand-600 text-white rounded-br-md'
                                            : 'mr-auto bg-white text-ink-900 border border-line rounded-bl-md',
                                    ].join(' ')}
                                >
                                    {m.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>

            {/* Composer */}
            <footer className="px-3 py-3 border-t border-line bg-white">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        className="cc-input flex-1 !h-11 rounded-full"
                        placeholder="Type a message…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyUp={(e) => {
                            if (e.key !== 'Enter') return;
                            handleSend();
                        }}
                        aria-label="Message"
                    />
                    <button
                        type="submit"
                        disabled={draft.trim() === ''}
                        aria-label="Send"
                        className="grid place-items-center h-11 w-11 rounded-full bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 disabled:bg-brand-200 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
