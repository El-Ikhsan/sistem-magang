import express from 'express';
import SertifikatController from '../../controllers/users/sertifikatController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('user'));

router.get('/me', 
  SertifikatController.getMySertifikat
);

export default router;