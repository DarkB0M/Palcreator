import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const { uid, usernames } = await request.json();
        console.log('/api/saveUsernames: received', { uid, usernames });

        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            );
        }

        if (!usernames || (typeof usernames !== 'object')) {
            return NextResponse.json(
                { error: 'Usernames object is required' },
                { status: 400 }
            );
        }

        const viewsRef = ref(database, `users/${uid}/views`);
        await set(viewsRef, usernames);

        console.log('/api/saveUsernames: saved', { uid });
        return NextResponse.json({ message: 'Usernames saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('/api/saveUsernames error', error);
        return NextResponse.json(
            { error: 'Failed to save usernames', details: String(error) },
            { status: 500 }
        );
    }
}

