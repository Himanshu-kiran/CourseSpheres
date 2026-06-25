import express from 'express';
import { getEnrollments } from '../controllers/enrollment.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.get('/', protect, getEnrollments);

export default router;
