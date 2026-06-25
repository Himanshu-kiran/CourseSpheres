import { createSession, completePayment, stripe } from '../services/paymentService.js';

export const createCheckoutSession = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    const session = await createSession(userId, courseId);
    res.json(session);
  } catch (error) {
    // Service throws errors with statusCode for known cases (409, 404)
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifySession = async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const courseId = session.metadata.courseId;

      // Delegates to the same completePayment used by the webhook...no duplication
      await completePayment(sessionId, userId, courseId);

      return res.json({ success: true, courseId });
    }

    res.status(400).json({ success: false, message: 'Payment not completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};
