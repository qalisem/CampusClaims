'use client';

import React from 'react';

// Full-viewport animated aurora. Sits fixed behind ALL page content
// (-z-10) and drifts large colored orbs across the entire screen using
// vw/vh translation so the whole page feels alive, not just a hero box.
export default function PageAurora() {
    const orb = (
        color: string,
        opacity: number,
        size: string,
        anim: string,
        duration: string,
    ): React.CSSProperties => ({
        background: color,
        opacity,
        animation: `${anim} ${duration} ease-in-out infinite`,
        willChange: 'transform',
    });

    return (
        <div
            className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            <style>{`
        @keyframes pa-1 {
          0%, 100% { transform: translate(-12vw, -12vh) scale(1); }
          50%      { transform: translate(42vw, 26vh) scale(1.35); }
        }
        @keyframes pa-2 {
          0%, 100% { transform: translate(62vw, -8vh) scale(1.1); }
          50%      { transform: translate(8vw, 30vh) scale(0.9); }
        }
        @keyframes pa-3 {
          0%, 100% { transform: translate(18vw, 68vh) scale(1); }
          50%      { transform: translate(58vw, 38vh) scale(1.3); }
        }
        @keyframes pa-4 {
          0%, 100% { transform: translate(72vw, 58vh) scale(1.05); }
          50%      { transform: translate(28vw, 82vh) scale(0.85); }
        }
      `}</style>

            <div
                className="absolute top-0 left-0 h-[46vw] w-[46vw] rounded-full blur-[90px]"
                style={orb('#60a5fa', 0.5, '', 'pa-1', '22s')}
            />
            <div
                className="absolute top-0 left-0 h-[40vw] w-[40vw] rounded-full blur-[90px]"
                style={orb('#22d3ee', 0.45, '', 'pa-2', '27s')}
            />
            <div
                className="absolute top-0 left-0 h-[44vw] w-[44vw] rounded-full blur-[90px]"
                style={orb('#a78bfa', 0.42, '', 'pa-3', '24s')}
            />
            <div
                className="absolute top-0 left-0 h-[38vw] w-[38vw] rounded-full blur-[90px]"
                style={orb('#818cf8', 0.4, '', 'pa-4', '30s')}
            />
        </div>
    );
}
