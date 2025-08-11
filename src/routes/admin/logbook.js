import express from 'express';
import LogbookController from '../../controllers/admin/logbookController.js';
import { authorizeRole } from '../../middlewares/roleHandler.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeRole('admin'));

router.get('/', 
  LogbookController.getAllLogbook
);

router.patch('/:id/validate', 
  LogbookController.validateLogbook
);

export default router;