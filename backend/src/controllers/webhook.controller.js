import { stripe, completePayment } from '../services/paymentService.js';

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Verify the request is genuinely from Stripe
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, courseId } = session.metadata;

    try {
      await completePayment(session.id, userId, courseId);
      console.log(`Payment completed for user ${userId} on course ${courseId}`);
    } catch (dbError) {
      console.error(`DB update failed in webhook: ${dbError.message}`);
      return res.status(500).send('Database update failed');
    }
  }

  res.json({ received: true });
};
