'use client';
import Image from 'next/image';
import logo from '@/../public/logo.png';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (!username.trim()) {
            setError('Please choose a username.');
            return;
        }

        setSubmitting(true);
        const supabase = createClient();
        const { data, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username: username.trim() } },
        });

        setSubmitting(false);

        if (signUpErr || !data?.user) {
            setError(signUpErr?.message ?? 'Could not sign you up. Please try again.');
            return;
        }

        // The public.users profile row is created automatically by the
        // on_auth_user_created database trigger (see migration 00002).
        alert('Sign-up successful!');
        router.push('/');
    };

    return (
        <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-10">
            <div className="cc-card w-full max-w-md p-8 sm:p-10">
                <div className="flex justify-center mb-5">
                    <Image src={logo} alt="" width={84} height={84} priority />
                </div>
                <h1 className="text-2xl font-bold text-center text-ink-900">Create your account</h1>
                <p className="text-center text-sm text-ink-500 mt-1 mb-6">
                    Join CampusClaims and reunite with your stuff.
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
                        <label htmlFor="username" className="cc-label">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            required
                            className="cc-input"
                            placeholder="markiplier"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="cc-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="cc-input"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm" className="cc-label">Confirm password</label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="cc-input"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {submitting ? 'Creating account…' : 'Sign up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
