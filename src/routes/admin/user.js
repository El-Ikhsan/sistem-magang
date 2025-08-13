import express from 'express';
import UserAdminController from '../../controllers/admin/userController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole('admin'))

// Routes
router.post('/', UserAdminController.createNewUser);
router.get('/', UserAdminController.getAllUsers);
router.get('/:id', UserAdminController.getUserById);
router.patch('/:id', UserAdminController.updateUser);
router.delete('/:id', UserAdminController.deleteUser);
router.post('/delete-many', UserAdminController.deleteManyUsers);

export default router;