'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Chat from '@/app/chat/[id]/page';
import convoMaker from '@/utils/ConvoMaker';
import {
    ChatBubbleLeftRightIcon,
    PlusCircleIcon,
    ArrowLeftIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';

interface Conversation {
    id: string;
    title?: string;
    user1_id: string;
    user2_id: string;
}

export default function MessagingPage() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [newPartnerId, setNewPartnerId] = useState('');
    const [usernames, setUsernames] = useState<Record<string, string>>({});
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('Not logged in');
                return;
            }
            setCurrentUserId(user.id);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        const fetchConversations = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .order('last_message_at', {
                    ascending: false,
                    // @ts-expect-error: nullsLast is valid but not typed yet
                    nullsLast: true,
                });

            if (error) {
                console.error('Error fetching conversations:', error);
                return;
            }
            setConversations(data as Conversation[]);

            const userIds = new Set<string>();
            data?.forEach((conv: Conversation) => {
                if (conv.user1_id !== currentUserId) userIds.add(conv.user1_id);
                if (conv.user2_id !== currentUserId) userIds.add(conv.user2_id);
            });

            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, username')
                .in('id', Array.from(userIds));

            if (userError) {
                console.error('Error fetching usernames:', userError);
            } else if (users) {
                setUsernames(
                    users.reduce<Record<string, string>>(
                        (acc, user) => ({ ...acc, [user.id]: user.username }),
                        {}
                    )
                );
            }
        };

        fetchConversations();
    }, [currentUserId, conversations.length]);

    const createConversation = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);
        if (!currentUserId || !newPartnerId.trim()) return;
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', newPartnerId.trim())
            .single();
        if (error || !data) {
            setCreateError(`No user named "${newPartnerId.trim()}"`);
            return;
        }
        const newConv = await convoMaker(currentUserId, data.id);
        if (!newConv) {
            setCreateError('Could not start conversation. Try again.');
            return;
        }
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
        setNewPartnerId('');
    };

    return (
        <div className="mx-auto max-w-7xl px-0 sm:px-4 py-0 sm:py-6 h-[calc(100dvh-64px)]">
            <div className="h-full flex flex-col sm:flex-row sm:gap-4 sm:cc-card sm:overflow-hidden bg-transparent sm:bg-surface">
                {/* Sidebar */}
                <aside
                    className={[
                        'w-full sm:w-80 sm:shrink-0 bg-white sm:bg-surface-muted/40 sm:border-r sm:border-line flex flex-col',
                        selectedConversation ? 'hidden sm:flex' : 'flex',
                    ].join(' ')}
                >
                    <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-line bg-white sm:bg-transparent">
                        <h1 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-ink-500" />
                            Messages
                        </h1>

                        <form onSubmit={createConversation} className="mt-4 flex flex-col gap-2">
                            <label htmlFor="new-convo" className="cc-label !mb-0">
                                Start a new chat
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="new-convo"
                                    type="text"
                                    placeholder="Username"
                                    value={newPartnerId}
                                    onChange={(e) => setNewPartnerId(e.target.value)}
                                    className="cc-input !h-10 flex-1"
                                />
                                <button
                                    type="submit"
                                    disabled={!newPartnerId.trim()}
                                    className="cc-btn cc-btn-primary !h-10 !px-3"
                                    aria-label="Start chat"
                                >
                                    <PlusCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                            {createError && (
                                <p role="alert" className="text-xs text-danger-700">
                                    {createError}
                                </p>
                            )}
                        </form>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-2">
                        {conversations.length === 0 ? (
                            <div className="text-center py-10 text-ink-500">
                                <InboxIcon className="h-7 w-7 mx-auto text-ink-400 mb-2" />
                                <p className="text-sm">No conversations yet.</p>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {conversations.map((conv) => {
                                    const isActive = selectedConversation?.id === conv.id;
                                    const otherId =
                                        conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
                                    const name = usernames[otherId] ?? 'Unknown';
                                    return (
                                        <li key={conv.id}>
                                            <button
                                                onClick={() => setSelectedConversation(conv)}
                                                className={[
                                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                                                    isActive
                                                        ? 'bg-brand-50 text-brand-800'
                                                        : 'hover:bg-white text-ink-700',
                                                ].join(' ')}
                                            >
                                                <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold shrink-0">
                                                    {name.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{name}</p>
                                                    <p className="text-xs text-ink-500">Tap to open</p>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* Chat area */}
                <section
                    className={[
                        'flex-1 flex flex-col min-w-0',
                        selectedConversation ? 'flex' : 'hidden sm:flex',
                    ].join(' ')}
                >
                    {selectedConversation ? (
                        <div className="flex-1 flex flex-col p-3 sm:p-4">
                            {/* Mobile back */}
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="sm:hidden inline-flex items-center gap-1 text-sm text-ink-700 mb-2 px-1"
                            >
                                <ArrowLeftIcon className="h-4 w-4" /> Back
                            </button>
                            <div className="flex-1 min-h-0">
                                <Chat id={selectedConversation.id} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 hidden sm:flex flex-col items-center justify-center text-center p-10">
                            <div className="grid place-items-center h-14 w-14 rounded-full bg-surface-muted mb-3">
                                <ChatBubbleLeftRightIcon className="h-7 w-7 text-ink-500" />
                            </div>
                            <h2 className="text-base font-semibold text-ink-900">No conversation selected</h2>
                            <p className="text-sm text-ink-500 max-w-xs mt-1">
                                Pick a conversation from the list, or start a new one with a username.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
