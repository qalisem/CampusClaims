'use client';
import { useState } from 'react';
import Image from 'next/image';
import logo from '@/../public/logo.png';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        setSubmitting(false);
        if (signInError) {
            setError("That email and password didn't match. Try again.");
            return;
        }
        router.push('/explore');
    };

    return (
        <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-10">
            <div className="cc-card w-full max-w-md p-8 sm:p-10">
                <div className="flex justify-center mb-5">
                    <Image src={logo} alt="" width={84} height={84} priority />
                </div>
                <h1 className="text-2xl font-bold text-center text-ink-900">Welcome back</h1>
                <p className="text-center text-sm text-ink-500 mt-1 mb-6">
                    Log in to your CampusClaims account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="cc-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="cc-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="cc-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="cc-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-lg px-3 py-2"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="cc-btn cc-btn-primary w-full !h-11"
                    >
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
