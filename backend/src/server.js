import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load variables into process.env
dotenv.config();

import webhookRoutes from './routes/webhook.routes.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import sectionRoutes from './routes/section.routes.js';
import lectureRoutes from './routes/lecture.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import progressRoutes from './routes/progress.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Webhook must be before express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Middlewares
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

import prisma from './lib/prisma.js';

prisma.$connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL Database');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(` Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(' Failed to connect to the database:', err);
    process.exit(1);
  });
