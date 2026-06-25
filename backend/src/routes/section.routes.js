import express from 'express';
import { createSection, updateSection, deleteSection } from '../controllers/section.controller.js';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;
