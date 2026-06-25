import express from 'express';
import { createCheckoutSession, verifySession } from '../controllers/payment.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/checkout', protect, createCheckoutSession);
router.post('/verify', protect, verifySession);

export default router;
