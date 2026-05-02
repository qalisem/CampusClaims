'use client';

import { JSX, useEffect, useState } from 'react';
import ChatButton from '@/app/posting/[id]/ChatButton';
import GalleryImg from '@/app/posting/[id]/GalleryImg';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPinIcon,
    CalendarIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export type Post = {
    id: string;
    user: { id: string; username: string };
    post_type: 'lost' | 'found';
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    images: string[] | null;
    created_at: string | null;
};

function Posting({ id: propId, preview = false }: { id?: string; preview?: boolean }): JSX.Element {
    const params = useParams();
    const id = propId ?? (params?.id as string);
    const [post, setPost] = useState<Post | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchPost(id, router).then((data) => {
            if (data) setPost(data);
        });
    }, [id, router]);

    if (!post) {
        if (preview) {
            return (
                <div className="cc-card h-[460px] animate-pulse">
                    <div className="h-2/3 bg-surface-muted rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-surface-muted rounded w-3/4" />
                        <div className="h-3 bg-surface-muted rounded w-full" />
                    </div>
                </div>
            );
        }
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <div className="cc-card p-8 text-center text-ink-500">Loading post…</div>
            </div>
        );
    }

    const chipClass = post.post_type === 'found' ? 'cc-chip-found' : 'cc-chip-lost';

    if (preview) {
        return (
            <article
                className="cc-card h-[460px] flex flex-col overflow-hidden cursor-pointer
                           transition-shadow transition-transform duration-200 ease-out
                           hover:shadow-[0_16px_40px_-12px_rgb(15_23_42_/_0.18)] hover:-translate-y-0.5"
            >
                {/* Image */}
                <div className="relative h-56 bg-surface-muted flex items-center justify-center overflow-hidden">
                    <GalleryImg images={post.images} preview={preview} />
                    <span className={`cc-chip ${chipClass} absolute top-3 left-3 capitalize`}>
                        {post.post_type}
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-4 gap-2 min-h-0">
                    <h3 className="text-base font-semibold text-ink-900 leading-snug line-clamp-2">
                        {post.title}
                    </h3>

                    {post.description && (
                        <p className="text-sm text-ink-500 line-clamp-3">{post.description}</p>
                    )}

                    <div className="mt-auto pt-2 border-t border-line space-y-1.5">
                        {post.location && (
                            <div className="flex items-center gap-1.5 text-xs text-ink-700">
                                <MapPinIcon className="h-3.5 w-3.5 text-ink-400" />
                                <span className="truncate">{post.location}</span>
                            </div>
                        )}
                        {post.event_date && (
                            <div className="flex items-center gap-1.5 text-xs text-ink-700">
                                <CalendarIcon className="h-3.5 w-3.5 text-ink-400" />
                                <span>{post.event_date}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-ink-500">
                            <UserCircleIcon className="h-3.5 w-3.5" />
                            <span>by {post.user.username}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    // Full page
    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
            <article className="cc-card overflow-hidden">
                {/* Header */}
                <header className="px-5 sm:px-7 py-4 border-b border-line flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className={`cc-chip ${chipClass} capitalize shrink-0`}>{post.post_type}</span>
                        <h1 className="text-lg sm:text-xl font-semibold text-ink-900 truncate">
                            {post.title}
                        </h1>
                    </div>
                    <span className="cc-chip cc-chip-info">
                        <UserCircleIcon className="h-3.5 w-3.5" /> {post.user.username}
                    </span>
                </header>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-7">
                    <div className="flex items-center justify-center bg-surface-muted rounded-xl py-4">
                        <GalleryImg images={post.images} preview={preview} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <dl className="space-y-2.5">
                            {post.location && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPinIcon className="h-4 w-4 text-ink-400 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-ink-500 text-xs font-medium uppercase tracking-wide">Location</dt>
                                        <dd className="text-ink-900 font-medium">{post.location}</dd>
                                    </div>
                                </div>
                            )}
                            {post.event_date && (
                                <div className="flex items-start gap-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 text-ink-400 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-ink-500 text-xs font-medium uppercase tracking-wide">Last seen</dt>
                                        <dd className="text-ink-900 font-medium">{post.event_date}</dd>
                                    </div>
                                </div>
                            )}
                        </dl>

                        {post.description && (
                            <div>
                                <h2 className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-1.5">
                                    Description
                                </h2>
                                <p className="text-ink-700 leading-relaxed whitespace-pre-line">
                                    {post.description}
                                </p>
                            </div>
                        )}

                        <div className="mt-2">
                            <ChatButton recipientId={post.user.id} />
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

export async function fetchPost(id: string, router: ReturnType<typeof useRouter>): Promise<Post | null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _g = router;
    const supabase = createClient();
    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            post_type,
            title,
            description,
            location,
            event_date,
            images,
            created_at,
            user:user_id!inner (
                id,
                username
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        if (error) console.error('Error fetching post:', error);
        return null;
    }

    return {
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user,
    } as Post;
}

export default Posting;
