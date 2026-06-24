--Enable UUID generation extension(required for default UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to support schema updates
DROP TABLE IF EXISTS "GrantMedia" CASCADE;
DROP TABLE IF EXISTS "GrantPerformance" CASCADE;
DROP TABLE IF EXISTS "GrantFinance" CASCADE;
DROP TABLE IF EXISTS "Grant" CASCADE;
DROP TABLE IF EXISTS "SchoolMonthly" CASCADE;


-- ==============================================
--1. PBL SCHOOL RESPONSE DATA(Core Dashboard)
-- ==============================================

CREATE TABLE "SchoolMonthly"(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month VARCHAR(10) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    district TEXT NOT NULL,
    block TEXT NOT NULL,
    "wasConducted" BOOLEAN NOT NULL,
    "evidenceSubmitted" BOOLEAN NOT NULL,
    "classesConducted" TEXT NOT NULL,
    subject TEXT NOT NULL,
    "enrollmentClass6" INTEGER NOT NULL,
    "attendanceSci6" INTEGER NOT NULL,
    "attendanceMath6" INTEGER NOT NULL,
    "enrollmentClass7" INTEGER NOT NULL,
    "attendanceSci7" INTEGER NOT NULL,
    "attendanceMath7" INTEGER NOT NULL,
    "enrollmentClass8" INTEGER NOT NULL,
    "attendanceSci8" INTEGER NOT NULL,
    "attendanceMath8" INTEGER NOT NULL,
    "totalEnrollment" INTEGER NOT NULL,
    "totalAttendance" INTEGER NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "riskStatus" TEXT NOT NULL
);

--Indexes for fast filtering on common query patterns
CREATE UNIQUE INDEX "SchoolMonthly_month_schoolCode_key" ON "SchoolMonthly"(month, "schoolCode");
CREATE INDEX "SchoolMonthly_month_idx" ON "SchoolMonthly"(month);
CREATE INDEX "SchoolMonthly_district_idx" ON "SchoolMonthly"(district);
CREATE INDEX "SchoolMonthly_block_idx" ON "SchoolMonthly"(block);
CREATE INDEX "SchoolMonthly_month_district_idx" ON "SchoolMonthly"(month, district);
CREATE INDEX "SchoolMonthly_month_district_block_idx" ON "SchoolMonthly"(month, district, block);

-- ==============================================
--2. GRANT REPORTING EVIDENCE DATA
-- ==============================================

--Master Grants table
CREATE TABLE "Grant"(
    id TEXT PRIMARY KEY,
    donor TEXT NOT NULL,
    name TEXT NOT NULL,
    "periodStart" TIMESTAMPTZ NOT NULL,
    "periodEnd" TIMESTAMPTZ NOT NULL,
    "coveredDistricts" TEXT NOT NULL, --semicolon - separated list, e.g., "District T; District G"
    CONSTRAINT "Grant_donor_name_key" UNIQUE(donor, name)
);

--Grant Finance(from 01_Grant_Profile_and_Finance.csv)
CREATE TABLE "GrantFinance"(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "grantId" TEXT NOT NULL REFERENCES "Grant"(id) ON DELETE CASCADE,
    month VARCHAR(10) NOT NULL,
    "budgetLine" TEXT NOT NULL,
    "approvedBudget" INTEGER NOT NULL,
    "monthlyUtilized" INTEGER NOT NULL,
    "cumulativeUtilized" INTEGER NOT NULL,
    "utilizationRate" DOUBLE PRECISION NOT NULL,
    note TEXT,
    CONSTRAINT "GrantFinance_grantId_month_budgetLine_key" UNIQUE("grantId", month, "budgetLine")
);

CREATE INDEX "GrantFinance_grantId_idx" ON "GrantFinance"("grantId");
CREATE INDEX "GrantFinance_month_idx" ON "GrantFinance"(month);

--Grant Performance(from 02_Grant_Performance_and_Report_Material.csv)
CREATE TABLE "GrantPerformance"(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "grantId" TEXT NOT NULL REFERENCES "Grant"(id) ON DELETE CASCADE,
    month VARCHAR(10) NOT NULL,
    "periodEnd" TIMESTAMPTZ NOT NULL,
    "reportDue" TIMESTAMPTZ NOT NULL,
    "reportStatus" TEXT NOT NULL,
    "coveredDistricts" TEXT NOT NULL,
    "sampledSchools" INTEGER NOT NULL,
    "schoolsCompleted" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "schoolsWithEvidence" INTEGER NOT NULL,
    "evidenceRate" DOUBLE PRECISION NOT NULL,
    "totalEnrollment" INTEGER NOT NULL,
    "totalAttendance" INTEGER NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "riskStatus" TEXT NOT NULL,
    "milestoneSummary" TEXT NOT NULL,
    "draftReportText" TEXT NOT NULL,
    CONSTRAINT "GrantPerformance_grantId_month_key" UNIQUE("grantId", month)
);

CREATE INDEX "GrantPerformance_grantId_idx" ON "GrantPerformance"("grantId");
CREATE INDEX "GrantPerformance_month_idx" ON "GrantPerformance"(month);

--Evidence & Media(from 03_Evidence_and_Media_Index.csv)
CREATE TABLE "GrantMedia"(
    id TEXT PRIMARY KEY,
    "recordType" TEXT NOT NULL, -- 'image' or 'news_clipping'
    "grantId" TEXT NOT NULL REFERENCES "Grant"(id) ON DELETE CASCADE,
    donor TEXT NOT NULL,
    month VARCHAR(10) NOT NULL,
    district TEXT NOT NULL,
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "usageNote" TEXT
);

CREATE INDEX "GrantMedia_grantId_idx" ON "GrantMedia"("grantId");
CREATE INDEX "GrantMedia_month_idx" ON "GrantMedia"(month);
CREATE INDEX "GrantMedia_grantId_month_idx" ON "GrantMedia"("grantId", month);

-- ==============================================
--3. OPTIONAL: ADD TABLE COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE "SchoolMonthly" IS 'PBL school response data aggregated by month';
COMMENT ON COLUMN "SchoolMonthly"."month" IS 'Reporting month, e.g., 2025-07';
COMMENT ON COLUMN "SchoolMonthly"."riskStatus" IS 'On Track, Behind, At Risk, or Critical';
COMMENT ON TABLE "Grant" IS 'Master list of grants';
COMMENT ON TABLE "GrantFinance" IS 'Budget and finance data per grant per month';
COMMENT ON TABLE "GrantPerformance" IS 'Performance metrics per grant per month';
COMMENT ON TABLE "GrantMedia" IS 'Evidence and media assets linked to grants';