import express from 'express';
import { getCertificate } from '../controllers/certificate.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.get('/:courseId', protect, getCertificate);

export default router;
