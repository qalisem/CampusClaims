'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import convoMaker from '@/utils/ConvoMaker';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatButton({ recipientId }: { recipientId: string }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        fetchUser();
    }, []);

    const isOwnPost = currentUserId === recipientId;
    const notLoggedIn = !currentUserId;

    const handleChat = async () => {
        if (notLoggedIn) {
            router.push('/login');
            return;
        }
        if (isOwnPost) return;
        setBusy(true);
        const convo = await convoMaker(currentUserId, recipientId);
        setBusy(false);
        if (convo && convo.id) {
            router.push(`/chat/${convo.id}`);
        } else {
            alert('Failed to create or retrieve conversation.');
        }
    };

    return (
        <button
            type="button"
            onClick={handleChat}
            disabled={isOwnPost || busy}
            className="cc-btn cc-btn-primary !h-11 w-full sm:w-auto"
            title={isOwnPost ? "This is your own post" : undefined}
        >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            {isOwnPost ? 'Your post' : busy ? 'Opening…' : notLoggedIn ? 'Log in to message' : 'Message poster'}
        </button>
    );
}
