import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    const subscriptionRef = ref(database, `users/${uid}/subscription`);
    const snapshot = await get(subscriptionRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ isPremium: false, status: null });
    }

    const subscription = snapshot.val();
    const isPremium = subscription.isPremium === true && subscription.status === 'active';

    // Verificar se a assinatura expirou
    if (subscription.currentPeriodEnd) {
      const now = Date.now();
      if (now > subscription.currentPeriodEnd) {
        await update(subscriptionRef, {
          isPremium: false,
          status: 'expired',
        });
        return NextResponse.json({ isPremium: false, status: 'expired' });
      }
    }

    return NextResponse.json({
      isPremium,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      plan: subscription.plan || null,
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json(
      { error: 'Failed to check premium status' },
      { status: 500 }
    );
  }
}

