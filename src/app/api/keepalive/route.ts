import { NextResponse } from 'next/server';

// Keeps the Supabase free-tier project from pausing after 7 days of
// inactivity. Triggered daily by a Vercel Cron job (see vercel.json).
// Unlike a GitHub Actions cron, a Vercel Cron is tied to the deployment,
// not to repo commit activity, so it is never auto-disabled for inactivity.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    // When CRON_SECRET is set, Vercel Cron sends it as a Bearer token.
    // Reject anything else so the endpoint can't be spammed publicly.
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const auth = request.headers.get('authorization');
        if (auth !== `Bearer ${secret}`) {
            return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
        }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        return NextResponse.json(
            { ok: false, error: 'Supabase env vars missing' },
            { status: 500 },
        );
    }

    // One trivial read marks the database as active for the day.
    const res = await fetch(`${url}/rest/v1/posts?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        return NextResponse.json(
            { ok: false, status: res.status },
            { status: 502 },
        );
    }

    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
