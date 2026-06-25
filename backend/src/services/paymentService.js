import Stripe from 'stripe';
import prisma from '../lib/prisma.js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY is missing');
}
export const stripe = new Stripe(stripeKey);

export const createSession = async (userId, courseId) => {
  
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });
  if (existingEnrollment) {
    const err = new Error('Already enrolled in this course');
    err.statusCode = 409;
    throw err;
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: course.title,
            description: course.description.substring(0, 200)
          },
          unit_amount: course.price * 100 // convert rupees to paise
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
    cancel_url: `${clientUrl}/courses/${course.id}`,
    client_reference_id: userId,
    metadata: { courseId, userId }
  });

  // Save a pending record
  await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount: course.price,
      currency: 'inr',
      stripeSessionId: session.id,
      status: 'PENDING'
    }
  });

  return { id: session.id, url: session.url };
};


export const completePayment = async (sessionId, userId, courseId) => {
  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeSessionId: sessionId },
      data: { status: 'COMPLETED' }
    }),
    prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId }
    })
  ]);
};
