import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { database } from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Validar se a API key está configurada
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY not configured');
    return NextResponse.json(
      { error: 'Stripe API key not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Se não tiver webhook secret configurado (desenvolvimento), pular validação
    if (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret_here' || webhookSecret.includes('aleatoria')) {
      console.warn('Webhook secret not configured or is placeholder - skipping signature verification');
      // Tentar parsear o evento sem validação (apenas para desenvolvimento)
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    // Em desenvolvimento, permitir continuar mesmo com erro de assinatura
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development mode: allowing webhook without signature verification');
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch (e) {
        return NextResponse.json({ error: 'Invalid signature and JSON' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;

        if (uid && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await update(ref(database, `users/${uid}/subscription`), {
            status: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            isPremium: true,
            plan: 'monthly',
            currentPeriodEnd: subscription.current_period_end * 1000,
            currentPeriodStart: subscription.current_period_start * 1000,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar UID pelo customer ID
        const customer = await stripe.customers.retrieve(customerId);
        const uid = (customer as Stripe.Customer).metadata?.uid;

        if (uid) {
          const isActive = subscription.status === 'active';
          await update(ref(database, `users/${uid}/subscription`), {
            status: subscription.status,
            isPremium: isActive,
            currentPeriodEnd: subscription.current_period_end * 1000,
            currentPeriodStart: subscription.current_period_start * 1000,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const uid = (customer as Stripe.Customer).metadata?.uid;

          if (uid) {
            await update(ref(database, `users/${uid}/subscription`), {
              status: 'active',
              isPremium: true,
              currentPeriodEnd: subscription.current_period_end * 1000,
              currentPeriodStart: subscription.current_period_start * 1000,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const uid = (customer as Stripe.Customer).metadata?.uid;

          if (uid) {
            await update(ref(database, `users/${uid}/subscription`), {
              status: 'past_due',
              isPremium: false,
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

