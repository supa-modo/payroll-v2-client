/**
 * Expense-related TypeScript interfaces
 */

export interface ExpenseCategory {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  monthlyBudget?: number | null;
  requiresReceipt: boolean;
  maxAmount?: number | null;
  requiresManagerApproval: boolean;
  requiresFinanceApproval: boolean;
  autoApproveBelow?: number | null;
  glAccountCode?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryInput {
  name: string;
  code: string;
  description?: string | null;
  monthlyBudget?: number | null;
  requiresReceipt?: boolean;
  maxAmount?: number | null;
  requiresManagerApproval?: boolean;
  requiresFinanceApproval?: boolean;
  autoApproveBelow?: number | null;
  glAccountCode?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface Expense {
  id: string;
  tenantId: string;
  employeeId: string;
  categoryId: string;
  departmentId?: string | null;
  expenseNumber: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInBaseCurrency?: number | null;
  expenseDate: string;
  status: "draft" | "submitted" | "pending_manager" | "pending_finance" | "approved" | "rejected" | "paid" | "cancelled";
  submittedAt?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  paidAt?: string | null;
  paidBy?: string | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  hasReceipt: boolean;
  receiptVerified: boolean;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  category?: ExpenseCategory;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  documents?: ExpenseDocument[];
  approvals?: ExpenseApproval[];
}

export interface CreateExpenseInput {
  categoryId: string;
  departmentId?: string | null;
  title: string;
  description?: string | null;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  expenseDate: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface ExpenseDocument {
  id: string;
  expenseId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface ExpenseApproval {
  id: string;
  expenseId: string;
  approvalLevel: string;
  approverId: string;
  action: "approved" | "rejected" | "returned";
  comments?: string | null;
  actedAt: string;
  approver?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface SubmitExpenseInput {
  expenseId: string;
}

export interface ApproveExpenseInput {
  comments?: string | null;
  approvalLevel?: "manager" | "finance";
}

export interface RejectExpenseInput {
  reason: string;
  comments?: string | null;
}

export interface MarkExpensePaidInput {
  paymentReference?: string | null;
  paymentMethod?: string | null;
}

