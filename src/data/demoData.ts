import { FiAlertCircle, FiCheckCircle, FiDollarSign, FiUserPlus } from "react-icons/fi";
import type { PayrollPeriod } from "@/types/payroll";

export const demoDashboardStats = {
  totalEmployees: 247,
  totalDepartments: 12,
  monthlyPayroll: 52400000,
  pendingActions: 19,
};

export const demoDepartmentPayroll = [
  { name: "Engineering", amount: 14800000, pct: 28, color: "#2563eb" },
  { name: "Sales", amount: 10500000, pct: 20, color: "#0891b2" },
  { name: "Finance", amount: 7350000, pct: 14, color: "#7c3aed" },
  { name: "Operations", amount: 6280000, pct: 12, color: "#059669" },
  { name: "HR & Admin", amount: 5240000, pct: 10, color: "#d97706" },
  { name: "IT", amount: 4714000, pct: 9, color: "#0284c7" },
  { name: "Marketing", amount: 3534000, pct: 7, color: "#db2777" },
];

export const demoPayrollTrend = [
  { m: "Aug", v: 46.2 }, { m: "Sep", v: 47.1 }, { m: "Oct", v: 46.8 },
  { m: "Nov", v: 47.5 }, { m: "Dec", v: 48.9 }, { m: "Jan", v: 49.8 },
  { m: "Feb", v: 51.4 }, { m: "Mar", v: 52.4 },
];

export const demoActivityLog = [
  { type: "success", icon: FiCheckCircle, title: "March payroll processed", meta: "247 employees · KES 38.7M disbursed", time: "2 min ago" },
  { type: "info", icon: FiUserPlus, title: "New employee onboarded", meta: "Engineering — Senior Dev", time: "1h ago" },
  { type: "warn", icon: FiAlertCircle, title: "Expense pending review", meta: "KES 45,000 · Travel & Accommodation", time: "3h ago" },
  { type: "success", icon: FiCheckCircle, title: "Loan approved", meta: "Staff loan · KES 120,000", time: "5h ago" },
  { type: "info", icon: FiDollarSign, title: "Salary structure updated", meta: "Housing allowance revised upward", time: "1d ago" },
] as const;

export const demoApprovalQueue = [
  { name: "Esther Wambui", detail: "Housing Loan · KES 150,000", type: "loan", urgency: "high" },
  { name: "Amina Mwangi", detail: "Personal Loan · KES 80,000", type: "loan", urgency: "medium" },
  { name: "Brian Odhiambo", detail: "Client Lunch · KES 18,000", type: "expense", urgency: "medium" },
  { name: "Daniel Kiprono", detail: "Conference Reg. · KES 45,000", type: "expense", urgency: "high" },
] as const;

export const demoWorkforceSegments = [
  { label: "Permanent", count: 168, pct: 68, color: "#2563eb" },
  { label: "Contract", count: 40, pct: 16, color: "#0891b2" },
  { label: "Part-Time", count: 25, pct: 10, color: "#d97706" },
  { label: "Intern", count: 14, pct: 6, color: "#e2e8f0" },
];

const now = new Date().toISOString();

export const demoPayrollPeriods: PayrollPeriod[] = [
  { id: "1", tenantId: "demo-tenant", name: "March 2025", periodType: "monthly", startDate: "2025-03-01", endDate: "2025-03-31", payDate: "2025-03-31", status: "draft", totalEmployees: 247, totalNet: 39683900, totalGross: 52418300, totalDeductions: 12734400, createdAt: now, updatedAt: now },
  { id: "2", tenantId: "demo-tenant", name: "February 2025", periodType: "monthly", startDate: "2025-02-01", endDate: "2025-02-28", payDate: "2025-02-28", status: "locked", totalEmployees: 244, totalNet: 38920000, totalGross: 51200000, totalDeductions: 12280000, createdAt: now, updatedAt: now },
  { id: "3", tenantId: "demo-tenant", name: "January 2025", periodType: "monthly", startDate: "2025-01-01", endDate: "2025-01-31", payDate: "2025-01-31", status: "locked", totalEmployees: 241, totalNet: 38600000, totalGross: 50800000, totalDeductions: 12200000, createdAt: now, updatedAt: now },
  { id: "4", tenantId: "demo-tenant", name: "December 2024", periodType: "monthly", startDate: "2024-12-01", endDate: "2024-12-31", payDate: "2024-12-31", status: "locked", totalEmployees: 238, totalNet: 42100000, totalGross: 55400000, totalDeductions: 13300000, createdAt: now, updatedAt: now },
  { id: "5", tenantId: "demo-tenant", name: "November 2024", periodType: "monthly", startDate: "2024-11-01", endDate: "2024-11-30", payDate: "2024-11-30", status: "locked", totalEmployees: 235, totalNet: 35800000, totalGross: 47200000, totalDeductions: 11400000, createdAt: now, updatedAt: now },
  { id: "6", tenantId: "demo-tenant", name: "April 2025", periodType: "monthly", startDate: "2025-04-01", endDate: "2025-04-30", payDate: "2025-04-30", status: "pending_approval", totalEmployees: 0, totalNet: 0, totalGross: 0, totalDeductions: 0, createdAt: now, updatedAt: now },
];

export const demoPayrollExceptions = [
  { id: "e1", employee: "Hassan Omar", employeeId: "EMP-00240", issue: "Missing bank account details", severity: "error" },
  { id: "e2", employee: "Ivy Mukami", employeeId: "EMP-00239", issue: "Missing KRA PIN — tax cannot be calculated", severity: "error" },
  { id: "e3", employee: "EMP-00231", employeeId: "EMP-00231", issue: "Negative net pay due to loan deduction", severity: "warning" },
  { id: "e4", employee: "James Kariuki", employeeId: "EMP-00225", issue: "New hire — pending onboarding documents", severity: "warning" },
] as const;

export const demoPayrollSummary = [
  { label: "Basic Salaries", employees: 247, amount: 36820000, type: "earning" },
  { label: "Housing Allowances", employees: 198, amount: 7920000, type: "earning" },
  { label: "Transport Allowances", employees: 247, amount: 4940000, type: "earning" },
  { label: "Medical Allowances", employees: 210, amount: 2738300, type: "earning" },
  { label: "PAYE Tax", employees: 247, amount: 9100000, type: "deduction" },
  { label: "NHIF Contributions", employees: 247, amount: 419000, type: "deduction" },
  { label: "NSSF Contributions", employees: 247, amount: 49400, type: "deduction" },
  { label: "Loan Deductions", employees: 38, amount: 2856000, type: "deduction" },
  { label: "Salary Advances", employees: 5, amount: 310000, type: "deduction" },
] as const;
