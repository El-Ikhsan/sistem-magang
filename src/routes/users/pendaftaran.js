import express from 'express';
import PendaftaranController from '../../controllers/users/pendaftaranController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';
import { uploadFields } from '../../middlewares/upload.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('user'));


// Upload fields for pendaftaran documents
const uploadPendaftaran = uploadFields([
  { name: 'ktp', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]);

// Peserta routes
router.post('/', uploadPendaftaran, PendaftaranController.submitPendaftaran);
router.get('/me', PendaftaranController.getMyPendaftaran);

export default router;