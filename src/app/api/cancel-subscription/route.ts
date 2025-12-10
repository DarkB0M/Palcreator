import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

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
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const subscription = snapshot.val();
    const subscriptionId = subscription.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No Stripe subscription ID found' },
        { status: 404 }
      );
    }

    // Cancelar no Stripe (cancelar no final do período)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar Firebase
    await update(subscriptionRef, {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

