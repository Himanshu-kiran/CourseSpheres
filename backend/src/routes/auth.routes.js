import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate, registerSchema, loginSchema } from '../validators/auth.validator.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
