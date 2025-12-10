import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update, remove } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            );
        }

        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remover calendário antigo
        const calendarRef = ref(database, `users/${uid}/calendar`);
        const calendarExpiresRef = ref(database, `users/${uid}/calendarExpires`);
        
        await remove(calendarRef);
        await remove(calendarExpiresRef);

        console.log('Calendar excluded for user:', uid);

        // Construir URL absoluta para o fetch server-side
        const baseUrl = request.nextUrl.origin;
        
        // Gerar novo calendário
        const makeCalendarResponse = await fetch(`${baseUrl}/api/makeCalendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });

        const makeCalendarData = await makeCalendarResponse.json();

        if (!makeCalendarResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to generate new calendar', details: makeCalendarData.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Calendar excluded and new calendar generated successfully',
            calendar: makeCalendarData
        }, { status: 200 });

    } catch (error) {
        console.error('Error excluding calendar:', error);
        return NextResponse.json(
            { error: 'Failed to exclude calendar', details: String(error) },
            { status: 500 }
        );
    }
}

