'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function GalleryImg(props: { images: string[] | null; preview: boolean }) {
    const [imgIndex, setImgIndex] = useState<number>(0);
    const { images, preview } = props;

    const dimensions = preview
        ? { w: 240, h: 220 }
        : { w: 360, h: 320 };

    if (!images || images.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center text-ink-400 bg-surface-muted rounded-lg"
                style={{ width: dimensions.w, height: dimensions.h }}
            >
                <PhotoIcon className="h-10 w-10" />
                <p className="text-xs mt-2">No photo</p>
            </div>
        );
    }

    const len = images.length;
    const image = images[imgIndex];

    const navBtn =
        'inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/95 text-ink-700 shadow-sm border border-line hover:bg-white hover:text-ink-900 transition';

    if (preview) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <Image
                    key={imgIndex}
                    src={image}
                    alt=""
                    width={dimensions.w}
                    height={dimensions.h}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                />
                {len > 1 && (
                    <span className="absolute bottom-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white">
                        {imgIndex + 1} / {len}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <Image
                    key={imgIndex}
                    src={image}
                    alt=""
                    width={dimensions.w}
                    height={dimensions.h}
                    className="rounded-lg object-contain max-w-full h-auto"
                    unoptimized
                />
            </div>

            {len > 1 && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Previous image"
                        className={navBtn}
                        onClick={() => setImgIndex((imgIndex - 1 + len) % len)}
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-ink-500 tabular-nums min-w-[3rem] text-center">
                        {imgIndex + 1} / {len}
                    </span>
                    <button
                        type="button"
                        aria-label="Next image"
                        className={navBtn}
                        onClick={() => setImgIndex((imgIndex + 1) % len)}
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
