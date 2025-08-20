import express from 'express';
import InstitutionsController from '../../controllers/users/institutionsController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('user'));

router.post('/', InstitutionsController.createInstitution);
router.get('/:id', InstitutionsController.getInstitutionById);
router.patch('/:id', InstitutionsController.updateInstitution);
router.delete('/:id', InstitutionsController.deleteInstitution);

export default router;