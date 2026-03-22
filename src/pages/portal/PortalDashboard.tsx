import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { dummyExpenses, dummyLoans, dummyPayslips } from "./portalDummyData";
import { usePortalToast } from "../../components/layouts/EmployeePortalLayout";
import {
  PayslipModal,
  ProgressBar,
  SectionHeader,
  StatCard,
  StatusBadge,
} from "./portalComponents/portalUi";
import clsx from "clsx";
import {
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiAlertCircle,
  FiDownload,
  FiChevronRight,
} from "react-icons/fi";

const formatKES = (n: number) => `KES ${Math.round(n).toLocaleString()}`;

const pickCategoryColor = (status: string) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "bg-primary-50 text-primary-700 border-primary-100";
  if (s === "approved" || s === "paid") return "bg-secondary-50 text-secondary-700 border-secondary-100";
  if (s === "rejected") return "bg-red-50 text-red-600 border-red-100";
  return "bg-gray-50 text-gray-600 border-gray-100";
};

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const pushToast = usePortalToast();

  const latestPayslip = dummyPayslips[0];
  const previousPayslip = dummyPayslips[1];
  const latestNet = Number(latestPayslip?.netPay || 0);
  const prevNet = Number(previousPayslip?.netPay || 0);
  const payDiff =
    prevNet > 0 ? (((latestNet - prevNet) / prevNet) * 100).toFixed(1) : null;

  const activeLoan = dummyLoans.find((l) => l.status === "active") || dummyLoans[0];
  const loanPct =
    activeLoan.original > 0
      ? Math.min(100, Math.round((activeLoan.repaid / activeLoan.original) * 100))
      : 0;

  const pendingCount = dummyExpenses.filter((e) => e.status === "pending").length;

  const recentExpenses = useMemo(() => dummyExpenses.slice(0, 3), []);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipForModal, setPayslipForModal] = useState(latestPayslip);

  const openPayslip = (p: typeof latestPayslip) => {
    setPayslipForModal(p);
    setIsPayslipModalOpen(true);
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            Your <em className="not-italic text-primary-700">Overview</em>
          </>
        }
        meta="March 2025 · Pay Period Active"
        action={
          <span className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2.5 shadow-sm">
            <FiFileText className="w-4 h-4 text-primary-700" />
            <span className="text-[12px] font-black text-gray-900">Last updated:</span>
            <span className="text-[12px] font-bold text-gray-500">Today, 09:15 AM</span>
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          accent="primary"
          icon={<FiDollarSign className="w-5 h-5" />}
          value={formatKES(285000)}
          label="Gross Monthly Salary"
          change={<span className="font-bold">Up 8.3% from last year</span>}
        />
        <StatCard
          accent="secondary"
          icon={<FiCreditCard className="w-5 h-5" />}
          value={formatKES(212400)}
          label="Net Take-Home"
          change={<span className="font-bold">This month</span>}
        />
        <StatCard
          accent="primary"
          icon={<FiCreditCard className="w-5 h-5" />}
          value="1 Active"
          label="Outstanding Loan"
          change={<span className="font-bold">{formatKES(42000)} remaining</span>}
        />
        <StatCard
          accent="primary"
          icon={<FiAlertCircle className="w-5 h-5" />}
          value={formatKES(18500)}
          label="Pending Expenses"
          change={<span className="font-bold">{pendingCount} awaiting approval</span>}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Latest payslip preview */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                  Latest Payslip
                </p>
                <div className="text-[12px] text-gray-500 font-semibold mt-0.5">
                  {latestPayslip.period}
                </div>
              </div>
              <StatusBadge status={latestPayslip.status} />
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="text-[34px] font-black text-gray-900 tracking-tight leading-none">
              KES {latestNet.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-500 font-semibold mt-2">Breakdown</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestPayslip.breakdown.slice(0, 3).map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-4">
                  <span className="text-[12px] text-gray-600 font-semibold">{line.label}</span>
                  <span className="text-[12px] font-mono font-semibold text-gray-900">
                    {Math.abs(line.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              {latestPayslip.breakdown.slice(3).map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-4">
                  <span className="text-[12px] text-gray-600 font-semibold">{line.label}</span>
                  <span className="text-[12px] font-mono font-semibold text-primary-700">
                    {line.amount < 0 ? "-" : ""}
                    {Math.abs(line.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/portal/payslips")}
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all active:scale-[0.99]"
              >
                <FiFileText className="w-4 h-4" />
                View All Payslips
              </button>

              <button
                onClick={() => openPayslip(latestPayslip)}
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-primary-700 text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all"
              >
                <FiDownload className="w-4 h-4" />
                Download / Preview
              </button>

              {payDiff && (
                <div className="ml-auto text-right">
                  <div className="text-[11px] font-bold text-gray-500">vs last period</div>
                  <div className="text-[12px] font-black text-primary-700">
                    +{payDiff}% net pay
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loan repayment */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[14px] font-black text-gray-900">Loan Repayment</div>
                <div className="text-[12px] text-gray-500 font-semibold mt-0.5">
                  {activeLoan.loanType}
                </div>
              </div>
              <StatusBadge status={activeLoan.status} />
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="text-[12px] text-gray-500 font-semibold">Repaid</div>
              <div className="text-[12px] font-mono font-semibold text-gray-900">
                {formatKES(activeLoan.repaid)} / {formatKES(activeLoan.original)}
              </div>
            </div>

            <ProgressBar value={loanPct} />
            <div className="text-[11px] text-gray-500 font-semibold mt-2">
              {loanPct}% complete · {activeLoan.installments.remaining} installments left
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-[12px] text-gray-600 font-semibold">Monthly Deduction</div>
                <div className="text-[13px] font-mono font-black text-primary-700">
                  {formatKES(activeLoan.monthly)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-gray-600 font-semibold">Next Payment</div>
                <div className="text-[12px] font-semibold text-gray-900">31 March 2025</div>
              </div>
            </div>

            <button
              onClick={() => navigate("/portal/loans")}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-primary-700 text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
              View Loan Details
            </button>
          </div>
        </div>
      </div>

      {/* Recent expenses */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[14px] font-black text-gray-900 tracking-tight">Recent Expenses</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Last 30 days</div>
          </div>
          <button
            onClick={() => navigate("/portal/expenses")}
            className="text-[12px] font-black text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {recentExpenses.map((exp) => (
            <div key={exp.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                    pickCategoryColor(exp.status)
                  )}
                >
                  <span className="text-[12px] font-black">{exp.category.slice(0, 1).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-gray-900 truncate">{exp.desc}</div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    {exp.date} · {exp.category}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-mono font-black text-gray-900">{exp.amount.toLocaleString()}</div>
                <div className="text-[11px] text-gray-500 font-semibold">KES</div>
                <div className="mt-2">
                  <StatusBadge status={exp.status} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4">
          <button
            onClick={() => pushToast({ tone: "info", title: "All expenses (dummy)", message: "Connecting to backend later." })}
            className="w-full text-center text-[12px] font-black text-gray-700 hover:text-gray-900 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-2xl px-4 py-2.5 transition-all"
          >
            Manage Expenses
          </button>
        </div>
      </div>

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={payslipForModal}
        employeeName={`${user?.firstName || "Employee"} ${user?.lastName || ""}`.trim()}
        employeeId="EMP-00247"
        department="Engineering Department"
        kraPin="A003928475W"
        bankMasked="Equity Bank · Nairobi CBD"
      />
    </div>
  );
};

export default DashboardPage;

