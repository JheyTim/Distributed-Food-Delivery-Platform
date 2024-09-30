const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Handle payments with Stripe
exports.processPayment = async (req, res) => {
  const { amount, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.status(200).json(paymentIntent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Payment processing error');
  }
};
