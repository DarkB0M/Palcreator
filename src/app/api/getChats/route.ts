import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();
        console.log('/api/getChats: received', { uid });
        
        if (!uid) {
            console.warn('/api/getChats: missing uid');
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            );
        }

        const chatsRef = ref(database, `users/${uid}/chats`);
        const snapshot = await get(chatsRef);
        
        if (snapshot.exists()) {
            const chatsData = snapshot.val();
            // Converter objeto em array com IDs
            const chats = Object.keys(chatsData).map(chatId => ({
                id: chatId,
                ...chatsData[chatId]
            }));
            
            // Ordenar por timestamp (mais recente primeiro)
            chats.sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return timeB - timeA;
            });
            
            console.log('/api/getChats: returning chats count', { count: chats.length });
            return NextResponse.json({ chats }, { status: 200 });
        } else {
            return NextResponse.json({ chats: [] }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: 'Failed to get chats' }, { status: 500 });
    }
}

