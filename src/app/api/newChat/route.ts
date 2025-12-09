import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { uid, chat } = await request.json();
        console.log("/api/newChat: received", { uid, chatSummary: { title: chat?.title, messagesCount: chat?.messages?.length } });
        
        if (!uid || !chat) {
            return NextResponse.json(
                { error: 'UID and chat are required' },
                { status: 400 }
            );
        }

        const chatId = randomUUID();
        const userRef = ref(database, `users/${uid}/chats/${chatId}`);
        
        await set(userRef, {
            ...chat,
            id: chatId,
            timestamp: chat.timestamp || new Date().toISOString()
        });
        console.log("/api/newChat: saved chat", { uid, chatId });
        return NextResponse.json({ 
            message: 'Chat created successfully',
            chatId: chatId
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }
}