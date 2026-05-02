'use client';
import { JSX, useEffect, useState } from 'react';
import Filter from '@/components/Filter';
import { MagnifyingGlassIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import Posting from '@/app/posting/[id]/page';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Explore(): JSX.Element {
    const [filter, setFilter] = useState<'lost' | 'found'>('lost');
    const [campus, setCampus] = useState<string>('');
    const [posts, setPosts] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchPosts(filter, campus, search).then((data) => {
            if (!cancelled) {
                setPosts(data);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [filter, campus, search]);

    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        // value already drives the effect via state
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">Explore posts</h1>
                <p className="text-sm text-ink-500 mt-1">
                    Search lost and found items across campuses.
                </p>
            </header>

            {/* Controls */}
            <section className="cc-card p-4 sm:p-5 mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    {/* Campus */}
                    <div className="sm:w-56">
                        <label htmlFor="campus" className="cc-label">Campus</label>
                        <select
                            id="campus"
                            value={campus}
                            onChange={(e) => setCampus(e.target.value)}
                            className="cc-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2364748b%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-[right_0.625rem_center] bg-no-repeat pr-9"
                        >
                            <option value="">All campuses</option>
                            <option value="TMU">Toronto Metropolitan (TMU)</option>
                            <option value="UTM">UofT Mississauga (UTM)</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <label htmlFor="search" className="cc-label">Search</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                            <input
                                id="search"
                                type="text"
                                placeholder="Try “black backpack”, “airpods”…"
                                className="cc-input pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyUp={handleSearchSubmit}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex justify-center">
                    <Filter onChange={(v) => setFilter(v)} initial={filter} />
                </div>
            </section>

            {/* Results */}
            {loading ? (
                <ResultsSkeleton />
            ) : posts.length === 0 ? (
                <EmptyState query={search} type={filter} />
            ) : (
                <section
                    aria-label="Results"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                >
                    {posts.map((id) => (
                        <Link key={id} href={'/posting/' + id} className="block">
                            <Posting id={id} preview />
                        </Link>
                    ))}
                </section>
            )}
        </div>
    );
}

function ResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cc-card h-[460px] animate-pulse">
                    <div className="h-2/3 bg-surface-muted rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-surface-muted rounded w-3/4" />
                        <div className="h-3 bg-surface-muted rounded w-full" />
                        <div className="h-3 bg-surface-muted rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ query, type }: { query: string; type: 'lost' | 'found' }) {
    return (
        <div className="cc-card flex flex-col items-center text-center py-14 px-6">
            <div className="grid place-items-center h-12 w-12 rounded-full bg-surface-muted mb-3">
                <FaceFrownIcon className="h-6 w-6 text-ink-500" />
            </div>
            <h2 className="text-lg font-semibold text-ink-900">No {type} posts yet</h2>
            <p className="text-sm text-ink-500 mt-1 max-w-sm">
                {query
                    ? `Nothing matches “${query}”. Try a different keyword or clear your search.`
                    : 'Try a different campus or filter — or be the first to post.'}
            </p>
        </div>
    );
}

async function fetchPosts(post_type: string, campus: string, item?: string): Promise<string[]> {
    const VALID_CAMPUSES = ['TMU', 'UTM'] as const;
    const supabase = createClient();

    let query = supabase
        .from('posts')
        .select('id')
        .eq('post_type', post_type);

    if (item) {
        query = query.ilike('title', `%${item}%`);
    }

    if (VALID_CAMPUSES.includes(campus as typeof VALID_CAMPUSES[number])) {
        query = query.eq('campus', campus);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }

    return data.map((post) => post.id);
}
