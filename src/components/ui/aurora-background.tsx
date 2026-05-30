'use client';

import React, { ReactNode } from 'react';

// Aurora Background — drifting colored-blob variant from 21st.dev,
// tuned to this project's blue/cyan/indigo palette. Self-contained:
// the animation is driven by injected @keyframes so it reliably moves
// (no dependency on Tailwind utility registration or blend modes).
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

export const AuroraBackground = ({
    className,
    children,
    ...props
}: AuroraBackgroundProps) => {
    return (
        <div
            className={['relative overflow-hidden', className ?? ''].join(' ')}
            {...props}
        >
            <style>{`
        @keyframes cc-aurora-1 {
          0%   { transform: translate(-10%, -10%) scale(1); }
          33%  { transform: translate(20%, 5%) scale(1.25); }
          66%  { transform: translate(-15%, 15%) scale(0.9); }
          100% { transform: translate(-10%, -10%) scale(1); }
        }
        @keyframes cc-aurora-2 {
          0%   { transform: translate(10%, -5%) scale(1); }
          33%  { transform: translate(-20%, 10%) scale(1.15); }
          66%  { transform: translate(15%, -15%) scale(1.3); }
          100% { transform: translate(10%, -5%) scale(1); }
        }
        @keyframes cc-aurora-3 {
          0%   { transform: translate(0%, 0%) scale(1); }
          50%  { transform: translate(12%, 12%) scale(1.2); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
      `}</style>

            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div
                    className="absolute -top-24 left-[15%] h-72 w-72 rounded-full blur-3xl"
                    style={{
                        background: '#60a5fa',
                        opacity: 0.45,
                        animation: 'cc-aurora-1 16s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute -top-16 right-[15%] h-72 w-72 rounded-full blur-3xl"
                    style={{
                        background: '#22d3ee',
                        opacity: 0.4,
                        animation: 'cc-aurora-2 20s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
                    style={{
                        background: '#818cf8',
                        opacity: 0.35,
                        animation: 'cc-aurora-3 18s ease-in-out infinite',
                    }}
                />
            </div>

            <div className="relative z-10">{children}</div>
        </div>
    );
};
