import axios from 'axios';
import type {
  ApiResponse,
  ApiListResponse,
  PaginatedResponse,
  SchoolMonthly,
  SchoolSummary,
  TrendData,
  RiskDistribution,
  Grant,
  GrantDetail,
  GrantFinance,
  GrantPerformance,
  GrantMedia,
  GrantSummary,
  FinanceSummaryRow,
} from '../types';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || '/api',
  timeout: 15000,
});

// ============================
// School Monthly API
// ============================

export interface SchoolFilters {
  month?: string;
  district?: string;
  block?: string;
  riskStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchSchools(filters: SchoolFilters = {}) {
  const { data } = await api.get<PaginatedResponse<SchoolMonthly>>('/schools', { params: filters });
  return data;
}

export async function fetchSchoolsSummary(filters: { month?: string; district?: string } = {}) {
  const { data } = await api.get<ApiResponse<SchoolSummary>>('/schools/summary', { params: filters });
  return data.data;
}

export async function fetchTrends(filters: { district?: string; block?: string } = {}) {
  const { data } = await api.get<ApiListResponse<TrendData>>('/schools/trends', { params: filters });
  return data.data;
}

export async function fetchRiskDistribution(filters: { month?: string; district?: string } = {}) {
  const { data } = await api.get<ApiListResponse<RiskDistribution>>('/schools/risk-distribution', { params: filters });
  return data.data;
}

export async function fetchDistricts() {
  const { data } = await api.get<ApiListResponse<string>>('/schools/districts');
  return data.data;
}

export async function fetchBlocks(district?: string) {
  const { data } = await api.get<ApiListResponse<string>>('/schools/blocks', { params: district ? { district } : {} });
  return data.data;
}

export async function fetchMonths() {
  const { data } = await api.get<ApiListResponse<string>>('/schools/months');
  return data.data;
}

// ============================
// Grant API
// ============================

export async function fetchGrants() {
  const { data } = await api.get<ApiListResponse<Grant>>('/grants');
  return data.data;
}

export async function fetchGrantById(id: string) {
  const { data } = await api.get<ApiResponse<GrantDetail>>(`/grants/${id}`);
  return data.data;
}

export async function fetchGrantFinance(id: string, month?: string) {
  const { data } = await api.get<{ success: boolean; data: GrantFinance[]; summary: FinanceSummaryRow[] }>(
    `/grants/${id}/finance`,
    { params: month ? { month } : {} }
  );
  return data;
}

export async function fetchGrantPerformance(id: string, month?: string) {
  const { data } = await api.get<ApiListResponse<GrantPerformance>>(
    `/grants/${id}/performance`,
    { params: month ? { month } : {} }
  );
  return data.data;
}

export async function fetchGrantMedia(id: string, month?: string) {
  const { data } = await api.get<ApiListResponse<GrantMedia>>(
    `/grants/${id}/media`,
    { params: month ? { month } : {} }
  );
  return data.data;
}

export async function fetchGrantsSummary() {
  const { data } = await api.get<ApiResponse<GrantSummary>>('/grants/summary');
  return data.data;
}

export default api;
