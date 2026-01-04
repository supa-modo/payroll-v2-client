/**
 * Report Types
 */

export type PayrollReportType = "summary" | "department" | "tax" | "history" | "trends";
export type ExpenseReportType = "category" | "department" | "trends" | "top-spenders";
export type ExportFormat = "csv" | "excel" | "pdf";

export interface ReportFilters {
  startDate: string;
  endDate: string;
  departmentId?: string;
  employeeId?: string;
  categoryId?: string;
  limit?: number;
}

export interface MonthlyPayrollSummary {
  month: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalPAYE: number;
  totalNSSF: number;
  totalNHIF: number;
}

export interface DepartmentalPayrollBreakdown {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalPAYE: number;
  totalNSSF: number;
  totalNHIF: number;
}

export interface TaxSummary {
  totalPAYE: number;
  totalNSSF: number;
  totalNHIF: number;
  totalStatutory: number;
  breakdown: Array<{
    month: string;
    paye: number;
    nssf: number;
    nhif: number;
  }>;
}

export interface EmployeePayrollHistory {
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  payeAmount: number;
  nssfAmount: number;
  nhifAmount: number;
  status: string;
}

export interface PayrollTrend {
  month: string;
  totalGross: number;
  totalNet: number;
  employeeCount: number;
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  expenseCount: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

export interface ExpenseByDepartment {
  departmentId: string;
  departmentName: string;
  expenseCount: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

export interface ExpenseMonthlyTrend {
  month: string;
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
}

export interface TopSpender {
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  expenseCount: number;
  totalAmount: number;
  averageAmount: number;
}

export interface PayrollReportResponse {
  report: MonthlyPayrollSummary[] | DepartmentalPayrollBreakdown[] | TaxSummary | EmployeePayrollHistory[] | PayrollTrend[];
  type: PayrollReportType;
  startDate: string;
  endDate: string;
}

export interface ExpenseReportResponse {
  report: ExpenseByCategory[] | ExpenseByDepartment[] | ExpenseMonthlyTrend[] | TopSpender[];
  type: ExpenseReportType;
  startDate: string;
  endDate: string;
}

