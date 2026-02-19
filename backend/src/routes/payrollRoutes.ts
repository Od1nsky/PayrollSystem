import { Router } from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', PayrollController.getAll);
router.get('/:id', PayrollController.getById);
router.post('/', PayrollController.create);
router.put('/:id/approve', PayrollController.approve);
router.delete('/:id', PayrollController.delete);

export default router;
