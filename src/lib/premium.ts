import { auth } from './firebase';

export async function checkPremiumStatus(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const response = await fetch('/api/check-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.uid }),
    });

    const data = await response.json();
    return data.isPremium === true;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

export async function redirectToCheckout() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    console.error('User not authenticated');
    return;
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
      }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error('No checkout URL received');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
}

export async function cancelSubscription(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.uid }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

