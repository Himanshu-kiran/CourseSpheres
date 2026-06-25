import express from 'express';
import { markLectureComplete, getProgress } from '../controllers/progress.controller.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.use(protect);

router.post('/:lectureId', markLectureComplete);
router.get('/:courseId', getProgress);

export default router;
