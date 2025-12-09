import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase'; // adjust import based on your setup
import { ref, set } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid,preferences } = await request.json();
        const userRef = ref(database, `users/${uid}`);
        const db = database;    
        if (!uid || preferences===undefined) {
            return NextResponse.json(
                { error: 'UID is required or preferences' },
                { status: 400 }
            );
        }

        // Create new user document in Firestore
        await set(userRef, {
                       preferences: preferences || {},
                       createdAt: new Date().toISOString(),
                   });
        console.log('User space created with UID:', uid);
        console.log('Preferences set for user:', preferences);
        console.log('Making calendar for UID:', uid);
        
        // Construir URL absoluta para o fetch server-side
        const baseUrl = request.nextUrl.origin;
        const t = await fetch(`${baseUrl}/api/makeCalendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });
        const data = await t.json();
        console.log('Calendar generation response:', data);

        return NextResponse.json(
            { message: 'User space created successfully', uid },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user space' },
            { status: 500 }
        );
    }
}