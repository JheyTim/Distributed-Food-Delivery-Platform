const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Handle payments with Stripe
exports.processPayment = async (req, res) => {
  const { amount, paymentMethodId, currency = 'usd' } = req.body;

  try {
    // Create a PaymentIntent with the specified amount and payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents (e.g., 5000 for $50.00)
      currency,
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
    });

    res.status(200).json(paymentIntent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment processing error', error });
  }
};
