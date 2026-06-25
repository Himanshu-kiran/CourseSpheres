import express from 'express';
import { getUploadSignature } from '../controllers/upload.controller.js';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/signature', protect, authorize('ADMIN'), getUploadSignature);

export default router;
