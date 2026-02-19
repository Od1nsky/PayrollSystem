import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/summary', ReportController.summary);
router.get('/by-department', ReportController.byDepartment);
router.get('/by-employee', ReportController.byEmployee);
router.get('/export', ReportController.export);

export default router;
