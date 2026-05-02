'use client';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, JSX } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Posting from '@/app/posting/[id]/page';
import { CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function RecommendationPage(): JSX.Element {
    const params = useParams();
    const id = params?.id as string;
    if (!id) throw new Error('ID is required');

    const [posts, setPosts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchPosts(id).then((data) => {
            if (!cancelled) {
                setPosts(data);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
            {/* Success banner */}
            <section className="cc-card flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 mb-8 border-success-100 bg-success-50/40">
                <span className="grid place-items-center h-10 w-10 rounded-full bg-success-100 text-success-700 shrink-0">
                    <CheckCircleIcon className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-ink-900">Your post is live!</h1>
                    <p className="text-sm text-ink-500">
                        We searched for matches across the same campus. Check the suggestions below.
                    </p>
                </div>
                <Link href={`/posting/${id}`} className="cc-btn cc-btn-ghost !h-10 shrink-0">
                    View my post
                </Link>
            </section>

            <header className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-ink-900">Recommended matches</h2>
                <p className="text-sm text-ink-500 mt-1">
                    Posts on the same campus that look like the same item.
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="cc-card h-[460px] animate-pulse">
                            <div className="h-2/3 bg-surface-muted rounded-t-2xl" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-surface-muted rounded w-3/4" />
                                <div className="h-3 bg-surface-muted rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="cc-card flex flex-col items-center text-center py-14 px-6">
                    <div className="grid place-items-center h-12 w-12 rounded-full bg-surface-muted mb-3">
                        <MagnifyingGlassIcon className="h-6 w-6 text-ink-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-ink-900">No matches yet</h3>
                    <p className="text-sm text-ink-500 mt-1 max-w-sm">
                        We&apos;ll keep an eye out — check back later or browse all posts.
                    </p>
                    <Link href="/explore" className="cc-btn cc-btn-primary !h-10 mt-4">
                        Browse all posts
                    </Link>
                </div>
            ) : (
                <section className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((postId) => (
                        <Link key={postId} href={`/posting/${postId}`} className="block">
                            <Posting id={postId} preview />
                        </Link>
                    ))}
                </section>
            )}
        </main>
    );
}

async function fetchPosts(id: string): Promise<string[]> {
    const supabase = createClient();

    const { data: post, error: postError } = await supabase
        .from('posts')
        .select('post_type, title, campus')
        .eq('id', id)
        .single();

    if (postError || !post) {
        console.error('Failed to fetch original post:', postError || 'Not found');
        return [];
    }

    const { post_type, title, campus } = post;

    const { data, error } = await supabase
        .from('posts')
        .select('id')
        .neq('post_type', post_type)
        .eq('campus', campus)
        .eq('title', title)
        .limit(3);

    if (error || !data) {
        console.error('Failed to fetch recommendations:', error || 'None found');
        return [];
    }

    return data.map((p) => p.id);
}
