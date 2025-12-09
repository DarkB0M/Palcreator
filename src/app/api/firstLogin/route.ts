"use server"
import { app, database } from '@/lib/firebase';
import { NextResponse } from 'next/server';
import { ref, get, set } from 'firebase/database';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId, userData } = await request.json();

        const userRef = ref(database, `users/${userId}`);
        const userSnap = await get(userRef);

        if (!userSnap.exists()) {
            // Novo usuário - criar documento
            await set(userRef, {
                ...userData,
                createdAt: new Date().toISOString(),
            });
            return NextResponse.json({ isNewUser: true, data: userData });
        } else {
            // Usuário existente - retornar dados
            return NextResponse.json({ isNewUser: false, data: userSnap.val() });
        }
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
    }
}
