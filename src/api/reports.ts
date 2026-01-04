/**
 * Reports API
 */

import api from "../services/api";
import {
  PayrollReportType,
  ExpenseReportType,
  ReportFilters,
  PayrollReportResponse,
  ExpenseReportResponse,
} from "../types/report";

/**
 * Get payroll reports
 */
export async function getPayrollReports(
  type: PayrollReportType,
  filters: ReportFilters
): Promise<PayrollReportResponse> {
  const params = new URLSearchParams({
    type,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.departmentId) {
    params.append("departmentId", filters.departmentId);
  }

  if (filters.employeeId) {
    params.append("employeeId", filters.employeeId);
  }

  const response = await api.get(`/reports/payroll?${params.toString()}`);
  return response.data;
}

/**
 * Get expense reports
 */
export async function getExpenseReports(
  type: ExpenseReportType,
  filters: ReportFilters
): Promise<ExpenseReportResponse> {
  const params = new URLSearchParams({
    type,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.categoryId) {
    params.append("categoryId", filters.categoryId);
  }

  if (filters.departmentId) {
    params.append("departmentId", filters.departmentId);
  }

  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  const response = await api.get(`/reports/expenses?${params.toString()}`);
  return response.data;
}

/**
 * Export report
 */
export async function exportReport(
  reportType: string,
  format: "csv" | "excel" | "pdf",
  filters: ReportFilters
): Promise<Blob> {
  const params = new URLSearchParams({
    reportType,
    format,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.departmentId) {
    params.append("departmentId", filters.departmentId);
  }

  if (filters.employeeId) {
    params.append("employeeId", filters.employeeId);
  }

  if (filters.categoryId) {
    params.append("categoryId", filters.categoryId);
  }

  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  const response = await api.get(`/reports/export?${params.toString()}`, {
    responseType: "blob",
  });

  return response.data;
}

