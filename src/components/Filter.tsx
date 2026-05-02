'use client';

import { JSX, useState } from 'react';

type FilterProps = {
    onChange: (value: 'lost' | 'found') => void;
    initial?: 'lost' | 'found';
};

export default function Filter({ onChange, initial = 'lost' }: FilterProps): JSX.Element {
    const [filter, setFilter] = useState<'lost' | 'found'>(initial);

    const select = (value: 'lost' | 'found') => {
        setFilter(value);
        onChange(value);
    };

    const base =
        'relative z-10 flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none';
    const active = 'text-white';
    const idle = 'text-ink-700 hover:text-ink-900';

    return (
        <div
            role="tablist"
            aria-label="Post type"
            className="relative inline-flex items-center w-full max-w-xs p-1 rounded-full bg-surface-muted border border-line"
        >
            <span
                aria-hidden
                className={[
                    'absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-all duration-200 ease-out shadow-sm',
                    filter === 'lost' ? 'bg-danger-600 translate-x-0' : 'bg-success-600 translate-x-full',
                ].join(' ')}
            />

            <button
                role="tab"
                aria-selected={filter === 'lost'}
                className={`${base} ${filter === 'lost' ? active : idle}`}
                onClick={() => select('lost')}
                type="button"
            >
                Lost
            </button>
            <button
                role="tab"
                aria-selected={filter === 'found'}
                className={`${base} ${filter === 'found' ? active : idle}`}
                onClick={() => select('found')}
                type="button"
            >
                Found
            </button>
        </div>
    );
}
