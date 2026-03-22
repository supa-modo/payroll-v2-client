export type PortalPayslipStatus = "paid" | "pending";
export type PortalExpenseStatus = "pending" | "approved" | "rejected" | "paid";
export type PortalLoanStatus = "active" | "settled";

export type PortalEarningDeductionLine = {
  label: string;
  amount: number; // Positive for earnings, negative for deductions
};

export type PortalPayslip = {
  id: string;
  period: string; // e.g. "February 2025"
  year: number; // e.g. 2025
  status: PortalPayslipStatus;
  grossPay: number;
  deductions: number; // Positive number representing total deductions
  netPay: number;
  breakdown: PortalEarningDeductionLine[];
};

export type PortalSalaryRevision = {
  id: string;
  revisionDate: string; // ISO date
  period: string;
  year: number;
  previousGross: number;
  newGross: number;
  deductions: number;
  netPay: number;
  status: "paid" | "pending";
};

export type PortalLoan = {
  id: string;
  loanType: string;
  status: PortalLoanStatus;
  original: number;
  repaid: number;
  balance: number;
  monthly: number;
  startDate: string;
  endDate: string;
  installments: { total: number; paid: number; remaining: number };
  purpose: string;
};

export type PortalExpense = {
  id: string;
  desc: string;
  category: string;
  date: string; // e.g. "15 Feb 2025"
  amount: number;
  status: PortalExpenseStatus;
};

export type PortalProfile = {
  employeeId: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  office: string;
  kraPin: string;
  nationalId: string;
  phone: string;
  bankName: string;
  bankLocation: string;
  bankAccountMasked: string; // e.g. "•••• 4821"
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
};

const baseEarnings: PortalEarningDeductionLine[] = [
  { label: "Basic", amount: 200000 },
  { label: "House Allow.", amount: 40000 },
  { label: "Transport", amount: 25000 },
  { label: "Medical Allow.", amount: 15000 },
  { label: "Airtime Allow.", amount: 5000 },
];

const baseDeductions: PortalEarningDeductionLine[] = [
  { label: "PAYE Tax", amount: -38400 },
  { label: "NHIF", amount: -1700 },
  { label: "NSSF", amount: -200 },
];

export const dummyPayslips: PortalPayslip[] = [
  {
    id: "PL-2025-02",
    period: "February 2025",
    year: 2025,
    status: "paid",
    grossPay: 285000,
    deductions: 72600,
    netPay: 212400,
    breakdown: [...baseEarnings, ...baseDeductions],
  },
  {
    id: "PL-2025-01",
    period: "January 2025",
    year: 2025,
    status: "paid",
    grossPay: 285000,
    deductions: 72600,
    netPay: 212400,
    breakdown: [...baseEarnings, ...baseDeductions],
  },
  {
    id: "PL-2024-12",
    period: "December 2024",
    year: 2024,
    status: "paid",
    grossPay: 260000,
    deductions: 64400,
    netPay: 195600,
    breakdown: [
      { label: "Basic", amount: 185000 },
      { label: "House Allow.", amount: 42000 },
      { label: "Transport", amount: 24000 },
      { label: "Medical Allow.", amount: 12000 },
      { label: "Airtime Allow.", amount: 5000 },
      { label: "PAYE Tax", amount: -34000 },
      { label: "NHIF", amount: -1500 },
      { label: "NSSF", amount: -2900 },
    ],
  },
  {
    id: "PL-2024-11",
    period: "November 2024",
    year: 2024,
    status: "paid",
    grossPay: 260000,
    deductions: 64400,
    netPay: 195600,
    breakdown: [
      { label: "Basic", amount: 185000 },
      { label: "House Allow.", amount: 42000 },
      { label: "Transport", amount: 24000 },
      { label: "Medical Allow.", amount: 12000 },
      { label: "Airtime Allow.", amount: 5000 },
      { label: "PAYE Tax", amount: -34000 },
      { label: "NHIF", amount: -1500 },
      { label: "NSSF", amount: -2900 },
    ],
  },
  {
    id: "PL-2024-10",
    period: "October 2024",
    year: 2024,
    status: "paid",
    grossPay: 260000,
    deductions: 64400,
    netPay: 195600,
    breakdown: [
      { label: "Basic", amount: 185000 },
      { label: "House Allow.", amount: 42000 },
      { label: "Transport", amount: 24000 },
      { label: "Medical Allow.", amount: 12000 },
      { label: "Airtime Allow.", amount: 5000 },
      { label: "PAYE Tax", amount: -34000 },
      { label: "NHIF", amount: -1500 },
      { label: "NSSF", amount: -2900 },
    ],
  },
  {
    id: "PL-2025-03",
    period: "March 2025",
    year: 2025,
    status: "pending",
    grossPay: 285000,
    deductions: 72600,
    netPay: 212400,
    breakdown: [...baseEarnings, ...baseDeductions],
  },
];

export const dummySalaryRevisions: PortalSalaryRevision[] = [
  {
    id: "SR-2025-03",
    revisionDate: "2025-03-01",
    period: "March 2025",
    year: 2025,
    previousGross: 265000,
    newGross: 285000,
    deductions: 72600,
    netPay: 212400,
    status: "pending",
  },
  {
    id: "SR-2025-01",
    revisionDate: "2025-01-01",
    period: "January 2025",
    year: 2025,
    previousGross: 260000,
    newGross: 285000,
    deductions: 72600,
    netPay: 212400,
    status: "paid",
  },
  {
    id: "SR-2024-12",
    revisionDate: "2024-12-01",
    period: "December 2024",
    year: 2024,
    previousGross: 240000,
    newGross: 260000,
    deductions: 64400,
    netPay: 195600,
    status: "paid",
  },
  {
    id: "SR-2024-10",
    revisionDate: "2024-10-01",
    period: "October 2024",
    year: 2024,
    previousGross: 235000,
    newGross: 260000,
    deductions: 64400,
    netPay: 195600,
    status: "paid",
  },
];

export const dummyLoans: PortalLoan[] = [
  {
    id: "LN-2024-0031",
    loanType: "Personal Development Loan",
    status: "active",
    original: 150000,
    repaid: 108000,
    balance: 42000,
    monthly: 14000,
    startDate: "1 Apr 2024",
    endDate: "31 Jun 2025",
    installments: { total: 12, paid: 8, remaining: 3 },
    purpose: "Professional certification courses",
  },
  {
    id: "LN-2022-0014",
    loanType: "Emergency Medical Loan",
    status: "settled",
    original: 80000,
    repaid: 80000,
    balance: 0,
    monthly: 0,
    startDate: "1 Mar 2022",
    endDate: "28 Feb 2023",
    installments: { total: 12, paid: 12, remaining: 0 },
    purpose: "Medical expenses",
  },
];

export const dummyExpenses: PortalExpense[] = [
  {
    id: "EX-0041",
    desc: "Flight to Mombasa — Team Offsite",
    category: "Travel",
    date: "15 Feb 2025",
    amount: 12500,
    status: "pending",
  },
  {
    id: "EX-0040",
    desc: "Client Lunch — Westlands",
    category: "Entertainment",
    date: "10 Feb 2025",
    amount: 6000,
    status: "pending",
  },
  {
    id: "EX-0039",
    desc: "Online Course Subscription",
    category: "Training",
    date: "2 Feb 2025",
    amount: 4200,
    status: "approved",
  },
  {
    id: "EX-0038",
    desc: "Uber to Client Meeting",
    category: "Travel",
    date: "28 Jan 2025",
    amount: 1400,
    status: "paid",
  },
  {
    id: "EX-0034",
    desc: "Conference Registration",
    category: "Training",
    date: "5 Jan 2025",
    amount: 15000,
    status: "rejected",
  },
];

export const dummyProfile: PortalProfile = {
  employeeId: "EMP-00247",
  department: "Engineering Department",
  jobTitle: "Senior Software Engineer",
  employmentType: "Permanent",
  office: "Nairobi Office",
  kraPin: "A003928475W",
  nationalId: "29485763",
  phone: "+254 712 345 678",
  bankName: "Equity Bank",
  bankLocation: "Nairobi CBD",
  bankAccountMasked: "•••• •••• 4821",
  emergencyContactName: "James Mwangi",
  emergencyContactRelationship: "Spouse",
  emergencyContactPhone: "+254 722 987 654",
};

export const dummyMonthsForSelect = ["All Years", "2025", "2024", "2023"] as const;

