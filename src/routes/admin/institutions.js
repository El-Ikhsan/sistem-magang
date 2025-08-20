import express from 'express';
import InstitutionsController from '../../controllers/admin/institutionsController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('admin'));

router.post('/', InstitutionsController.createInstitution);
router.get('/', InstitutionsController.getInstitutions);
router.get('/:id', InstitutionsController.getInstitutionById);
router.patch('/:id', InstitutionsController.updateInstitution);
router.delete('/:id', InstitutionsController.deleteInstitution);

export default router;