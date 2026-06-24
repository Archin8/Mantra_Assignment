import { Request, Response } from 'express';
import { query } from '../lib/db.js';
import { TryCatch } from '../middlewares/error.js';
import HttpError from '../utils/errorHandler.js';

// ============================
// GET /api/grants
// List all grants
// ============================
export const getGrants = TryCatch(async (_req: Request, res: Response) => {
    const result = await query(
        `SELECT
            g.*,
            (SELECT COUNT(*) FROM "GrantFinance" gf WHERE gf."grantId" = g.id) as "financeRecords",
            (SELECT COUNT(*) FROM "GrantPerformance" gp WHERE gp."grantId" = g.id) as "performanceRecords",
            (SELECT COUNT(*) FROM "GrantMedia" gm WHERE gm."grantId" = g.id) as "mediaRecords"
         FROM "Grant" g
         ORDER BY g.name ASC`
    );

    res.json({
        success: true,
        data: result.rows,
    });
});

// ============================
// GET /api/grants/summary
// Aggregated overview
// ============================
export const getGrantsSummary = TryCatch(async (_req: Request, res: Response) => {
    const grantsCount = await query(`SELECT COUNT(*) as total FROM "Grant"`);

    const financeStats = await query(
        `SELECT
            ROUND(AVG("utilizationRate")::numeric, 4) as "avgUtilizationRate",
            SUM("approvedBudget") as "totalApprovedBudget",
            SUM("cumulativeUtilized") as "totalUtilized"
         FROM "GrantFinance"`
    );

    const performanceStats = await query(
        `SELECT
            ROUND(AVG("completionRate")::numeric, 4) as "avgCompletionRate",
            ROUND(AVG("evidenceRate")::numeric, 4) as "avgEvidenceRate",
            ROUND(AVG("attendanceRate")::numeric, 4) as "avgAttendanceRate",
            COUNT(*) FILTER (WHERE "riskStatus" = 'On Track') as "onTrack",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Behind') as "behind",
            COUNT(*) FILTER (WHERE "riskStatus" = 'At Risk') as "atRisk",
            COUNT(*) FILTER (WHERE "riskStatus" = 'Critical') as "critical"
         FROM "GrantPerformance"`
    );

    res.json({
        success: true,
        data: {
            totalGrants: parseInt(grantsCount.rows[0].total, 10),
            finance: financeStats.rows[0],
            performance: performanceStats.rows[0],
        },
    });
});

// ============================
// GET /api/grants/:id
// Single grant with all related data
// ============================
export const getGrantById = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const grantResult = await query(
        `SELECT * FROM "Grant" WHERE id = $1`,
        [id]
    );

    if (grantResult.rows.length === 0) {
        throw new HttpError(404, `Grant with id '${id}' not found`);
    }

    const [finance, performance, media] = await Promise.all([
        query(`SELECT * FROM "GrantFinance" WHERE "grantId" = $1 ORDER BY month ASC, "budgetLine" ASC`, [id]),
        query(`SELECT * FROM "GrantPerformance" WHERE "grantId" = $1 ORDER BY month ASC`, [id]),
        query(`SELECT * FROM "GrantMedia" WHERE "grantId" = $1 ORDER BY month ASC`, [id]),
    ]);

    res.json({
        success: true,
        data: {
            ...grantResult.rows[0],
            finance: finance.rows,
            performance: performance.rows,
            media: media.rows,
        },
    });
});

// ============================
// GET /api/grants/:id/finance
// Finance data for a specific grant
// ============================
export const getGrantFinance = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { month } = req.query;

    // Verify grant exists
    const grantResult = await query(`SELECT id FROM "Grant" WHERE id = $1`, [id]);
    if (grantResult.rows.length === 0) {
        throw new HttpError(404, `Grant with id '${id}' not found`);
    }

    const conditions: string[] = [`"grantId" = $1`];
    const params: unknown[] = [id];
    let paramIndex = 2;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const result = await query(
        `SELECT * FROM "GrantFinance" ${whereClause}
         ORDER BY month ASC, "budgetLine" ASC`,
        params
    );

    // Also get aggregated stats
    const stats = await query(
        `SELECT
            month,
            SUM("approvedBudget") as "totalApprovedBudget",
            SUM("monthlyUtilized") as "totalMonthlyUtilized",
            SUM("cumulativeUtilized") as "totalCumulativeUtilized",
            ROUND(AVG("utilizationRate")::numeric, 4) as "avgUtilizationRate"
         FROM "GrantFinance" ${whereClause}
         GROUP BY month
         ORDER BY month ASC`,
        params
    );

    res.json({
        success: true,
        data: result.rows,
        summary: stats.rows,
    });
});

// ============================
// GET /api/grants/:id/performance
// Performance data for a specific grant
// ============================
export const getGrantPerformance = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { month } = req.query;

    // Verify grant exists
    const grantResult = await query(`SELECT id FROM "Grant" WHERE id = $1`, [id]);
    if (grantResult.rows.length === 0) {
        throw new HttpError(404, `Grant with id '${id}' not found`);
    }

    const conditions: string[] = [`"grantId" = $1`];
    const params: unknown[] = [id];
    let paramIndex = 2;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const result = await query(
        `SELECT * FROM "GrantPerformance" ${whereClause}
         ORDER BY month ASC`,
        params
    );

    res.json({
        success: true,
        data: result.rows,
    });
});

// ============================
// GET /api/grants/:id/media
// Media records for a specific grant
// ============================
export const getGrantMedia = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { month, recordType } = req.query;

    // Verify grant exists
    const grantResult = await query(`SELECT id FROM "Grant" WHERE id = $1`, [id]);
    if (grantResult.rows.length === 0) {
        throw new HttpError(404, `Grant with id '${id}' not found`);
    }

    const conditions: string[] = [`"grantId" = $1`];
    const params: unknown[] = [id];
    let paramIndex = 2;

    if (month) {
        conditions.push(`month = $${paramIndex++}`);
        params.push(month);
    }
    if (recordType) {
        conditions.push(`"recordType" = $${paramIndex++}`);
        params.push(recordType);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const result = await query(
        `SELECT * FROM "GrantMedia" ${whereClause}
         ORDER BY month ASC, title ASC`,
        params
    );

    res.json({
        success: true,
        data: result.rows,
    });
});
