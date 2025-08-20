import express from 'express';
import SertifikatController from '../../controllers/admin/sertifikatController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';
import { uploadSingle } from '../../middlewares/upload.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('admin'));

router.post('/', uploadSingle('certificate'), SertifikatController.createSertifikat);
router.get('/', SertifikatController.getAllSertifikat);
router.post('/delete-many', SertifikatController.deleteManySertifikat);
router.get('/:id', SertifikatController.getSertifikatByUserId);
router.delete('/:id', SertifikatController.deleteSertifikat);

export default router;