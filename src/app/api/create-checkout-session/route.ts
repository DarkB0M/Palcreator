import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Validar se a API key está configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Stripe API key not configured. Please set STRIPE_SECRET_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Validar formato da API key
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      console.error('Invalid STRIPE_SECRET_KEY format. Must start with sk_test_ or sk_live_');
      return NextResponse.json(
        { error: 'Invalid Stripe API key format. Please check your STRIPE_SECRET_KEY in .env.local' },
        { status: 500 }
      );
    }

    const { uid, email } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'UID and email are required' },
        { status: 400 }
      );
    }

    // Criar ou buscar customer no Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { uid },
      });
      customerId = customer.id;
    } else {
      // Atualizar metadata se já existir
      await stripe.customers.update(customerId, {
        metadata: { uid },
      });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Pal Creator Premium',
              description: 'Assinatura mensal - Acesso a todos os recursos premium',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 2990, // R$ 29,90 em centavos
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      metadata: {
        uid,
      },
    });

    // Salvar customer ID no Firebase
    await update(ref(database, `users/${uid}/subscription`), {
      stripeCustomerId: customerId,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Mensagens de erro mais específicas
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { 
          error: 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local',
          details: 'The API key must start with sk_test_ (test mode) or sk_live_ (live mode)'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

