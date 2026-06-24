// ============================
// API Response Types
// ============================

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

// ============================
// School Monthly Types
// ============================

export interface SchoolMonthly {
  id: string;
  month: string;
  timestamp: string;
  schoolName: string;
  schoolCode: string;
  district: string;
  block: string;
  wasConducted: boolean;
  evidenceSubmitted: boolean;
  classesConducted: string;
  subject: string;
  enrollmentClass6: number;
  attendanceSci6: number;
  attendanceMath6: number;
  enrollmentClass7: number;
  attendanceSci7: number;
  attendanceMath7: number;
  enrollmentClass8: number;
  attendanceSci8: number;
  attendanceMath8: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  riskStatus: string;
}

export interface SchoolSummary {
  totalRecords: string;
  totalSchools: string;
  totalDistricts: string;
  totalBlocks: string;
  avgAttendanceRate: string;
  totalEnrollment: string;
  totalAttendance: string;
  schoolsConducted: string;
  schoolsWithEvidence: string;
  onTrack: string;
  behind: string;
  atRisk: string;
  critical: string;
}

export interface TrendData {
  month: string;
  totalRecords: string;
  avgAttendanceRate: string;
  totalEnrollment: string;
  totalAttendance: string;
  schoolsConducted: string;
  schoolsWithEvidence: string;
  onTrack: string;
  behind: string;
  atRisk: string;
  critical: string;
}

export interface RiskDistribution {
  riskStatus: string;
  count: string;
  percentage: string;
}

// ============================
// Grant Types
// ============================

export interface Grant {
  id: string;
  donor: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  coveredDistricts: string;
  financeRecords: string;
  performanceRecords: string;
  mediaRecords: string;
}

export interface GrantDetail extends Grant {
  finance: GrantFinance[];
  performance: GrantPerformance[];
  media: GrantMedia[];
}

export interface GrantFinance {
  id: string;
  grantId: string;
  month: string;
  budgetLine: string;
  approvedBudget: number;
  monthlyUtilized: number;
  cumulativeUtilized: number;
  utilizationRate: number;
  note: string | null;
}

export interface GrantPerformance {
  id: string;
  grantId: string;
  month: string;
  periodEnd: string;
  reportDue: string;
  reportStatus: string;
  coveredDistricts: string;
  sampledSchools: number;
  schoolsCompleted: number;
  completionRate: number;
  schoolsWithEvidence: number;
  evidenceRate: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  riskStatus: string;
  milestoneSummary: string;
  draftReportText: string;
}

export interface GrantMedia {
  id: string;
  recordType: string;
  grantId: string;
  donor: string;
  month: string;
  district: string;
  title: string;
  caption: string;
  fileName: string;
  relativePath: string;
  usageNote: string | null;
}

export interface GrantSummary {
  totalGrants: number;
  finance: {
    avgUtilizationRate: string;
    totalApprovedBudget: string;
    totalUtilized: string;
  };
  performance: {
    avgCompletionRate: string;
    avgEvidenceRate: string;
    avgAttendanceRate: string;
    onTrack: string;
    behind: string;
    atRisk: string;
    critical: string;
  };
}

export interface FinanceSummaryRow {
  month: string;
  totalApprovedBudget: string;
  totalMonthlyUtilized: string;
  totalCumulativeUtilized: string;
  avgUtilizationRate: string;
}
