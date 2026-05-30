'use client';

import { useEffect, useState } from 'react';
import TmuMap from '@/components/RenderTmuBuildings';
import UtmMap from '@/components/RenderUtmBuildings';
import { createClient } from '@/utils/supabase/client';
import SchoolSelector from '@/components/SchoolSelector';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Counter } from '@/components/ui/animated-counter';

type Post = {
    id: string;
    title: string;
    location: string;
    post_type: 'lost' | 'found';
    campus: string;
};

const CAMPUS_NAMES = ['TMU', 'UTM'] as const;

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [campusIndex, setCampusIndex] = useState(0);

    const fetchPosts = async (campus: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('posts')
            .select('id, title, location, post_type, campus')
            .eq('campus', campus);

        if (!error && data) {
            setPosts(data);
        } else if (error) {
            console.error('Failed to fetch posts:', error);
        }
    };

    useEffect(() => {
        fetchPosts(CAMPUS_NAMES[campusIndex]);
    }, [campusIndex]);

    const lostCount = posts.filter((p) => p.post_type === 'lost').length;
    const foundCount = posts.filter((p) => p.post_type === 'found').length;

    const SelectedMap =
        CAMPUS_NAMES[campusIndex] !== 'UTM' ? <TmuMap posts={posts} /> : <UtmMap posts={posts} />;

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
            {/* Hero (page-wide aurora lives behind everything via layout) */}
            <section className="text-center mb-6 sm:mb-8 py-6 sm:py-10">
                <h1 className="cc-gradient-text text-3xl sm:text-4xl font-bold tracking-tight">
                    Find what&apos;s lost. Return what&apos;s found.
                </h1>
                <p className="mt-2 text-ink-700 max-w-xl mx-auto text-sm sm:text-base">
                    Browse the live campus map, post a missing item, and connect with whoever has it.
                </p>
            </section>

            {/* Selector */}
            <div className="mb-5">
                <SchoolSelector onChange={setCampusIndex} />
            </div>

            {/* Live counts */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="cc-chip cc-chip-lost">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger-600" />
                    <Counter end={lostCount} fontSize={12} className="!font-semibold text-current" /> lost
                </span>
                <span className="cc-chip cc-chip-found">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
                    <Counter end={foundCount} fontSize={12} className="!font-semibold text-current" /> found
                </span>
                <span className="text-ink-500">
                    on {CAMPUS_NAMES[campusIndex]}
                </span>
            </div>

            {/* Map */}
            <div className="cc-card cc-hover-lift overflow-hidden">{SelectedMap}</div>

            {/* CTA bar */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                    href="/create"
                    className="cc-btn cc-btn-primary cc-shimmer w-full !h-12 text-base"
                >
                    <PlusIcon className="h-5 w-5" />
                    Post a lost or found item
                </Link>
                <Link
                    href="/explore"
                    className="cc-btn cc-btn-ghost w-full !h-12 text-base"
                >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    Browse all posts
                </Link>
            </div>
        </div>
    );
}
