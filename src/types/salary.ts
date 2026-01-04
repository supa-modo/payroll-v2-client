/**
 * Salary-related TypeScript interfaces
 */

export interface SalaryComponent {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: "earning" | "deduction";
  category: string;
  calculationType: "fixed" | "percentage";
  defaultAmount?: number | null;
  percentageOf?: string | null;
  percentageValue?: number | null;
  isTaxable: boolean;
  isStatutory: boolean;
  statutoryType?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryComponentInput {
  name: string;
  code: string;
  type: "earning" | "deduction";
  category: string;
  calculationType?: "fixed" | "percentage";
  defaultAmount?: number | null;
  percentageOf?: string | null;
  percentageValue?: number | null;
  isTaxable?: boolean;
  isStatutory?: boolean;
  statutoryType?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateSalaryComponentInput extends Partial<CreateSalaryComponentInput> {}

export interface EmployeeSalaryComponent {
  id: string;
  employeeId: string;
  salaryComponentId: string;
  amount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  salaryComponent?: SalaryComponent;
}

export interface EmployeeSalary {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  salaryComponents: EmployeeSalaryComponent[];
  totals: {
    earnings: number;
    deductions: number;
    grossPay: number;
    netPay: number;
  };
}

export interface SalaryRevisionHistory {
  id: string;
  employeeId: string;
  revisionDate: string;
  previousGross?: number | null;
  newGross: number;
  changePercentage?: number | null;
  reason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  componentChanges: Record<string, any>;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export interface CreateSalaryRevisionInput {
  effectiveFrom: string;
  reason: string;
  components?: Array<{
    salaryComponentId: string;
    amount: number;
    effectiveTo?: string | null;
  }>;
}

export interface AssignSalaryComponentsInput {
  components: Array<{
    salaryComponentId: string;
    amount: number;
    effectiveTo?: string | null;
  }>;
  effectiveFrom?: string;
  reason?: string;
}

