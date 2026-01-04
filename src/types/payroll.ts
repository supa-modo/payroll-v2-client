/**
 * Payroll-related TypeScript interfaces
 */

export interface PayrollPeriod {
  id: string;
  tenantId: string;
  name: string;
  periodType: "monthly" | "bi-weekly" | "weekly" | "custom";
  startDate: string;
  endDate: string;
  payDate: string;
  status: "draft" | "processing" | "pending_approval" | "approved" | "paid" | "locked";
  lockedAt?: string | null;
  lockedBy?: string | null;
  processedAt?: string | null;
  processedBy?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollPeriodInput {
  name: string;
  periodType: "monthly" | "bi-weekly" | "weekly" | "custom";
  startDate: string;
  endDate: string;
  payDate: string;
}

export interface Payroll {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  paymentMethod?: string | null;
  bankAccount?: string | null;
  mpesaPhone?: string | null;
  grossPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  payeAmount: number;
  nssfAmount: number;
  nhifAmount: number;
  status: string;
  paidAt?: string | null;
  paymentReference?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    jobTitle?: string;
  };
  payrollPeriod?: PayrollPeriod;
  items?: PayrollItem[];
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  salaryComponentId?: string | null;
  name: string;
  type: string;
  category: string;
  amount: number;
  calculationDetails?: Record<string, any> | null;
  createdAt: string;
}

export interface Payslip {
  id: string;
  payrollId: string;
  payslipNumber: string;
  filePath: string;
  generatedAt: string;
  generatedBy?: string | null;
  firstViewedAt?: string | null;
  downloadCount: number;
  payroll?: Payroll;
}

export interface PayrollSummary {
  period: PayrollPeriod;
  summary: {
    totalEmployees: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    payrolls: Array<{
      id: string;
      employee: {
        id: string;
        firstName: string;
        lastName: string;
        employeeNumber: string;
      };
      grossPay: number;
      totalDeductions: number;
      netPay: number;
      status: string;
    }>;
  };
}

