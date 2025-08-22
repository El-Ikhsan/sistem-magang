import express from 'express';
import CertificateConfigController from '../../controllers/admin/sertifikatConfigController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';
import { uploadFields } from '../../middlewares/upload.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('admin'));

router.post(
    '/', 
    uploadFields([
        { name: 'company_logo', maxCount: 1 },
        { name: 'background_image', maxCount: 1 }
    ]), 
    CertificateConfigController.create
);
router.get('/', CertificateConfigController.getAll);
router.post('/delete-many', CertificateConfigController.deleteMany);
router.patch('/:id/set-active', CertificateConfigController.setActive);
router.patch(
    '/:id', 
    uploadFields([
        { name: 'company_logo', maxCount: 1 },
        { name: 'background_image', maxCount: 1 }
    ]), 
    CertificateConfigController.update
);
router.delete('/:id', CertificateConfigController.delete);

export default router;
