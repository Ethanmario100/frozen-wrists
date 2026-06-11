const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const data = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], line_items: data.line_items, mode: 'payment',
      success_url: 'https://frozenwrists.com/?checkout=success', cancel_url: 'https://frozenwrists.com/?checkout=cancelled',
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 599, currency: 'usd' }, display_name: 'Standard Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 10 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 1299, currency: 'usd' }, display_name: 'Express Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 3 } } } },
      ],
      automatic_tax: { enabled: true }, tax_id_collection: { enabled: true },
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: session.url }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
  }
};
