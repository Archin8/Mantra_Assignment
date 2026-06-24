import { Request, Response } from 'express';
import { query } from '../lib/db.js';
import { TryCatch } from '../middlewares/error.js';
import HttpError from '../utils/errorHandler.js';

// ============================
// GET /api/schools
// List school records with filtering & pagination
// ============================
export const getSchools = TryCatch(async (req: Request, res: Response) => {
    const {
        month,
        district,
        block,
        riskStatus,
        schoolCode,
        wasConducted,
        page = '1',
        limit = '20',
        sortBy = 'schoolName',
        sortOrder = 'asc',
    } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }
    if (district) {
        conditions.push(`district = $${paramIndex++}`);
        params.push(district);
    }
    if (block) {
        conditions.push(`block = $${paramIndex++}`);
        params.push(block);
    }
    if (riskStatus) {
        conditions.push(`"riskStatus" = $${paramIndex++}`);
        params.push(riskStatus);
    }
    if (schoolCode) {
        conditions.push(`"schoolCode" = $${paramIndex++}`);
        params.push(schoolCode);
    }
    if (wasConducted !== undefined) {
        conditions.push(`"wasConducted" = $${paramIndex++}`);
        params.push(wasConducted === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
        'schoolName', 'schoolCode', 'district', 'block', 'month',
        'totalEnrollment', 'totalAttendance', 'attendanceRate', 'riskStatus',
    ];
    const safeSortBy = allowedSortColumns.includes(sortBy as string)
        ? `"${sortBy}"`
        : '"schoolName"';
    const safeSortOrder = (sortOrder as string).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Count total
    const countResult = await query(
        `SELECT COUNT(*) as total FROM "SchoolMonthly" ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Paginated data
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const dataResult = await query(
        `SELECT * FROM "SchoolMonthly" ${whereClause}
         ORDER BY ${safeSortBy} ${safeSortOrder}
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...params, limitNum, offset]
    );

    res.json({
        success: true,
        data: dataResult.rows,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});

// ============================
// GET /api/schools/summary
// Aggregated dashboard summary
// ============================
export const getSchoolsSummary = TryCatch(async (req: Request, res: Response) => {
    const { month, district } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }
    if (district) {
        conditions.push(`district = $${paramIndex++}`);
        params.push(district);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
        `SELECT
            COUNT(*) as "totalRecords",
            COUNT(DISTINCT "schoolCode") as "totalSchools",
            COUNT(DISTINCT district) as "totalDistricts",
            COUNT(DISTINCT block) as "totalBlocks",
            ROUND(AVG("attendanceRate")::numeric, 4) as "avgAttendanceRate",
            SUM("totalEnrollment") as "totalEnrollment",
            SUM("totalAttendance") as "totalAttendance",
            COUNT(*) FILTER (WHERE "wasConducted" = true) as "schoolsConducted",
            COUNT(*) FILTER (WHERE "evidenceSubmitted" = true) as "schoolsWithEvidence",
            COUNT(*) FILTER (WHERE "riskStatus" = 'On Track') as "onTrack",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Behind') as "behind",
            COUNT(*) FILTER (WHERE "riskStatus" = 'At Risk') as "atRisk",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Critical') as "critical"
         FROM "SchoolMonthly" ${whereClause}`,
        params
    );

    res.json({
        success: true,
        data: result.rows[0],
    });
});

// ============================
// GET /api/schools/trends
// Monthly trend data
// ============================
export const getSchoolsTrends = TryCatch(async (req: Request, res: Response) => {
    const { district, block } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (district) {
        conditions.push(`district = $${paramIndex++}`);
        params.push(district);
    }
    if (block) {
        conditions.push(`block = $${paramIndex++}`);
        params.push(block);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
        `SELECT
            month,
            COUNT(*) as "totalRecords",
            ROUND(AVG("attendanceRate")::numeric, 4) as "avgAttendanceRate",
            SUM("totalEnrollment") as "totalEnrollment",
            SUM("totalAttendance") as "totalAttendance",
            COUNT(*) FILTER (WHERE "wasConducted" = true) as "schoolsConducted",
            COUNT(*) FILTER (WHERE "evidenceSubmitted" = true) as "schoolsWithEvidence",
            COUNT(*) FILTER (WHERE "riskStatus" = 'On Track') as "onTrack",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Behind') as "behind",
            COUNT(*) FILTER (WHERE "riskStatus" = 'At Risk') as "atRisk",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Critical') as "critical"
         FROM "SchoolMonthly" ${whereClause}
         GROUP BY month
         ORDER BY month ASC`,
        params
    );

    res.json({
        success: true,
        data: result.rows,
    });
});

// ============================
// GET /api/schools/risk-distribution
// Risk status distribution
// ============================
export const getRiskDistribution = TryCatch(async (req: Request, res: Response) => {
    const { month, district } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }
    if (district) {
        conditions.push(`district = $${paramIndex++}`);
        params.push(district);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
        `SELECT
            "riskStatus",
            COUNT(*) as count,
            ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER(), 0), 4) as percentage
         FROM "SchoolMonthly" ${whereClause}
         GROUP BY "riskStatus"
         ORDER BY count DESC`,
        params
    );

    res.json({
        success: true,
        data: result.rows,
    });
});

// ============================
// GET /api/schools/districts
// Distinct districts list
// ============================
export const getDistricts = TryCatch(async (_req: Request, res: Response) => {
    const result = await query(
        `SELECT DISTINCT district FROM "SchoolMonthly" ORDER BY district ASC`
    );

    res.json({
        success: true,
        data: result.rows.map((r: Record<string, string>) => r.district),
    });
});

// ============================
// GET /api/schools/blocks
// Distinct blocks, optionally filtered by district
// ============================
export const getBlocks = TryCatch(async (req: Request, res: Response) => {
    const { district } = req.query;

    if (district) {
        const result = await query(
            `SELECT DISTINCT block FROM "SchoolMonthly" WHERE district = $1 ORDER BY block ASC`,
            [district]
        );
        return res.json({ success: true, data: result.rows.map((r: Record<string, string>) => r.block) });
    }

    const result = await query(
        `SELECT DISTINCT block FROM "SchoolMonthly" ORDER BY block ASC`
    );
    res.json({ success: true, data: result.rows.map((r: Record<string, string>) => r.block) });
});

// ============================
// GET /api/schools/months
// Distinct months list
// ============================
export const getMonths = TryCatch(async (_req: Request, res: Response) => {
    const result = await query(
        `SELECT DISTINCT month FROM "SchoolMonthly" ORDER BY month ASC`
    );

    res.json({
        success: true,
        data: result.rows.map((r: Record<string, string>) => r.month),
    });
});

// ============================
// GET /api/schools/:id
// Single school record by ID
// ============================
export const getSchoolById = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await query(
        `SELECT * FROM "SchoolMonthly" WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new HttpError(404, `School record with id '${id}' not found`);
    }

    res.json({
        success: true,
        data: result.rows[0],
    });
});
