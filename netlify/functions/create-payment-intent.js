exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  try {
    const data = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'usd',
      payment_method_types: ['card', 'apple_pay'],
      description: data.description || 'Frozen Wrists Order',
      automatic_payment_methods: { enabled: true },
      metadata: data.metadata || {},
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
