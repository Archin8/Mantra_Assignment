import { Router } from 'express';
import {
    getSchools,
    getSchoolsSummary,
    getSchoolsTrends,
    getRiskDistribution,
    getDistricts,
    getBlocks,
    getMonths,
    getSchoolById,
} from '../controllers/schoolMonthly.controller.js';

const router = Router();

// Aggregation / filter-helper endpoints (must come before /:id)
router.get('/summary', getSchoolsSummary);
router.get('/trends', getSchoolsTrends);
router.get('/risk-distribution', getRiskDistribution);
router.get('/districts', getDistricts);
router.get('/blocks', getBlocks);
router.get('/months', getMonths);

// List & detail
router.get('/', getSchools);
router.get('/:id', getSchoolById);

export default router;
