const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const data = JSON.parse(event.body);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount, currency: 'usd', payment_method: data.paymentMethodId, confirm: true,
      description: data.description || 'Frozen Wrists Order', shipping: data.shipping || undefined,
      automatic_payment_methods: { enabled: true }, metadata: data.metadata || {},
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, id: paymentIntent.id }) };
  } catch (error) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
