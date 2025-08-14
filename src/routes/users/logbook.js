import express from 'express';
import LogbookController from '../../controllers/users/logbookController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('user'));

router.post('/', LogbookController.createLogbook);
router.get('/me', LogbookController.getMyLogbook);
router.patch('/:id', LogbookController.updateLogbook);
router.delete('/:id', LogbookController.deleteLogbook);
router.post('/delete-many', LogbookController.deleteManyLogbook);

export default router;