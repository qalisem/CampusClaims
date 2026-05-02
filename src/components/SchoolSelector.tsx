'use client';

import { useState } from 'react';

type Props = {
    onChange: (value: number) => void;
};

const SCHOOLS = [
    { code: 'TMU', name: 'Toronto Metropolitan' },
    { code: 'UTM', name: 'UofT Mississauga' },
];

export default function SchoolSelector({ onChange }: Props) {
    const [index, setIndex] = useState(0);

    const select = (i: number) => {
        setIndex(i);
        onChange(i);
    };

    return (
        <div
            role="tablist"
            aria-label="Select campus"
            className="relative mx-auto w-full max-w-md p-1 rounded-full bg-surface-muted border border-line flex"
        >
            <span
                aria-hidden
                className={[
                    'absolute top-1 bottom-1 left-1 rounded-full bg-brand-600 shadow-sm transition-all duration-200 ease-out',
                    'w-[calc(50%-0.25rem)]',
                    index === 0 ? 'translate-x-0' : 'translate-x-full',
                ].join(' ')}
            />
            {SCHOOLS.map((s, i) => {
                const active = index === i;
                return (
                    <button
                        key={s.code}
                        role="tab"
                        aria-selected={active}
                        onClick={() => select(i)}
                        className={[
                            'relative z-10 flex-1 py-2.5 px-3 rounded-full text-sm font-semibold transition-colors',
                            active ? 'text-white' : 'text-ink-700 hover:text-ink-900',
                        ].join(' ')}
                    >
                        <span className="block leading-tight">{s.code}</span>
                        <span
                            className={[
                                'block text-[11px] font-medium leading-tight',
                                active ? 'text-white/85' : 'text-ink-500',
                            ].join(' ')}
                        >
                            {s.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
