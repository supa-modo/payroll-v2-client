import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "../../store/authStore";
import { usePortalToast } from "../../components/layouts/EmployeePortalLayout";
import {
  dummyExpenses,
  dummyLoans,
  dummyPayslips,
  dummyProfile,
  dummySalaryRevisions,
} from "./portalDummyData";
import {
  ExpenseSubmitModal,
  LoanApplyModal,
  PayslipModal,
  ProgressBar,
  SectionHeader,
  StatCard,
  StatusBadge,
} from "./portalComponents/portalUi";
import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiDownload, FiPlus, FiX } from "react-icons/fi";

const formatKES = (n: number) => `KES ${Math.round(n).toLocaleString()}`;

const moneyIconCircle = (status: string) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "bg-primary-50 text-primary-700 border-primary-100";
  if (s === "approved" || s === "paid" || s === "active") return "bg-secondary-50 text-secondary-700 border-secondary-100";
  if (s === "rejected") return "bg-red-50 text-red-600 border-red-100";
  return "bg-gray-50 text-gray-600 border-gray-100";
};

export const PortalSalaryHistory: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const pushToast = usePortalToast();

  const [tab, setTab] = useState<"all" | "2025" | "2024">("all");
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [revisionForModal, setRevisionForModal] = useState(dummySalaryRevisions[0]);

  const filtered = useMemo(() => {
    if (tab === "all") return dummySalaryRevisions;
    const year = Number(tab);
    return dummySalaryRevisions.filter((r) => r.year === year);
  }, [tab]);

  const breakdown = dummyPayslips[0].breakdown;
  const payslipPreview = useMemo(() => {
    return {
      period: revisionForModal.period,
      status: revisionForModal.status,
      grossPay: revisionForModal.newGross,
      deductions: revisionForModal.deductions,
      netPay: revisionForModal.netPay,
      breakdown,
    };
  }, [breakdown, revisionForModal.deductions, revisionForModal.netPay, revisionForModal.newGross, revisionForModal.period, revisionForModal.status]);

  const openPreview = (rev: typeof revisionForModal) => {
    setRevisionForModal(rev);
    setIsPayslipModalOpen(true);
  };

  const name = `${user?.firstName || "Employee"} ${user?.lastName || ""}`.trim();

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            Salary <em className="not-italic text-primary-700">History</em>
          </>
        }
        meta="Complete compensation record"
        action={
          <div className="flex items-center gap-1.5 bg-gray-100/70 rounded-2xl p-1.5">
            {[
              { id: "all", label: "All Time" },
              { id: "2025", label: "2025" },
              { id: "2024", label: "2024" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 capitalize",
                  tab === t.id
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[14px] font-black text-gray-900 tracking-tight">Monthly Salary Record</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
              Dummy export and preview actions
            </div>
          </div>
          <button
            onClick={() => pushToast({ tone: "info", title: "Export initiated", message: "CSV download starting... (dummy)" })}
            className="inline-flex items-center gap-2 text-[12px] font-black text-primary-700 hover:text-primary-800 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl px-4 py-2.5 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Gross Salary</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Net Pay</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((rev) => (
                <tr key={rev.id}>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-bold text-gray-900">{rev.period}</div>
                    <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                      Revised {new Date(rev.revisionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-mono font-semibold text-gray-900">{formatKES(rev.newGross)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-mono font-semibold text-primary-700">{formatKES(rev.deductions)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-mono font-black text-gray-900">{formatKES(rev.netPay)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={rev.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openPreview(rev)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-black border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 transition-colors active:scale-[0.99]"
                    >
                      {rev.status === "paid" ? "Download" : "Preview"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="px-5 py-10 text-center text-[13px] font-semibold text-gray-500">
                      No salary revisions found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={payslipPreview}
        employeeName={name}
        employeeId="EMP-00247"
        department="Engineering Department"
        kraPin={dummyProfile.kraPin}
        bankMasked={`${dummyProfile.bankName} · ${dummyProfile.bankLocation}`}
      />
    </div>
  );
};

export const PortalLoans: React.FC = () => {
  const pushToast = usePortalToast();
  const navigate = useNavigate();

  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const activeLoans = dummyLoans.filter((l) => l.status === "active");
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.balance || 0), 0);
  const totalRepaid = activeLoans.reduce((sum, l) => sum + Number(l.repaid || 0), 0);
  const eligibleToBorrow = 150000; // dummy max eligible

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            My <em className="not-italic text-primary-700">Loans</em>
          </>
        }
        meta="Loan history and repayment tracking"
        action={
          <button
            onClick={() => setIsApplyOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-black px-5 py-2.5 rounded-2xl transition-all active:scale-[0.99] border border-primary-700"
          >
            <FiPlus className="w-4 h-4" />
            Apply for Loan
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <StatCard
          accent="primary"
          icon={<FiCreditCard className="w-5 h-5" />}
          value={formatKES(totalOutstanding)}
          label="Outstanding Balance"
          change={<span className="font-bold">{activeLoans.length} active account(s)</span>}
        />
        <StatCard
          accent="secondary"
          icon={<FiCreditCard className="w-5 h-5" />}
          value={formatKES(totalRepaid)}
          label="Total Repaid"
          change={<span className="font-bold">YTD progress</span>}
        />
        <StatCard
          accent="primary"
          icon={<FiCreditCard className="w-5 h-5" />}
          value={formatKES(eligibleToBorrow)}
          label="Eligible to Borrow"
          change={<span className="font-bold">Dummy eligibility</span>}
        />
      </div>

      <div className="space-y-4">
        {dummyLoans.map((loan) => {
          const pct = loan.original > 0 ? Math.round((loan.repaid / loan.original) * 100) : 0;
          const isActive = loan.status === "active";

          return (
            <div
              key={loan.id}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="px-5 py-5 border-b border-gray-50 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-[220px]">
                  <div className="text-[14px] font-black text-gray-900 capitalize">{loan.loanType}</div>
                  <div className="text-[11px] font-mono text-primary-700 font-semibold mt-1">{loan.id}</div>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Principal</div>
                    <div className="text-[14px] font-mono font-black text-gray-900 mt-2">{formatKES(loan.original)}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Repaid</div>
                    <div className="text-[14px] font-mono font-black text-secondary-700 mt-2">{formatKES(loan.repaid)}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Balance</div>
                    <div className="text-[14px] font-mono font-black text-primary-700 mt-2">{formatKES(loan.balance)}</div>
                  </div>
                </div>

                {isActive ? (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[12px] font-bold text-gray-500">Repayment Progress</div>
                      <div className="text-[12px] font-mono font-black text-gray-900">{pct}%</div>
                    </div>
                    <ProgressBar value={pct} />
                    <div className="text-[11px] text-gray-500 font-semibold">
                      {loan.installments.paid} of {loan.installments.total} installments paid · {loan.installments.remaining} remaining
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <div>
                        <div className="text-[11px] text-gray-500 font-semibold">Monthly</div>
                        <div className="text-[13px] font-mono font-black text-primary-700 mt-1">{formatKES(loan.monthly)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 font-semibold">Start Date</div>
                        <div className="text-[13px] font-mono font-black text-gray-900 mt-1">{loan.startDate}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 font-semibold">Purpose</div>
                        <div className="text-[12px] font-semibold text-gray-900 mt-1 truncate">{loan.purpose}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-[12px] font-semibold text-gray-500">
                    Fully settled on {loan.endDate}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => pushToast({ tone: "info", title: "Loan Statement", message: "Opening statement is dummy for now." })}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-800 text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all"
                  >
                    Statement
                  </button>
                  {isActive && (
                    <button
                      onClick={() => pushToast({ tone: "warning", title: "Early Repayment", message: "Contact HR/Finance to arrange early settlement (dummy)." })}
                      className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all"
                    >
                      Early Repayment
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/portal/expenses")}
                    className="ml-auto text-[12px] font-black text-primary-700 hover:text-primary-800"
                  >
                    Need expenses?
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <LoanApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={(data) => {
          setIsApplyOpen(false);
          pushToast({
            tone: "success",
            title: "Loan application submitted",
            message: `Under review: ${data.loanType} for ${formatKES(data.amount)} (dummy).`,
          });
        }}
        maxEligible={eligibleToBorrow}
      />
    </div>
  );
};

export const PortalExpenses: React.FC = () => {
  const pushToast = usePortalToast();

  const [expenses, setExpenses] = useState(() => dummyExpenses);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "paid">("all");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const pendingCount = expenses.filter((e) => e.status === "pending").length;
  const approvedCount = expenses.filter((e) => e.status === "approved").length;
  const paidCount = expenses.filter((e) => e.status === "paid").length;
  const rejectedCount = expenses.filter((e) => e.status === "rejected").length;

  const filtered = filter === "all" ? expenses : expenses.filter((e) => e.status === filter);

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            My <em className="not-italic text-primary-700">Expenses</em>
          </>
        }
        meta="Submit and track expense reimbursements"
        action={
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-black px-5 py-2.5 rounded-2xl transition-all active:scale-[0.99] border border-primary-700"
          >
            <FiPlus className="w-4 h-4" />
            Submit Expense
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          accent="primary"
          icon={<FiAlertCircle className="w-5 h-5" />}
          value={pendingCount.toString()}
          label="Pending Approval"
          change={<span className="font-bold">{pendingCount ? "Awaiting review" : "No pending items"}</span>}
        />
        <StatCard
          accent="secondary"
          icon={<FiCheckCircle className="w-5 h-5" />}
          value={approvedCount.toString()}
          label="Approved (YTD)"
          change={<span className="font-bold">Ready for reimbursement</span>}
        />
        <StatCard
          accent="primary"
          icon={<FiDownload className="w-5 h-5" />}
          value={paidCount.toString()}
          label="Reimbursed (YTD)"
          change={<span className="font-bold">Already paid</span>}
        />
        <StatCard
          accent="primary"
          icon={<FiX className="w-5 h-5" />}
          value={rejectedCount.toString()}
          label="Rejected (YTD)"
          change={<span className="font-bold">Needs resubmission</span>}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[14px] font-black text-gray-900 tracking-tight">Expense Claims</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Filter by status (dummy)</div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-200 bg-white rounded-2xl px-4 py-2.5 text-[13px] font-semibold text-gray-800 focus:border-primary-300 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
                          moneyIconCircle(exp.status)
                        )}
                      >
                        <span className="text-[12px] font-black">{exp.category.slice(0, 1).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-gray-900 truncate">{exp.desc}</div>
                        <div className="text-[11px] text-gray-500 font-semibold mt-0.5">{exp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px] text-gray-600 font-semibold">{exp.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px] text-gray-600 font-semibold">{exp.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-mono font-black text-gray-900">
                      {exp.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold ml-1">KES</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => pushToast({ tone: "info", title: "Expense Detail", message: `Viewing ${exp.id} (dummy).` })}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-black border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        View
                      </button>

                      {exp.status === "pending" && (
                        <button
                          onClick={() => {
                            setExpenses((prev) => prev.filter((x) => x.id !== exp.id));
                            pushToast({ tone: "warning", title: "Expense retracted", message: `${exp.id} withdrawn from approval (dummy).` });
                          }}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-black border border-red-100 hover:border-red-200 bg-red-50 text-red-700 hover:text-red-800 transition-colors"
                        >
                          Retract
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="px-5 py-10 text-center text-[13px] font-semibold text-gray-500">
                      No expenses found for this filter.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-gray-50 bg-white">
          <button
            onClick={() => pushToast({ tone: "info", title: "Tip", message: "Submit & retract actions are dummy while we connect backend later." })}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-[12px] font-black text-gray-700 hover:bg-gray-100 transition-colors"
          >
            How it works (dummy)
          </button>
        </div>
      </div>

      <ExpenseSubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={(data) => {
          setIsSubmitOpen(false);
          const id = `EX-${Math.floor(Math.random() * 9000) + 1000}`;
          setExpenses((prev) => [{ ...data, id }, ...prev]);
          pushToast({ tone: "success", title: "Expense submitted", message: `Claim ${id} is pending approval (dummy).` });
        }}
      />
    </div>
  );
};

export const PortalProfile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const pushToast = usePortalToast();

  const fullName = `${user?.firstName || "Employee"} ${user?.lastName || ""}`.trim();
  const employeeEmail = user?.email || "employee@example.com";

  const heroInitials = `${user?.firstName?.[0] || "E"}${user?.lastName?.[0] || "M"}`.toUpperCase();

  const valueRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50">
      <div className="text-[12px] text-gray-500 font-semibold">{label}</div>
      <div className="text-[13px] font-bold text-gray-900 text-right">{value}</div>
    </div>
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            My <em className="not-italic text-primary-700">Profile</em>
          </>
        }
        meta="Personal and employment information"
        action={
          <button
            onClick={() => pushToast({ tone: "info", title: "Edit profile", message: "Profile editing is dummy for now." })}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-800 text-[12px] font-black px-5 py-2.5 rounded-2xl transition-all"
          >
            Edit Profile
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6">
          <div className="flex items-start justify-between gap-5 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-[20px]">{heroInitials}</span>
              </div>
              <div>
                <div className="text-[24px] font-black text-gray-900 tracking-tight leading-tight">{fullName}</div>
                <div className="text-[13px] text-gray-500 font-semibold mt-1">
                  {dummyProfile.jobTitle} · {dummyProfile.department}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-secondary-50 text-secondary-700 border border-secondary-100">
                    Active Employee
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-primary-50 text-primary-700 border border-primary-100">
                    {dummyProfile.employmentType}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-gray-50 text-gray-700 border border-gray-100">
                    {dummyProfile.office}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Employee ID</div>
              <div className="text-[16px] font-mono font-black text-primary-700 mt-1">{dummyProfile.employeeId}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="text-[14px] font-black text-gray-900">Personal Information</div>
          </div>
          <div>
            {valueRow("Full Name", fullName)}
            {valueRow("National ID", dummyProfile.nationalId)}
            {valueRow("Email", employeeEmail)}
            {valueRow("Phone", dummyProfile.phone)}
            {valueRow("KRA PIN", dummyProfile.kraPin)}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="text-[14px] font-black text-gray-900">Employment Details</div>
          </div>
          <div>
            {valueRow("Department", dummyProfile.department.replace(" Department", ""))}
            {valueRow("Job Grade", "Grade 7 — Senior")}
            {valueRow("Reports To", "David Kimani (VP Eng.)")}
            {valueRow("Start Date", "14 March 2020")}
            <div className="py-3 px-5 border-b border-gray-50 flex items-center justify-between gap-4">
              <div className="text-[12px] font-semibold text-gray-500">Employment Type</div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-secondary-50 text-secondary-700 border border-secondary-100">
                {dummyProfile.employmentType}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[14px] font-black text-gray-900">Bank Details</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Primary account (dummy)
              </div>
            </div>
            <button
              onClick={() => pushToast({ tone: "info", title: "Bank update", message: "Contact HR to update bank details (dummy)." })}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-800 text-[12px] font-black px-4 py-2.5 rounded-2xl transition-all"
            >
              Update Account
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
              <div>
                <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Primary Account</div>
                <div className="text-[14px] font-mono font-black text-gray-900 mt-1">{dummyProfile.bankAccountMasked}</div>
                <div className="text-[12px] text-gray-500 font-semibold mt-1">
                  {dummyProfile.bankName} · {dummyProfile.bankLocation}
                </div>
              </div>
              <StatusBadge status="active" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="text-[14px] font-black text-gray-900">Emergency Contact</div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50">
                <div className="text-[12px] text-gray-500 font-semibold">Name</div>
                <div className="text-[13px] font-bold text-gray-900">{dummyProfile.emergencyContactName}</div>
              </div>
              <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50">
                <div className="text-[12px] text-gray-500 font-semibold">Relationship</div>
                <div className="text-[13px] font-bold text-gray-900">{dummyProfile.emergencyContactRelationship}</div>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="text-[12px] text-gray-500 font-semibold">Phone</div>
                <div className="text-[13px] font-bold text-gray-900">{dummyProfile.emergencyContactPhone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

