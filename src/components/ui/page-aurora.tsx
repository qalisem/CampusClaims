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
                className="absolute top-0 left-0 h-[42vw] w-[42vw] rounded-full blur-[80px]"
                style={orb('#3b82f6', 0.62, '', 'pa-1', '13s')}
            />
            <div
                className="absolute top-0 left-0 h-[38vw] w-[38vw] rounded-full blur-[80px]"
                style={orb('#06b6d4', 0.58, '', 'pa-2', '16s')}
            />
            <div
                className="absolute top-0 left-0 h-[40vw] w-[40vw] rounded-full blur-[80px]"
                style={orb('#8b5cf6', 0.55, '', 'pa-3', '14s')}
            />
            <div
                className="absolute top-0 left-0 h-[34vw] w-[34vw] rounded-full blur-[80px]"
                style={orb('#6366f1', 0.5, '', 'pa-4', '18s')}
            />
        </div>
    );
}
