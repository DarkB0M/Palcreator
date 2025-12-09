import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();
        const userRef = ref(database, `users/${uid}`);
          
        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            );
        }

        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Retornar apenas os dados do calendário
            return NextResponse.json({
                calendar: data.calendar || [],
                calendarExpires: data.calendarExpires || null
            }, { status: 200 });
        } else {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calendar' },
            { status: 500 }
        );
    }
}