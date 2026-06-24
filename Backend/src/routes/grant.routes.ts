import { Router } from 'express';
import {
    getGrants,
    getGrantsSummary,
    getGrantById,
    getGrantFinance,
    getGrantPerformance,
    getGrantMedia,
} from '../controllers/grant.controller.js';

const router = Router();

// Aggregation endpoint (must come before /:id)
router.get('/summary', getGrantsSummary);

// List & detail
router.get('/', getGrants);
router.get('/:id', getGrantById);

// Sub-resources
router.get('/:id/finance', getGrantFinance);
router.get('/:id/performance', getGrantPerformance);
router.get('/:id/media', getGrantMedia);

export default router;
