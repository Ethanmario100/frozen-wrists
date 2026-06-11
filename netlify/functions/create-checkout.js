exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  try {
    const data = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: data.line_items,
      mode: 'payment',
      success_url: 'https://frozenwrists.com/?checkout=success',
      cancel_url: 'https://frozenwrists.com/?checkout=cancelled',
      shipping_address_collection: { allowed_countries: ['US'] },
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: session.url }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
  }
};
