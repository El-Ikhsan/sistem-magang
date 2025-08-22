import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { logger, httpLogger } from './config/logger.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { createBucketIfNotExists } from './config/minio.js';

// general
import authRoutes from './src/routes/auth/auth.js';

// admin
import adminPendaftaranRoutes from './src/routes/admin/pendaftaran.js';
import adminLogbookRoutes from './src/routes/admin/logbook.js';
import adminSertifikatRoutes from './src/routes/admin/sertifikat.js';
import adminUserRoutes from './src/routes/admin/user.js';
import adminInstitutionsRoutes from './src/routes/admin/institutions.js';
import adminSertifikatConfigRoutes from './src/routes/admin/sertifikatConfig.js';

// users
import userPendaftaranRoutes from './src/routes/users/pendaftaran.js';
import userLogbookRoutes from './src/routes/users/logbook.js';
import userSertifikatRoutes from './src/routes/users/sertifikat.js';
import userInstitutionsRoutes from './src/routes/users/institutions.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ini akan mencatat semua permintaan yang masuk setelah ini
app.use(httpLogger);

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
  max: 10, // Naikkan sedikit untuk mengakomodasi percobaan login
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

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
app.use('/api/admin/sertifikat/config', adminSertifikatConfigRoutes);
app.use('/api/admin/sertifikat', adminSertifikatRoutes);
app.use('/api/admin/user', adminUserRoutes);
app.use('/api/admin/institutions', adminInstitutionsRoutes);

// User routes
app.use('/api/users/pendaftaran', userPendaftaranRoutes);
app.use('/api/users/logbook', userLogbookRoutes);
app.use('/api/users/sertifikat', userSertifikatRoutes);
app.use('/api/users/institutions', userInstitutionsRoutes);

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
  // 3. (Opsional) Gunakan logger untuk pesan status server
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;