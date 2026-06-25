import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getAllCoursesAdmin } from '../controllers/course.controller.js';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Admin route must be before /:id to avoid "admin" being treated as an id
router.get('/admin/all', protect, authorize('ADMIN'), getAllCoursesAdmin);

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin CRUD
router.post('/', protect, authorize('ADMIN'), createCourse);
router.put('/:id', protect, authorize('ADMIN'), updateCourse);
router.delete('/:id', protect, authorize('ADMIN'), deleteCourse);

export default router;
