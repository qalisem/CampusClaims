'use client';

import React, { ReactNode } from 'react';

// Aurora Background — drifting colored-orb variant (21st.dev style),
// tuned to this project's blue/cyan/indigo palette. Orbs are distinct,
// travel a large distance, and the whole field is radially masked so the
// edges fade out instead of looking like a clipped rectangle.
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

export const AuroraBackground = ({
    className,
    children,
    ...props
}: AuroraBackgroundProps) => {
    const maskStyle = {
        maskImage:
            'radial-gradient(ellipse 75% 90% at 50% 35%, black 35%, transparent 72%)',
        WebkitMaskImage:
            'radial-gradient(ellipse 75% 90% at 50% 35%, black 35%, transparent 72%)',
    } as React.CSSProperties;

    return (
        <div
            className={['relative overflow-hidden', className ?? ''].join(' ')}
            {...props}
        >
            <style>{`
        @keyframes cc-aurora-1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50%      { transform: translate(75%, 20%) scale(1.35); }
        }
        @keyframes cc-aurora-2 {
          0%, 100% { transform: translate(0%, 0%) scale(1.1); }
          50%      { transform: translate(-70%, -15%) scale(0.85); }
        }
        @keyframes cc-aurora-3 {
          0%, 100% { transform: translate(0%, 0%) scale(0.9); }
          50%      { transform: translate(55%, -25%) scale(1.25); }
        }
        @keyframes cc-aurora-4 {
          0%, 100% { transform: translate(0%, 0%) scale(1.15); }
          50%      { transform: translate(-50%, 25%) scale(0.95); }
        }
      `}</style>

            <div
                className="pointer-events-none absolute inset-0"
                style={maskStyle}
                aria-hidden="true"
            >
                <div
                    className="absolute top-2 left-[18%] h-48 w-48 rounded-full blur-[44px]"
                    style={{
                        background: '#3b82f6',
                        opacity: 0.6,
                        animation: 'cc-aurora-1 12s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute top-6 left-[42%] h-44 w-44 rounded-full blur-[44px]"
                    style={{
                        background: '#22d3ee',
                        opacity: 0.55,
                        animation: 'cc-aurora-2 10s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute top-0 left-[64%] h-52 w-52 rounded-full blur-[44px]"
                    style={{
                        background: '#8b5cf6',
                        opacity: 0.5,
                        animation: 'cc-aurora-3 14s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute top-10 left-[30%] h-40 w-40 rounded-full blur-[44px]"
                    style={{
                        background: '#6366f1',
                        opacity: 0.45,
                        animation: 'cc-aurora-4 11s ease-in-out infinite',
                    }}
                />
            </div>

            <div className="relative z-10">{children}</div>
        </div>
    );
};
