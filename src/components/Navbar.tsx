'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import logo from '/public/logo-w.png';
import {
    Bars3Icon,
    XMarkIcon,
    MapIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    requiresAuth?: boolean;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Map',      href: '/',        icon: MapIcon },
    { label: 'Explore',  href: '/explore', icon: MagnifyingGlassIcon },
    { label: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, requiresAuth: true },
    { label: 'Profile',  href: '/profile',  icon: UserCircleIcon, requiresAuth: true },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
            setAuthChecked(true);
        };
        checkUser();
    }, [pathname]);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        setMenuOpen(false);
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
            return;
        }
        setIsLoggedIn(false);
        router.push('/');
    };

    const visibleItems = NAV_ITEMS.filter((it) => !it.requiresAuth || isLoggedIn);

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname?.startsWith(href);

    return (
        <header className="sticky top-0 z-40 w-full">
            <div className="cc-glass border-b border-white/40">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="CampusClaims home">
                        <span className="grid place-items-center h-9 w-9 rounded-xl bg-brand-600 shadow-sm">
                            <Image src={logo} alt="" width={22} height={22} priority />
                        </span>
                        <span className="font-semibold tracking-tight text-ink-900 text-lg hidden sm:inline">
                            CampusClaims
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
                        {visibleItems.map(({ label, href, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={[
                                        'inline-flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-ink-700 hover:bg-white/70 hover:text-ink-900',
                                    ].join(' ')}
                                >
                                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right cluster */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/create"
                            className="cc-btn cc-btn-primary !h-10 !px-3 sm:!px-4"
                        >
                            <PlusIcon className="h-4 w-4" width={16} height={16} />
                            <span className="hidden sm:inline">New post</span>
                            <span className="sm:hidden">Post</span>
                        </Link>

                        {authChecked && !isLoggedIn && (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex cc-btn cc-btn-ghost !h-10"
                            >
                                Log in
                            </Link>
                        )}

                        {authChecked && isLoggedIn && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden md:inline-flex cc-btn cc-btn-ghost !h-10"
                                aria-label="Log out"
                            >
                                <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" aria-hidden />
                                <span className="hidden lg:inline">Log out</span>
                            </button>
                        )}

                        {/* Mobile menu trigger */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-ink-700 hover:bg-white/70"
                            aria-expanded={menuOpen}
                            aria-controls="primary-mobile-menu"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {menuOpen
                                ? <XMarkIcon className="h-6 w-6" width={24} height={24} />
                                : <Bars3Icon className="h-6 w-6" width={24} height={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div
                        ref={menuRef}
                        id="primary-mobile-menu"
                        className="md:hidden border-t border-white/40 bg-white/85 backdrop-blur"
                    >
                        <nav className="px-3 py-2 flex flex-col" aria-label="Primary mobile">
                            {visibleItems.map(({ label, href, icon: Icon }) => {
                                const active = isActive(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={[
                                            'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium',
                                            active
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-ink-700 hover:bg-surface-muted',
                                        ].join(' ')}
                                    >
                                        <Icon className="h-5 w-5" width={20} height={20} aria-hidden />
                                        {label}
                                    </Link>
                                );
                            })}

                            <div className="my-2 h-px bg-line" />

                            {authChecked && !isLoggedIn ? (
                                <>
                                    <Link href="/login" className="cc-btn cc-btn-ghost mb-2">Log in</Link>
                                    <Link href="/signup" className="cc-btn cc-btn-primary">Sign up</Link>
                                </>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="cc-btn cc-btn-ghost justify-start !px-3"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" width={20} height={20} />
                                    Log out
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
