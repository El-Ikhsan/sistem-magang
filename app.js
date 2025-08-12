import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { errorHandler } from './src/middlewares/errorHandler.js';
import { createBucketIfNotExists } from './config/minio.js';

import authRoutes from './src/routes/auth/auth.js';

// admin
import adminPendaftaranRoutes from './src/routes/admin/pendaftaran.js';
import adminLogbookRoutes from './src/routes/admin/logbook.js';
import adminSertifikatRoutes from './src/routes/admin/sertifikat.js';

// users
import userPendaftaranRoutes from './src/routes/users/pendaftaran.js';
import userLogbookRoutes from './src/routes/users/logbook.js';
import userSertifikatRoutes from './src/routes/users/sertifikat.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api/', limiter);

// Auth rate limiting (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);

// Admin routes
app.use('/api/admin/pendaftaran', adminPendaftaranRoutes);
app.use('/api/admin/logbook', adminLogbookRoutes);
app.use('/api/admin/sertifikat', adminSertifikatRoutes);

// User routes
app.use('/api/users/pendaftaran', userPendaftaranRoutes);
app.use('/api/users/logbook', userLogbookRoutes);
app.use('/api/users/sertifikat', userSertifikatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize MinIO bucket
createBucketIfNotExists();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;