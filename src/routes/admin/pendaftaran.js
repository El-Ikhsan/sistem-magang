import express from 'express';
import PendaftaranController from '../../controllers/admin/pendaftaranController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('admin'));

router.get('/', PendaftaranController.getAllPendaftaran);
router.post('/delete-many', PendaftaranController.deleteManyPendaftaran);
router.post('/verify-many', PendaftaranController.verifyManyPendaftaran);
router.post('/status-magang-many', PendaftaranController.updateManyStatusMagang);
router.patch('/:id/verify', PendaftaranController.verifyPendaftaran);
router.patch('/:id/status-magang', PendaftaranController.updateStatusMagang);
router.delete('/:id', PendaftaranController.deletePendaftaran);

export default router;