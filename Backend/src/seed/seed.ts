import csv from 'csv-parser';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

// ============================
// 1. Database Connection
// ============================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// ============================
// 2. Utility Functions
// ============================
function parseBoolean(value: string): boolean {
    return value?.toLowerCase() === 'yes' || value?.toLowerCase() === 'true';
}

function parseNumber(value: string): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

function parseRisk(value: string): string {
    // Ensure proper risk statuses
    const valid = ['On Track', 'Behind', 'At Risk', 'Critical'];
    return valid.includes(value) ? value : 'At Risk';
}

function parseDate(value: string): Date {
    return new Date(value);
}

// ============================
// 3. Seed Functions
// ============================

const monthNameMap: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12',
};

async function seedSchoolMonthly(filePath: string) {
    // Try YYYY-MM pattern first, then fall back to MonthName_YYYY
    let month = path.basename(filePath).match(/\d{4}-\d{2}/)?.[0];
    if (!month) {
        const nameMatch = path.basename(filePath).match(/(January|February|March|April|May|June|July|August|September|October|November|December)_(\d{4})/i);
        if (nameMatch) {
            month = `${nameMatch[2]}-${monthNameMap[nameMatch[1]]}`;
        }
    }
    if (!month) throw new Error(`Could not extract month from filename: ${filePath}`);

    console.log(`Seeding ${month} from ${filePath}...`);

    const rows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    // Process each row
    for (const row of rows) {
        const {
            'Reporting Month': reportingMonth,
            Timestamp: timestamp,
            'What is the name of your school?': schoolName,
            'What is your school\'s synthetic school code?': schoolCode,
            'What is the name of your district?': district,
            'Block Details': block,
            'Was the PBL project conducted in your school this month?': wasConducted,
            'Was evidence submitted for the completed PBL project?': evidenceSubmitted,
            'In which class/classes did you conduct the PBL project?': classesConducted,
            'Which subject do you teach?': subject,
            'Total number of students enrolled in Class 6, including all sections': enroll6,
            'Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0.': attSci6,
            'Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0.': attMath6,
            'Total number of students enrolled in Class 7, including all sections': enroll7,
            'Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0.': attSci7,
            'Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0.': attMath7,
            'Total number of students enrolled in Class 8, including all sections': enroll8,
            'Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0.': attSci8,
            'Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0.': attMath8,
            'Derived: Total enrollment across Classes 6-8': totalEnrollment,
            'Derived: Total attendance across PBL Science and Math sessions': totalAttendance,
            'Derived: Overall PBL attendance rate': attendanceRate,
            'Derived: Risk status': riskStatus,
        } = row;

        // Use provided month from filename, but CSV has "Reporting Month"
        const effectiveMonth = month;

        const query = `
      INSERT INTO "SchoolMonthly" (
        month, timestamp, "schoolName", "schoolCode", district, block,
        "wasConducted", "evidenceSubmitted", "classesConducted", subject,
        "enrollmentClass6", "attendanceSci6", "attendanceMath6",
        "enrollmentClass7", "attendanceSci7", "attendanceMath7",
        "enrollmentClass8", "attendanceSci8", "attendanceMath8",
        "totalEnrollment", "totalAttendance", "attendanceRate", "riskStatus"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19,
        $20, $21, $22, $23
      ) ON CONFLICT (month, "schoolCode") DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        "schoolName" = EXCLUDED."schoolName",
        district = EXCLUDED.district,
        block = EXCLUDED.block,
        "wasConducted" = EXCLUDED."wasConducted",
        "evidenceSubmitted" = EXCLUDED."evidenceSubmitted",
        "classesConducted" = EXCLUDED."classesConducted",
        subject = EXCLUDED.subject,
        "enrollmentClass6" = EXCLUDED."enrollmentClass6",
        "attendanceSci6" = EXCLUDED."attendanceSci6",
        "attendanceMath6" = EXCLUDED."attendanceMath6",
        "enrollmentClass7" = EXCLUDED."enrollmentClass7",
        "attendanceSci7" = EXCLUDED."attendanceSci7",
        "attendanceMath7" = EXCLUDED."attendanceMath7",
        "enrollmentClass8" = EXCLUDED."enrollmentClass8",
        "attendanceSci8" = EXCLUDED."attendanceSci8",
        "attendanceMath8" = EXCLUDED."attendanceMath8",
        "totalEnrollment" = EXCLUDED."totalEnrollment",
        "totalAttendance" = EXCLUDED."totalAttendance",
        "attendanceRate" = EXCLUDED."attendanceRate",
        "riskStatus" = EXCLUDED."riskStatus";
    `;

        const values = [
            effectiveMonth,
            parseDate(timestamp),
            schoolName,
            schoolCode,
            district,
            block,
            parseBoolean(wasConducted),
            parseBoolean(evidenceSubmitted),
            classesConducted,
            subject,
            parseNumber(enroll6),
            parseNumber(attSci6),
            parseNumber(attMath6),
            parseNumber(enroll7),
            parseNumber(attSci7),
            parseNumber(attMath7),
            parseNumber(enroll8),
            parseNumber(attSci8),
            parseNumber(attMath8),
            parseNumber(totalEnrollment),
            parseNumber(totalAttendance),
            parseNumber(attendanceRate),
            parseRisk(riskStatus),
        ];

        await pool.query(query, values);
    }

    console.log(`✅ Inserted/updated ${rows.length} records for ${month}`);
}

async function seedGrantMaster(filePath: string) {
    // This function reads finance and performance files to create grant records
    // We'll call it once per grant file, but we need to extract unique grants
    console.log(`Seeding grant master from ${filePath}...`);
    const rows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    // Extract unique grants
    const grants = new Map<string, { donor: string; name: string; periodStart: string; periodEnd: string; coveredDistricts: string }>();

    for (const row of rows) {
        const grantId = row.grant_id;
        const donor = row.donor;
        const name = row.grant_name;
        const periodStart = row.period_start;
        const periodEnd = row.period_end;
        const coveredDistricts = row.covered_districts;

        if (!grants.has(grantId)) {
            grants.set(grantId, { donor, name, periodStart, periodEnd, coveredDistricts });
        }
    }

    for (const [grantId, data] of grants) {
        const query = `
      INSERT INTO "Grant" (id, donor, name, "periodStart", "periodEnd", "coveredDistricts")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (donor, name) DO UPDATE SET
        "periodStart" = EXCLUDED."periodStart",
        "periodEnd" = EXCLUDED."periodEnd",
        "coveredDistricts" = EXCLUDED."coveredDistricts";
    `;
        await pool.query(query, [
            grantId,
            data.donor,
            data.name,
            parseDate(data.periodStart),
            parseDate(data.periodEnd),
            data.coveredDistricts,
        ]);
    }

    console.log(`✅ Inserted/updated ${grants.size} grant records`);
}

async function seedGrantFinance(filePath: string) {
    console.log(`Seeding grant finance from ${filePath}...`);
    const rows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    for (const row of rows) {
        const {
            grant_id,
            reporting_month,
            budget_line,
            approved_budget_units,
            monthly_utilized_units,
            cumulative_utilized_units,
            cumulative_utilization_rate,
            finance_note,
        } = row;

        const query = `
      INSERT INTO "GrantFinance" (
        "grantId", month, "budgetLine", "approvedBudget",
        "monthlyUtilized", "cumulativeUtilized", "utilizationRate", note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("grantId", month, "budgetLine") DO UPDATE SET
        "approvedBudget" = EXCLUDED."approvedBudget",
        "monthlyUtilized" = EXCLUDED."monthlyUtilized",
        "cumulativeUtilized" = EXCLUDED."cumulativeUtilized",
        "utilizationRate" = EXCLUDED."utilizationRate",
        note = EXCLUDED.note;
    `;

        await pool.query(query, [
            grant_id,
            reporting_month,
            budget_line,
            parseNumber(approved_budget_units),
            parseNumber(monthly_utilized_units),
            parseNumber(cumulative_utilized_units),
            parseNumber(cumulative_utilization_rate),
            finance_note || null,
        ]);
    }

    console.log(`✅ Inserted/updated ${rows.length} finance records`);
}

async function seedGrantPerformance(filePath: string) {
    console.log(`Seeding grant performance from ${filePath}...`);
    const rows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    for (const row of rows) {
        const {
            grant_id,
            reporting_month,
            period_end_date,
            report_due_date,
            report_status,
            covered_districts,
            sampled_school_records,
            schools_completed_pbl,
            pbl_completion_rate,
            schools_with_evidence,
            evidence_submission_rate,
            total_enrollment,
            total_attendance,
            attendance_rate,
            risk_status,
            milestone_summary,
            draft_report_text,
        } = row;

        const query = `
      INSERT INTO "GrantPerformance" (
        "grantId", month, "periodEnd", "reportDue", "reportStatus",
        "coveredDistricts", "sampledSchools", "schoolsCompleted", "completionRate",
        "schoolsWithEvidence", "evidenceRate", "totalEnrollment", "totalAttendance",
        "attendanceRate", "riskStatus", "milestoneSummary", "draftReportText"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT ("grantId", month) DO UPDATE SET
        "periodEnd" = EXCLUDED."periodEnd",
        "reportDue" = EXCLUDED."reportDue",
        "reportStatus" = EXCLUDED."reportStatus",
        "coveredDistricts" = EXCLUDED."coveredDistricts",
        "sampledSchools" = EXCLUDED."sampledSchools",
        "schoolsCompleted" = EXCLUDED."schoolsCompleted",
        "completionRate" = EXCLUDED."completionRate",
        "schoolsWithEvidence" = EXCLUDED."schoolsWithEvidence",
        "evidenceRate" = EXCLUDED."evidenceRate",
        "totalEnrollment" = EXCLUDED."totalEnrollment",
        "totalAttendance" = EXCLUDED."totalAttendance",
        "attendanceRate" = EXCLUDED."attendanceRate",
        "riskStatus" = EXCLUDED."riskStatus",
        "milestoneSummary" = EXCLUDED."milestoneSummary",
        "draftReportText" = EXCLUDED."draftReportText";
    `;

        await pool.query(query, [
            grant_id,
            reporting_month,
            parseDate(period_end_date),
            parseDate(report_due_date),
            report_status,
            covered_districts,
            parseNumber(sampled_school_records),
            parseNumber(schools_completed_pbl),
            parseNumber(pbl_completion_rate),
            parseNumber(schools_with_evidence),
            parseNumber(evidence_submission_rate),
            parseNumber(total_enrollment),
            parseNumber(total_attendance),
            parseNumber(attendance_rate),
            parseRisk(risk_status),
            milestone_summary,
            draft_report_text,
        ]);
    }

    console.log(`✅ Inserted/updated ${rows.length} performance records`);
}

async function seedGrantMedia(filePath: string) {
    console.log(`Seeding grant media from ${filePath}...`);
    const rows: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    for (const row of rows) {
        const {
            record_id,
            record_type,
            grant_id,
            donor,
            reporting_month,
            district,
            title,
            summary_or_caption,
            file_name,
            relative_path,
            usage_note,
        } = row;

        // Insert media records (no conflict handling needed; each record_id is unique)
        const query = `
      INSERT INTO "GrantMedia" (
        id, "recordType", "grantId", donor, month, district,
        title, caption, "fileName", "relativePath", "usageNote"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING;
    `;

        await pool.query(query, [
            record_id,
            record_type,
            grant_id,
            donor,
            reporting_month,
            district,
            title,
            summary_or_caption,
            file_name,
            relative_path,
            usage_note || null,
        ]);
    }

    console.log(`✅ Inserted ${rows.length} media records`);
}

// ============================
// 4. Main Runner
// ============================
async function main() {
    try {
        console.log('🔄 Starting seed process...');

        // Check if database is already seeded
        try {
            const checkRes = await pool.query('SELECT COUNT(*) FROM "SchoolMonthly"');
            const count = parseInt(checkRes.rows[0].count, 10);
            if (count > 0) {
                console.log(`✅ Database is already seeded (${count} school monthly records found). Skipping seeding.`);
                return;
            }
        } catch (err) {
            console.log('📝 Database tables not found or empty. Proceeding with schema initialization and seeding...');
        }

        console.log('📝 Initializing database schema from schema.sql...');
        const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Database schema initialized successfully.');

        // Define file paths (adjust to your actual folder structure)
        const pblDir = path.join(__dirname, '..', 'data', '02_Primary_PBL_Data', 'csv_exports');
        const grantDir = path.join(__dirname, '..', 'data', '03_Grant_Reporting_Evidence', 'csv');

        // Seed PBL data
        const pblFiles = [
            'PBL_School_Response_Data_July_2025.csv',
            'PBL_School_Response_Data_August_2025.csv',
            'PBL_School_Response_Data_September_2025.csv',
        ];

        for (const file of pblFiles) {
            const fullPath = path.join(pblDir, file);
            if (fs.existsSync(fullPath)) {
                await seedSchoolMonthly(fullPath);
            } else {
                console.warn(`⚠️ File not found: ${fullPath}`);
            }
        }

        // Seed grant data
        // Step 1: Create grant master records (from finance and performance files)
        const financeFile = path.join(grantDir, '01_Grant_Profile_and_Finance.csv');
        const performanceFile = path.join(grantDir, '02_Grant_Performance_and_Report_Material.csv');
        const mediaFile = path.join(grantDir, '03_Evidence_and_Media_Index.csv');

        if (fs.existsSync(financeFile)) {
            await seedGrantMaster(financeFile);
        } else {
            console.warn(`⚠️ Finance file not found: ${financeFile}`);
        }

        if (fs.existsSync(performanceFile)) {
            // Performance file also contains grant master info, but we already did from finance.
            // Seeding from performance file is skipped because it lacks periodStart/periodEnd columns.
            console.log('Skipping grant master seed from performance file (already seeded from finance)...');
        } else {
            console.warn(`⚠️ Performance file not found: ${performanceFile}`);
        }

        // Step 2: Seed finance
        if (fs.existsSync(financeFile)) {
            await seedGrantFinance(financeFile);
        }

        // Step 3: Seed performance
        if (fs.existsSync(performanceFile)) {
            await seedGrantPerformance(performanceFile);
        }

        // Step 4: Seed media
        if (fs.existsSync(mediaFile)) {
            await seedGrantMedia(mediaFile);
        } else {
            console.warn(`⚠️ Media file not found: ${mediaFile}`);
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the script
main();