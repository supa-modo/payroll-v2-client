import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEye, FiEdit2, FiCheck, FiX, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { TbCoin, TbCalendarStats, TbClockPause, TbCurrencyDollar, TbListDetails } from "react-icons/tb";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import StatCard from "../../components/ui/StatCard";
import api from "../../services/api";
import type { EmployeeLoan, LoanRepayment, CreateLoanInput, UpdateLoanInput, LoansResponse, LoanRepaymentsResponse } from "../../types/loan";
import type { Employee } from "../../types/employee";

/* ─── helpers ──────────────────────────────────────────────── */
const KES = (v: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);

const fmt = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  active: { label: "Active", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  written_off: { label: "Written Off", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
};

const LoanBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ─── Loan Form Drawer ──────────────────────────────────────── */
interface FormDrawerProps {
  loan?: EmployeeLoan;
  onClose: () => void;
  onSuccess: () => void;
}

const LoanFormDrawer: React.FC<FormDrawerProps> = ({ loan, onClose, onSuccess }) => {
  const isEdit = !!loan;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<CreateLoanInput>({
    employeeId: loan?.employeeId ?? "",
    loanType: loan?.loanType ?? "personal",
    principalAmount: loan ? parseFloat(loan.principalAmount.toString()) : 0,
    interestRate: loan?.interestRate ?? 0,
    repaymentStartDate: loan?.repaymentStartDate ?? "",
    monthlyDeduction: loan ? parseFloat(loan.monthlyDeduction.toString()) : 0,
    reason: loan?.reason ?? "",
  });

  const totalAmount = (form.principalAmount || 0) * (1 + (form.interestRate || 0) / 100);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    api.get("/employees?limit=1000").then(r => setEmployees(r.data.employees || [])).catch(() => {});
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const u: UpdateLoanInput = { loanType: form.loanType, principalAmount: form.principalAmount, interestRate: form.interestRate, repaymentStartDate: form.repaymentStartDate, monthlyDeduction: form.monthlyDeduction, reason: form.reason };
        await api.put(`/loans/${loan!.id}`, u);
      } else {
        await api.post("/loans", form);
      }
      onSuccess(); handleClose();
    } catch (e: any) { alert(e.response?.data?.error || "Failed to save loan."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className={`fixed inset-0 z-100 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-110 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(560px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <TbCoin className="w-4 h-4 text-primary-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{isEdit ? "Edit Loan" : "New Loan"}</h3>
              {isEdit && <p className="text-xs text-slate-400 font-mono mt-0.5">{loan!.loanNumber}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#f8f9fb]">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loan Details</p>
            {!isEdit && (
              <Select label="Employee" value={form.employeeId}
                onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required
                options={[{ value: "", label: "Select Employee" }, ...employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName} (${emp.employeeNumber})` }))]} />
            )}
            <Select label="Loan Type" value={form.loanType}
              onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))} required
              options={[
                { value: "personal", label: "Personal Loan" },
                { value: "advance", label: "Advance" },
                { value: "emergency", label: "Emergency" },
                { value: "salary_advance", label: "Salary Advance" },
                { value: "medical", label: "Medical" },
                { value: "education", label: "Education" },
              ]} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Financial Terms</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Principal Amount (KES)" name="principal" type="number" step="0.01" min="0"
                value={form.principalAmount.toString()}
                onChange={e => setForm(f => ({ ...f, principalAmount: parseFloat(e.target.value) || 0 }))} required />
              <Input label="Interest Rate (%)" name="interest" type="number" step="0.01" min="0" max="100"
                value={form.interestRate?.toString()}
                onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))} />
            </div>

            {/* Calculated total */}
            <div className="rounded-xl bg-primary-50 border border-primary-200 px-4 py-3 flex items-center gap-3">
              <TbCurrencyDollar className="w-5 h-5 text-primary-500 shrink-0" />
              <div>
                <p className="text-xs text-primary-500">Total Amount (Principal + Interest)</p>
                <p className="text-base font-bold font-mono text-primary-700">{KES(totalAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Repayment Start Date</label>
                <input type="date" value={form.repaymentStartDate}
                  onChange={e => setForm(f => ({ ...f, repaymentStartDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <Input label="Monthly Deduction (KES)" name="monthly" type="number" step="0.01" min="0"
                value={form.monthlyDeduction.toString()}
                onChange={e => setForm(f => ({ ...f, monthlyDeduction: parseFloat(e.target.value) || 0 }))} required />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <Textarea label="Reason / Purpose" name="reason" value={form.reason ?? ""}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> {isEdit ? "Update" : "Create"} Loan
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Repayment History (inline component) ──────────────────── */
const RepaymentHistory: React.FC<{ loanId: string }> = ({ loanId }) => {
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<LoanRepaymentsResponse>(`/loans/${loanId}/repayments`)
      .then(r => setRepayments(r.data.repayments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loanId]);

  if (loading) return (
    <div className="flex items-center justify-center py-8 gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
      <p className="text-xs text-slate-400">Loading repayments…</p>
    </div>
  );

  if (repayments.length === 0) return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
      <TbCoin className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-400">No repayments recorded yet.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {repayments.map(r => (
        <div key={r.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <FiDollarSign className="w-3.5 h-3.5 text-blue-600" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{fmt(r.repaymentDate)}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{r.paymentType}{r.notes ? ` · ${r.notes}` : ""}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-sm font-bold font-mono text-blue-600">{KES(parseFloat(r.amount.toString()))}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Bal: {KES(parseFloat(r.balanceAfter.toString()))}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Loan Detail Drawer ────────────────────────────────────── */
interface DetailDrawerProps {
  loanId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const LoanDetailDrawer: React.FC<DetailDrawerProps> = ({ loanId, onClose, onUpdated }) => {
  const [loan, setLoan] = useState<EmployeeLoan | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "repayments">("info");
  const [showWriteOffPrompt, setShowWriteOffPrompt] = useState(false);
  const [writeOffReason, setWriteOffReason] = useState("");

  const fetchLoan = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/loans/${loanId}`); setLoan(r.data.loan); }
    catch { } finally { setLoading(false); }
  }, [loanId]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    fetchLoan();
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [loanId]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const handleApprove = async () => {
    if (!loan) return;
    try { await api.post(`/loans/${loan.id}/approve`); fetchLoan(); onUpdated(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to approve."); }
  };

  const handleComplete = async () => {
    if (!loan) return;
    try { await api.post(`/loans/${loan.id}/complete`); fetchLoan(); onUpdated(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to complete."); }
  };

  const handleWriteOff = async () => {
    if (!loan || !writeOffReason.trim()) return;
    try { await api.post(`/loans/${loan.id}/write-off`, { reason: writeOffReason }); fetchLoan(); onUpdated(); setShowWriteOffPrompt(false); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to write off."); }
  };

  const progressPct = loan && loan.totalAmount > 0
    ? Math.min(100, (parseFloat(loan.totalPaid.toString()) / parseFloat(loan.totalAmount.toString())) * 100)
    : 0;
  const remainingMonths = loan && loan.monthlyDeduction > 0
    ? Math.ceil(parseFloat(loan.remainingBalance.toString()) / parseFloat(loan.monthlyDeduction.toString()))
    : 0;

  return (
    <>
      <div className={`fixed inset-0 z-100 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-110 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(700px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading loan…</p>
          </div>
        ) : !loan ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center">
            <TbCoin className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-slate-600">Loan not found</p>
            <button onClick={handleClose} className="text-sm text-primary-600 hover:underline font-semibold">Close</button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-200 shrink-0 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold font-mono text-slate-500">{loan.loanNumber}</span>
                    <LoanBadge status={loan.status} />
                    <span className="text-xs text-slate-400 capitalize bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                      {loan.loanType.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-google">
                    {loan.employee ? `${loan.employee.firstName} ${loan.employee.lastName}` : "Unknown Employee"}
                  </h2>
                  {loan.employee && (
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{loan.employee.employeeNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {loan.status === "pending" && (
                    <Button onClick={handleApprove} className="font-source py-1 text-xs">
                      <FiCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                  )}
                  {loan.status === "active" && parseFloat(loan.remainingBalance.toString()) <= 0 && (
                    <Button onClick={handleComplete} className="font-source py-1 text-xs">
                      <FiCheck className="w-3.5 h-3.5" /> Complete
                    </Button>
                  )}
                  {loan.status === "active" && parseFloat(loan.remainingBalance.toString()) > 0 && (
                    <button onClick={() => setShowWriteOffPrompt(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <FiX className="w-3 h-3" /> Write Off
                    </button>
                  )}
                  <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar hero */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Repayment Progress</span>
                  <span className="font-bold font-mono">{progressPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Paid: <span className="font-bold font-mono text-emerald-600">{KES(parseFloat(loan.totalPaid.toString()))}</span></span>
                  <span>Remaining: <span className="font-bold font-mono text-slate-700">{KES(parseFloat(loan.remainingBalance.toString()))}</span></span>
                </div>
              </div>
            </div>

            {/* Summary cards row */}
            <div className="grid grid-cols-3 gap-3 px-6 pt-4 shrink-0">
              {[
                { label: "Total Amount", value: KES(parseFloat(loan.totalAmount.toString())), icon: <TbCurrencyDollar className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50 border-blue-200" },
                { label: "Monthly Deduction", value: KES(parseFloat(loan.monthlyDeduction.toString())), icon: <TbCalendarStats className="w-4 h-4 text-amber-600" />, bg: "bg-amber-50 border-amber-200" },
                { label: "Est. Months Left", value: loan.status === "active" ? `${remainingMonths} mo.` : "—", icon: <TbClockPause className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50 border-purple-200" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border px-4 py-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">{s.icon}<p className="text-xs text-slate-500">{s.label}</p></div>
                  <p className="text-sm font-bold font-mono text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center px-6 pt-3 pb-0 border-b border-slate-200 bg-white shrink-0 font-source">
              {(["info", "repayments"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 text-sm font-medium rounded-[0.7rem] px-5 py-2 border -mb-px mr-1 transition-colors duration-200 ${activeTab === tab ? "bg-gray-700 text-white border-gray-700" : "text-slate-500 border-transparent hover:text-slate-800"}`}>
                  {tab === "info" ? <TbListDetails className="w-4 h-4" /> : <TbCoin className="w-4 h-4" />}
                  {tab === "info" ? "Loan Info" : "Repayments"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-[#f8f9fb] px-6 py-5">
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Loan Information</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        { label: "Loan Number", value: loan.loanNumber, mono: true },
                        { label: "Loan Type", value: loan.loanType.replace("_", " "), capitalize: true },
                        { label: "Principal Amount", value: KES(parseFloat(loan.principalAmount.toString())), mono: true },
                        { label: "Interest Rate", value: `${loan.interestRate}%`, mono: true },
                        { label: "Total Amount", value: KES(parseFloat(loan.totalAmount.toString())), mono: true },
                        { label: "Repayment Start", value: fmt(loan.repaymentStartDate) },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-xs text-slate-400 mb-1">{f.label}</p>
                          <p className={`text-sm font-semibold text-slate-800 ${f.mono ? "font-mono" : ""} ${(f as any).capitalize ? "capitalize" : ""}`}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {loan.reason && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Reason / Purpose</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{loan.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "repayments" && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Repayment History</p>
                  <RepaymentHistory loanId={loan.id} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Write-off prompt (bottom sheet) */}
        {showWriteOffPrompt && (
          <>
            <div className="fixed inset-0 z-170 bg-slate-900/20" onClick={() => setShowWriteOffPrompt(false)} />
            <div className="fixed bottom-0 right-0 z-180 bg-white rounded-t-3xl px-6 pt-4 pb-6 space-y-4"
              style={{ width: "min(700px, 94vw)", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
              <div className="h-[3px] rounded-t-3xl bg-red-500 absolute top-0 left-0 right-0" />
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-sm font-bold text-slate-800">Write Off Loan</h3>
                <button onClick={() => setShowWriteOffPrompt(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <Textarea label="Write-off Reason" name="writeOffReason" value={writeOffReason}
                onChange={e => setWriteOffReason(e.target.value)} rows={3} />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowWriteOffPrompt(false)}>Cancel</Button>
                <button onClick={handleWriteOff} disabled={!writeOffReason.trim()}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                  <FiX className="w-4 h-4" /> Confirm Write-Off
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

/* ─── Loans Page ─────────────────────────────────────────────── */
const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<EmployeeLoan | null>(null);
  const [filters, setFilters] = useState({ status: "", loanType: "", startDate: "", endDate: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ totalActive: 0, totalOutstanding: 0, totalCompleted: 0 });

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const r = await api.get<LoansResponse>(`/loans?${params}`);
      setLoans(r.data.loans);
      setPagination(p => ({ ...p, total: r.data.total, totalPages: r.data.totalPages }));
      const active = r.data.loans.filter(l => l.status === "active");
      setSummary({
        totalActive: active.length,
        totalOutstanding: active.reduce((s, l) => s + parseFloat(l.remainingBalance.toString()), 0),
        totalCompleted: r.data.loans.filter(l => l.status === "completed").length,
      });
    } catch { } finally { setLoading(false); }
  }, [pagination.page, filters]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-google">Loans</h1>
          <p className="text-sm text-slate-500 mt-1 font-source">Manage employee loan disbursements and repayments</p>
        </div>
        <Button onClick={() => { setEditingLoan(null); setShowForm(true); }} className="font-source">
          <FiPlus className="w-4 h-4" /> New Loan
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Active Loans" value={summary.totalActive} icon={<FiDollarSign />} gradient="from-blue-500 to-blue-600" />
        <StatCard title="Total Outstanding" value={KES(summary.totalOutstanding)} icon={<FiTrendingUp />} gradient="from-amber-500 to-amber-600" />
        <StatCard title="Completed Loans" value={summary.totalCompleted} icon={<FiCheck />} gradient="from-emerald-500 to-emerald-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select label="Status" value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            options={[{ value: "", label: "All Statuses" }, { value: "pending", label: "Pending" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "written_off", label: "Written Off" }]} />
          <Select label="Loan Type" value={filters.loanType}
            onChange={e => setFilters(f => ({ ...f, loanType: e.target.value }))}
            options={[{ value: "", label: "All Types" }, { value: "personal", label: "Personal" }, { value: "advance", label: "Advance" }, { value: "emergency", label: "Emergency" }, { value: "salary_advance", label: "Salary Advance" }]} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Loan",
              cell: (l: EmployeeLoan) => (
                <div>
                  <p className="font-semibold text-slate-800">{l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : "—"}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{l.loanNumber}</p>
                </div>
              ),
            },
            {
              header: "Type",
              cell: (l: EmployeeLoan) => (
                <span className="text-xs font-medium capitalize text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                  {l.loanType.replace("_", " ")}
                </span>
              ),
            },
            {
              header: "Principal",
              cell: (l: EmployeeLoan) => <p className="text-sm font-mono font-semibold text-slate-700">{KES(parseFloat(l.principalAmount.toString()))}</p>,
            },
            {
              header: "Remaining",
              cell: (l: EmployeeLoan) => <p className="text-sm font-mono font-semibold text-slate-700">{KES(parseFloat(l.remainingBalance.toString()))}</p>,
            },
            {
              header: "Monthly",
              cell: (l: EmployeeLoan) => <p className="text-sm font-mono text-slate-600">{KES(parseFloat(l.monthlyDeduction.toString()))}</p>,
            },
            {
              header: "Status",
              cell: (l: EmployeeLoan) => <LoanBadge status={l.status} />,
            },
            {
              header: "",
              cell: (l: EmployeeLoan) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => setViewId(l.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <FiEye className="w-3.5 h-3.5" />
                  </button>
                  {l.status === "pending" && (
                    <button onClick={() => { setEditingLoan(l); setShowForm(true); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={loans}
          totalItems={pagination.total}
          startIndex={(pagination.page - 1) * pagination.limit + 1}
          endIndex={Math.min(pagination.page * pagination.limit, pagination.total)}
          currentPage={pagination.page} totalPages={pagination.totalPages}
          onPageChange={p => setPagination(prev => ({ ...prev, page: p }))}
          pageSize={pagination.limit}
          tableLoading={loading}
          hasSearched={!!(filters.status || filters.loanType || filters.startDate || filters.endDate)}
          showCheckboxes={false}
        />
      </div>

      {viewId && (
        <LoanDetailDrawer loanId={viewId} onClose={() => setViewId(null)} onUpdated={fetchLoans} />
      )}
      {showForm && (
        <LoanFormDrawer
          loan={editingLoan ?? undefined}
          onClose={() => { setShowForm(false); setEditingLoan(null); }}
          onSuccess={fetchLoans}
        />
      )}
    </div>
  );
};

export default LoansPage;