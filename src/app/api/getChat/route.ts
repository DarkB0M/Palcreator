import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid, chatId } = await request.json();
        console.log("/api/getChat: received", { uid, chatId });
        
        if (!uid || !chatId) {
            console.warn('/api/getChat: missing uid or chatId', { uid, chatId });
            return NextResponse.json(
                { error: 'UID and chatId are required' },
                { status: 400 }
            );
        }

        const userRef = ref(database, `users/${uid}/chats/${chatId}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const chat = snapshot.val();
            console.log('/api/getChat: found chat', { uid, chatId, messagesCount: chat?.messages?.length });
            return NextResponse.json({ 
                chat: {
                    ...chat,
                    id: chatId
                }
            }, { status: 200 });
        } else {
            console.warn('/api/getChat: chat not found', { uid, chatId });
            return NextResponse.json(
                { error: 'Chat not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: 'Failed to get chat' }, { status: 500 });
    }
}