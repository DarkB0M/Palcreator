import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function middleware(request: NextRequest) {
  // Rotas que precisam de premium
  const premiumRoutes = ['/api/premium-feature'];

  if (premiumRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization');
    
    // Tentar obter UID do body se for POST
    let uid: string | null = null;

    if (request.method === 'POST') {
      try {
        const body = await request.clone().json();
        uid = body.uid;
      } catch (e) {
        // Se não conseguir ler o body, tentar header
        uid = request.headers.get('x-user-id');
      }
    } else {
      uid = request.headers.get('x-user-id');
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized - UID required' },
        { status: 401 }
      );
    }

    try {
      const subscriptionRef = ref(database, `users/${uid}/subscription`);
      const snapshot = await get(subscriptionRef);

      if (!snapshot.exists()) {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }

      const subscription = snapshot.val();
      
      // Verificar se expirou
      if (subscription.currentPeriodEnd && Date.now() > subscription.currentPeriodEnd) {
        return NextResponse.json(
          { error: 'Premium subscription expired' },
          { status: 403 }
        );
      }

      if (!subscription.isPremium || subscription.status !== 'active') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

