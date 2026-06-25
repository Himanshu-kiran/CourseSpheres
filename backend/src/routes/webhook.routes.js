import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// express.raw() is applied in server.js before this route
router.post('/', handleStripeWebhook);

export default router;
