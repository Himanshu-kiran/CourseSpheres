import express from 'express';
import { createLecture, updateLecture, deleteLecture } from '../controllers/lecture.controller.js';
import { validate } from '../validators/auth.validator.js';
import { lectureSchema } from '../validators/lecture.validator.js';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.post('/', validate(lectureSchema), createLecture);
//There is possibility that we would update only title or smthing not all data so no validate
router.put('/:id', updateLecture);
router.delete('/:id', deleteLecture);

export default router;
