'use client';

import * as React from 'react';

import { MotionValue, motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Animated Counter — from 21st.dev. Rolling-digit (odometer) number animation.
const cn = (...args: clsx.ClassValue[]) => {
    return twMerge(clsx(args));
};

const padding = 6;

interface CounterProps
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
    > {
    start?: number;
    end: number;
    duration?: number;
    className?: string;
    fontSize?: number;
}

export const Counter = ({
    start = 0,
    end,
    duration = 1,
    className,
    fontSize = 30,
    ...rest
}: CounterProps) => {
    const [value, setValue] = useState(start);

    useEffect(() => {
        if (end <= start) {
            setValue(end);
            return;
        }
        const stepMs = (duration / (end - start)) * 1000;
        const interval = setInterval(() => {
            setValue((prev) => {
                if (prev >= end) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, stepMs);

        return () => clearInterval(interval);
    }, [start, end, duration]);

    const height = fontSize + padding;

    return (
        <div
            style={{ fontSize }}
            {...rest}
            className={cn('flex overflow-hidden leading-none font-bold', className)}
        >
            {value >= 100 && <Digit place={100} value={value} height={height} />}
            {value >= 10 && <Digit place={10} value={value} height={height} />}
            <Digit place={1} value={value} height={height} />
        </div>
    );
};

function Digit({
    place,
    value,
    height,
}: {
    place: number;
    value: number;
    height: number;
}) {
    const valueRoundedToPlace = Math.floor(value / place);
    const animatedValue = useSpring(valueRoundedToPlace);

    useEffect(() => {
        animatedValue.set(valueRoundedToPlace);
    }, [animatedValue, valueRoundedToPlace]);

    return (
        <div style={{ height }} className="relative w-[1ch] tabular-nums">
            {[...Array(10)].map((_, i) => (
                <Number key={i} mv={animatedValue} number={i} height={height} />
            ))}
        </div>
    );
}

function Number({
    mv,
    number,
    height,
}: {
    mv: MotionValue;
    number: number;
    height: number;
}) {
    const y = useTransform(mv, (latest) => {
        const placeValue = latest % 10;
        const offset = (10 + number - placeValue) % 10;

        let memo = offset * height;

        if (offset > 5) {
            memo -= 10 * height;
        }

        return memo;
    });

    return (
        <motion.span
            style={{ y }}
            className="absolute inset-0 flex items-center justify-center"
        >
            {number}
        </motion.span>
    );
}
