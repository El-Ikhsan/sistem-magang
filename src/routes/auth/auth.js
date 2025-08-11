import express from 'express';
import AuthController from '../../controllers/auth/authController.js';
import { authenticate } from '../../middlewares/auth.js';
import { uploadSingle } from '../../middlewares/upload.js';


const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.use(authenticate);
router.get('/me', AuthController.getProfile);
router.patch('/me', uploadSingle('avatar'), AuthController.updateProfile);

export default router;