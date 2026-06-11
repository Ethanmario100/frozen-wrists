import Stripe from 'stripe';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

  try {
    const data = await context.request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'usd',
      payment_method: data.paymentMethodId,
      confirm: true,
      description: data.description || 'Frozen Wrists Order',
      shipping: data.shipping || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: data.metadata || {},
    });

    return new Response(JSON.stringify({ success: true, id: paymentIntent.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
