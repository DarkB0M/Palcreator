import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid,  } = await request.json();
        console.log("/api/get: received", { uid });
        
        if (!uid) {
            console.warn('/api/getUsernames: missing uid ', { uid });
            return NextResponse.json(
                { error: 'UID and chatId are required' },
                { status: 400 }
            );
        }

        const userRef = ref(database, `users/${uid}/views`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const usernames = snapshot.val();
            
            // Verificar se o objeto tem pelo menos um username configurado
            if (usernames && typeof usernames === 'object' && Object.keys(usernames).length > 0) {
                return NextResponse.json({ usernames }, { status: 200 });
            } else {
                // Objeto vazio ou inválido - retornar 404
                console.warn('/api/getUsernames: user has no valid configurations', { uid });
                return NextResponse.json({ error: 'No usernames configured' }, { status: 404 });
            }
        } else {
            console.warn('/api/getUsernames: the user has no configurations', { uid });
            return NextResponse.json({ error: 'No usernames configured' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching usernames:', error);
        return NextResponse.json({ error: 'Failed to get usernames' }, { status: 500 });
    }
}