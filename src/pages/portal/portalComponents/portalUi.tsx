import React, { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import {
  FiDownload,
  FiUpload,
  FiX,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

import type {
  PortalEarningDeductionLine,
  PortalExpense,
  PortalPayslip,
} from "../portalDummyData";

export const SectionHeader: React.FC<{
  title: React.ReactNode;
  meta?: string;
  action?: React.ReactNode;
}> = ({ title, meta, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5 lg:mb-6 flex-wrap">
    <div>
      <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-primary-600 to-primary-500 mb-2" />
      <h2 className="text-[20px] lg:text-[22px] font-black text-gray-900 tracking-tight leading-tight">
        {title}
      </h2>
      {meta && <p className="text-[12px] text-gray-500 font-semibold mt-0.5">{meta}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const StatusBadge: React.FC<{
  status: string;
}> = ({ status }) => {
  const s = String(status).toLowerCase();

  if (s === "paid" || s === "active" || s === "approved") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary-50 text-secondary-700 border border-secondary-100">
        <FiCheckCircle className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  }

  if (s === "pending") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-100">
        <FiAlertCircle className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  }

  if (s === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
        <FiX className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  }

  // settled / others
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100">
      {status}
    </span>
  );
};

export const ProgressBar: React.FC<{
  value: number; // 0-100
}> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full relative"
        style={{ width: `${pct}%` }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
        />
      </div>
    </div>
  );
};

export const StatCard: React.FC<{
  accent: "primary" | "secondary";
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
  change?: React.ReactNode;
}> = ({ accent, icon, value, label, change }) => {
  const accentClasses =
    accent === "primary"
      ? {
          ring: "border-primary-100",
          iconBg: "bg-primary-50 text-primary-700",
          line: "bg-gradient-to-r from-primary-600 to-primary-500",
          change: "text-primary-700",
        }
      : {
          ring: "border-secondary-100",
          iconBg: "bg-secondary-50 text-secondary-700",
          line: "bg-gradient-to-r from-secondary-600 to-secondary-500",
          change: "text-secondary-700",
        };

  return (
    <div
      className={clsx(
        "bg-white border rounded-2xl p-5 hover:shadow-sm transition-all duration-200",
        accentClasses.ring
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            accentClasses.iconBg
          )}
        >
          {icon}
        </div>
        <div className="h-[3px] w-16 rounded-full overflow-hidden">
          <div className={clsx("h-full", accentClasses.line)} />
        </div>
      </div>
      <div className="text-[22px] lg:text-[24px] font-black text-gray-900 tracking-tight leading-none mb-1">
        {value}
      </div>
      <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      {change && <div className={clsx("text-[12px] font-semibold mt-3", accentClasses.change)}>{change}</div>}
    </div>
  );
};

const formatKES = (n: number) => `KES ${Math.round(n).toLocaleString()}`;

const splitBreakdown = (lines: PortalEarningDeductionLine[]) => {
  const earnings = lines.filter((l) => l.amount >= 0);
  const deductions = lines.filter((l) => l.amount < 0);
  return { earnings, deductions };
};

export const PayslipModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  payslip: Pick<
    PortalPayslip,
    "period" | "status" | "grossPay" | "deductions" | "netPay" | "breakdown"
  >;
  employeeName: string;
  employeeId: string;
  department?: string;
  kraPin?: string;
  bankMasked?: string;
}> = ({ isOpen, onClose, payslip, employeeName, employeeId, department, kraPin, bankMasked }) => {
  const { earnings, deductions } = useMemo(() => splitBreakdown(payslip.breakdown), [payslip.breakdown]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payslip Preview" size="lg">
      <div className="space-y-4 font-mukta">
        <div className="bg-gradient-to-r from-primary-600/5 via-secondary-600/5 to-primary-600/5 border border-gray-100 rounded-2xl px-5 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                PAYSLIP
              </p>
              <p className="text-[12px] text-gray-600 font-semibold">{payslip.period}</p>
            </div>
            <div>
              <StatusBadge status={payslip.status} />
              <p className="text-[11px] text-gray-500 font-semibold mt-1 text-right">Net pay</p>
              <p className="text-[18px] font-black text-gray-900 leading-tight text-right">{formatKES(payslip.netPay)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-1">Employee</p>
            <p className="text-[14px] font-bold text-gray-900">{employeeName}</p>
            {department && <p className="text-[12px] text-gray-500 font-semibold mt-1">{department}</p>}
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-1">Employee ID</p>
            <p className="text-[14px] font-mono font-semibold text-primary-700">{employeeId}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-1">KRA PIN / Bank</p>
            <p className="text-[12px] text-gray-700 font-semibold">{kraPin || "—"}</p>
            <p className="text-[12px] text-gray-500 font-semibold mt-1">{bankMasked || "—"}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[12px] font-black text-gray-900">Earnings & Deductions</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">For this pay period</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500 font-semibold">Gross</p>
              <p className="text-[14px] font-black text-gray-900">{formatKES(payslip.grossPay)}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[620px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">Amount (KES)</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((l) => (
                  <tr key={l.label} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{l.label}</td>
                    <td className="px-5 py-3 text-[13px] font-mono font-semibold text-gray-900">{formatKES(l.amount)}</td>
                  </tr>
                ))}
                {deductions.map((l) => (
                  <tr key={l.label} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{l.label}</td>
                    <td className="px-5 py-3 text-[13px] font-mono font-semibold text-primary-700">
                      {`-${formatKES(Math.abs(l.amount)).replace("KES ", "")}`}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-100 bg-gray-50">
                  <td className="px-5 py-3 text-[12px] font-black text-gray-700 uppercase tracking-wider">NET PAY</td>
                  <td className="px-5 py-3 text-[14px] font-black text-gray-900 text-right">{formatKES(payslip.netPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-gray-50 text-[11px] text-gray-500 font-semibold">
            This is a computer-generated preview and does not require a signature.
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const LoanApplyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    loanType: string;
    amount: number;
    repaymentMonths: number;
    purpose: string;
  }) => void;
  maxEligible: number;
}> = ({ isOpen, onClose, onSubmit, maxEligible }) => {
  const [loanType, setLoanType] = useState("Personal Loan");
  const [amount, setAmount] = useState<number>(50000);
  const [repayment, setRepayment] = useState(6);
  const [purpose, setPurpose] = useState("Professional development");

  useEffect(() => {
    if (!isOpen) return;
    setLoanType("Personal Loan");
    setAmount(50000);
    setRepayment(6);
    setPurpose("Professional development");
  }, [isOpen]);

  const monthlyDeduction = useMemo(() => {
    const m = repayment || 1;
    return Math.round((amount / m) * 0.85); // dummy estimate
  }, [amount, repayment]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for a Loan" size="lg">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ loanType, amount, repaymentMonths: repayment, purpose });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Loan Type</label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            >
              <option>Personal Loan</option>
              <option>Emergency Loan</option>
              <option>School Fees Loan</option>
              <option>Housing Deposit Loan</option>
              <option>Medical Loan</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Amount (KES)</label>
            <input
              type="number"
              value={amount}
              min={10000}
              max={maxEligible}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Repayment Period</label>
            <select
              value={repayment}
              onChange={(e) => setRepayment(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={9}>9 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Monthly Deduction</label>
            <input
              value={monthlyDeduction}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-gray-50 text-gray-700 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-black text-gray-600">Purpose / Reason</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none min-h-[90px]"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[12px] font-black text-gray-600">Supporting Document (optional)</div>
          <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-gray-900">Click to upload or drag & drop</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">PDF, JPG, PNG - max 5MB (dummy)</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <FiPlus className="w-4 h-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const ExpenseSubmitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PortalExpense, "id">) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [desc, setDesc] = useState("Client dinner at Tribe Hotel");
  const [category, setCategory] = useState("Travel");
  const [amount, setAmount] = useState<number>(5000);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [costCenter, setCostCenter] = useState("Engineering");
  const [notes, setNotes] = useState("Receipts attached");

  useEffect(() => {
    if (!isOpen) return;
    setDesc("Client dinner at Tribe Hotel");
    setCategory("Travel");
    setAmount(5000);
    setDate(new Date().toISOString().slice(0, 10));
    setCostCenter("Engineering");
    setNotes("Receipts attached");
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Expense" size="lg">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const iso = new Date(date);
          onSubmit({
            desc,
            category,
            date: iso.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            amount,
            status: "pending",
          });
        }}
      >
        <div className="space-y-1.5">
          <label className="text-[12px] font-black text-gray-600">Expense Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            >
              <option>Travel</option>
              <option>Accommodation</option>
              <option>Meals & Entertainment</option>
              <option>Training & Development</option>
              <option>Office Supplies</option>
              <option>Communication</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Amount (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Date Incurred</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-gray-600">Project / Cost Center</label>
            <select
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none"
            >
              <option>General Operations</option>
              <option>Project Alpha</option>
              <option>Project Beta</option>
              <option>Sales & Marketing</option>
              <option>Engineering</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-black text-gray-600">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] bg-white focus:border-primary-300 outline-none min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[12px] font-black text-gray-600">Receipt / Proof (dummy)</div>
          <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-gray-900">Upload receipt</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">PDF, JPG, PNG - max 5MB (dummy)</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <FiPlus className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </form>
    </Modal>
  );
};

