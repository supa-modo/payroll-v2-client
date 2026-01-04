/**
 * Loan-related TypeScript types
 */

export interface EmployeeLoan {
  id: string;
  tenantId: string;
  employeeId: string;
  loanType: string;
  loanNumber: string;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  repaymentStartDate: string;
  monthlyDeduction: number;
  remainingBalance: number;
  totalPaid: number;
  status: "pending" | "active" | "completed" | "written_off";
  reason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  repayments?: LoanRepayment[];
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  payrollId?: string | null;
  amount: number;
  repaymentDate: string;
  paymentType: "payroll" | "manual";
  balanceAfter: number;
  notes?: string | null;
  createdAt: string;
  createdBy?: string | null;
  loan?: EmployeeLoan;
  payroll?: {
    id: string;
    payrollPeriodId: string;
  };
}

export interface CreateLoanInput {
  employeeId: string;
  loanType: string;
  principalAmount: number;
  interestRate?: number;
  repaymentStartDate: string;
  monthlyDeduction: number;
  reason?: string;
}

export interface UpdateLoanInput {
  loanType?: string;
  principalAmount?: number;
  interestRate?: number;
  repaymentStartDate?: string;
  monthlyDeduction?: number;
  reason?: string;
}

export interface CreateLoanRepaymentInput {
  amount: number;
  repaymentDate?: string;
  notes?: string;
}

export interface LoansResponse {
  loans: EmployeeLoan[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface LoanRepaymentsResponse {
  repayments: LoanRepayment[];
}

