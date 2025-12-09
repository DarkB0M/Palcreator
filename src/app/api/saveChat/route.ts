import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid, chatId, messages, title } = await request.json();
        console.log('/api/saveChat: received', { uid, chatId, messagesCount: messages?.length, title });

        if (!uid || !chatId) {
            console.warn('/api/saveChat: missing uid or chatId', { uid, chatId });
            return NextResponse.json({ error: 'UID and chatId are required' }, { status: 400 });
        }

        const userRef = ref(database, `users/${uid}/chats/${chatId}`);
        await set(userRef, {
            id: chatId,
            title: title || 'Sem título',
            timestamp: new Date().toISOString(),
            messages: messages || []
        });

        console.log('/api/saveChat: saved', { uid, chatId });
        return NextResponse.json({ message: 'Chat saved' }, { status: 200 });
    } catch (error) {
        console.error('/api/saveChat error', error);
        return NextResponse.json({ error: 'Failed to save chat', details: String(error) }, { status: 500 });
    }
}
