'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MapPinIcon,
    CalendarIcon,
    AcademicCapIcon,
    PencilSquareIcon,
    TrashIcon,
    ChatBubbleLeftRightIcon,
    InboxIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

type Post = {
    id: string;
    title: string;
    description: string;
    location: string;
    event_date: string;
    campus: string;
    images: string[];
    post_type?: 'lost' | 'found';
};

type Conversation = {
    id: string;
    user1_id: string;
    user2_id: string;
};

function urlToPath(url: string) {
    const marker = '/object/public/images/';
    const idx = url.indexOf(marker);
    if (idx === -1) return url;
    const encodedPath = url.slice(idx + marker.length);
    return decodeURIComponent(encodedPath);
}

export default function ProfilePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [usernames, setUsernames] = useState<Record<string, string>>({});
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfileData = async () => {
            const supabase = createClient();
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                router.push('/login');
                return;
            }

            setUserId(user.id);
            setUserEmail(user.email ?? null);

            const { data: userData } = await supabase
                .from('users')
                .select('username')
                .eq('id', user.id)
                .single();
            setUserName(userData?.username ?? null);

            const { data: postData } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id);
            setPosts(postData || []);

            const { data: convoData } = await supabase
                .from('conversations')
                .select('*')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
            setConversations(convoData || []);

            const otherUserIds = new Set<string>();
            convoData?.forEach((c) => {
                const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
                otherUserIds.add(otherId);
            });

            if (otherUserIds.size > 0) {
                const { data: users } = await supabase
                    .from('users')
                    .select('id, username')
                    .in('id', Array.from(otherUserIds));
                const mapping: Record<string, string> = {};
                users?.forEach((u) => (mapping[u.id] = u.username));
                setUsernames(mapping);
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [router]);

    const deletePost = async (id: string) => {
        const supabase = createClient();

        const { data: post, error: fetchErr } = await supabase
            .from('posts')
            .select('images')
            .eq('id', id)
            .single();

        if (fetchErr) {
            console.error('Error fetching post before delete:', fetchErr);
            return;
        }

        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) return;

        if (post?.images?.length) {
            const paths = post.images.map(urlToPath);
            const { error: storageErr } = await supabase.storage.from('images').remove(paths);
            if (storageErr) console.warn('remove() error:', storageErr);
        }

        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10">
                <div className="cc-card p-8 animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-surface-muted rounded" />
                    <div className="h-4 w-72 bg-surface-muted rounded" />
                </div>
            </div>
        );
    }

    const initial = (userName ?? userEmail ?? '?').charAt(0).toUpperCase();

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
            {/* Hero card */}
            <section className="cc-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="grid place-items-center h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-2xl font-bold shrink-0">
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-ink-900 truncate">
                        {userName ?? 'Your profile'}
                    </h1>
                    {userEmail && (
                        <p className="text-sm text-ink-500 truncate">{userEmail}</p>
                    )}
                </div>
                <Link href="/create" className="cc-btn cc-btn-primary !h-10 shrink-0">
                    <PlusIcon className="h-4 w-4" />
                    New post
                </Link>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Conversations */}
                <section aria-labelledby="convs" className="lg:col-span-2 cc-card p-5">
                    <header className="flex items-center justify-between mb-4">
                        <h2 id="convs" className="text-base font-semibold text-ink-900 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-ink-500" />
                            Conversations
                        </h2>
                        <span className="text-xs font-medium text-ink-500">
                            {conversations.length}
                        </span>
                    </header>

                    {conversations.length === 0 ? (
                        <div className="text-center py-10 text-ink-500">
                            <InboxIcon className="h-8 w-8 mx-auto text-ink-400 mb-2" />
                            <p className="text-sm">No conversations yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {conversations.map((c) => {
                                const other = c.user1_id === userId ? c.user2_id : c.user1_id;
                                const name = usernames[other] ?? 'Unknown';
                                return (
                                    <li key={c.id}>
                                        <Link
                                            href={`/chat/${c.id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-line hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
                                        >
                                            <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold">
                                                {name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-ink-900 truncate">{name}</p>
                                                <p className="text-xs text-ink-500">Open chat →</p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Posts */}
                <section aria-labelledby="posts" className="lg:col-span-3 cc-card p-5">
                    <header className="flex items-center justify-between mb-4">
                        <h2 id="posts" className="text-base font-semibold text-ink-900">
                            Your posts
                        </h2>
                        <span className="text-xs font-medium text-ink-500">{posts.length}</span>
                    </header>

                    {posts.length === 0 ? (
                        <div className="text-center py-10">
                            <InboxIcon className="h-8 w-8 mx-auto text-ink-400 mb-2" />
                            <p className="text-sm text-ink-500 mb-3">You haven&apos;t posted anything yet.</p>
                            <Link href="/create" className="cc-btn cc-btn-primary !h-10 inline-flex">
                                <PlusIcon className="h-4 w-4" />
                                Create your first post
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {posts.map((post) => (
                                <li
                                    key={post.id}
                                    className="group relative flex gap-3 p-3 rounded-lg border border-line hover:border-brand-200 hover:bg-surface-muted/60 transition-colors"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-20 w-20 shrink-0 rounded-lg bg-surface-muted overflow-hidden">
                                        {post.images?.[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={post.images[0]}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full grid place-items-center text-ink-400 text-xs">
                                                No photo
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <Link href={`/posting/${post.id}`} className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {post.post_type && (
                                                <span
                                                    className={`cc-chip ${
                                                        post.post_type === 'found'
                                                            ? 'cc-chip-found'
                                                            : 'cc-chip-lost'
                                                    }`}
                                                >
                                                    {post.post_type}
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-sm text-ink-900 truncate">
                                                {post.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPinIcon className="h-3.5 w-3.5" /> {post.location}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarIcon className="h-3.5 w-3.5" /> {post.event_date}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <AcademicCapIcon className="h-3.5 w-3.5" /> {post.campus}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Actions — always visible */}
                                    <div className="flex flex-col gap-1.5 shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/edit/${post.id}`);
                                            }}
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-ink-700 border border-line hover:bg-surface-muted"
                                            aria-label="Edit post"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this post? This cannot be undone.')) {
                                                    await deletePost(post.id);
                                                }
                                            }}
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-danger-600 border border-danger-100 hover:bg-danger-50"
                                            aria-label="Delete post"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
