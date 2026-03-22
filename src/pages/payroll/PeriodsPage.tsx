import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiPlay, FiCheck, FiLock, FiEye, FiTrash2,
  FiAlertTriangle, FiChevronRight, FiRefreshCw, FiCalendar,
  FiCheckCircle, FiClock, FiAlertCircle, FiX, FiArrowUpRight,
} from "react-icons/fi";
import {
  TbMoneybag, TbReceiptTax, TbUsersGroup, TbBuildingBank,
  TbAlertHexagon, TbCircleCheck, TbProgress, TbLock,
} from "react-icons/tb";
import { PiUsersThreeDuotone } from "react-icons/pi";

// ─── NOTE ────────────────────────────────────────────────────────────────────
// Replace these stub imports with your real components & api service:
//   import DataTable from "../../components/ui/DataTable";
//   import Button from "../../components/ui/Button";
//   import Modal from "../../components/ui/Modal";
//   import Input from "../../components/ui/Input";
//   import Select from "../../components/ui/Select";
//   import DateInput from "../../components/ui/DateInput";
//   import NotificationModal from "../../components/ui/NotificationModal";
//   import api from "../../services/api";
//   import { useNavigate } from "react-router-dom";
// ─────────────────────────────────────────────────────────────────────────────

/* ─── MOCK DATA (remove when wiring real API) ──────────── */
const MOCK_PERIODS = [
  { id: "1", name: "March 2025",    periodType: "monthly", startDate: "2025-03-01", endDate: "2025-03-31", payDate: "2025-03-31", status: "draft",           totalEmployees: 247, totalNet: 39683900, totalGross: 52418300, totalDeductions: 12734400 },
  { id: "2", name: "February 2025", periodType: "monthly", startDate: "2025-02-01", endDate: "2025-02-28", payDate: "2025-02-28", status: "locked",          totalEmployees: 244, totalNet: 38920000, totalGross: 51200000, totalDeductions: 12280000 },
  { id: "3", name: "January 2025",  periodType: "monthly", startDate: "2025-01-01", endDate: "2025-01-31", payDate: "2025-01-31", status: "locked",          totalEmployees: 241, totalNet: 38600000, totalGross: 50800000, totalDeductions: 12200000 },
  { id: "4", name: "December 2024", periodType: "monthly", startDate: "2024-12-01", endDate: "2024-12-31", payDate: "2024-12-31", status: "locked",          totalEmployees: 238, totalNet: 42100000, totalGross: 55400000, totalDeductions: 13300000 },
  { id: "5", name: "November 2024", periodType: "monthly", startDate: "2024-11-01", endDate: "2024-11-30", payDate: "2024-11-30", status: "locked",          totalEmployees: 235, totalNet: 35800000, totalGross: 47200000, totalDeductions: 11400000 },
  { id: "6", name: "April 2025",    periodType: "monthly", startDate: "2025-04-01", endDate: "2025-04-30", payDate: "2025-04-30", status: "pending_approval",totalEmployees: 0,   totalNet: 0,        totalGross: 0,        totalDeductions: 0 },
];

const MOCK_EXCEPTIONS = [
  { id: "e1", employee: "Hassan Omar",   employeeId: "EMP-00240", issue: "Missing bank account details",               severity: "error"   },
  { id: "e2", employee: "Ivy Mukami",    employeeId: "EMP-00239", issue: "Missing KRA PIN — tax cannot be calculated", severity: "error"   },
  { id: "e3", employee: "EMP-00231",     employeeId: "EMP-00231", issue: "Negative net pay due to loan deduction",     severity: "warning" },
  { id: "e4", employee: "James Kariuki", employeeId: "EMP-00225", issue: "New hire — pending onboarding documents",   severity: "warning" },
];

const PAYROLL_SUMMARY = [
  { label: "Basic Salaries",        employees: 247, amount: 36820000, type: "earning"   },
  { label: "Housing Allowances",    employees: 198, amount: 7920000,  type: "earning"   },
  { label: "Transport Allowances",  employees: 247, amount: 4940000,  type: "earning"   },
  { label: "Medical Allowances",    employees: 210, amount: 2738300,  type: "earning"   },
  { label: "PAYE Tax",              employees: 247, amount: 9100000,  type: "deduction" },
  { label: "NHIF Contributions",    employees: 247, amount: 419000,   type: "deduction" },
  { label: "NSSF Contributions",    employees: 247, amount: 49400,    type: "deduction" },
  { label: "Loan Deductions",       employees: 38,  amount: 2856000,  type: "deduction" },
  { label: "Salary Advances",       employees: 5,   amount: 310000,   type: "deduction" },
];

/* ─── STATUS CONFIG ─────────────────────────────────────── */
const STATUS_CONFIG = {
  draft:            { label: "Draft",            bg: "bg-slate-100",   text: "text-slate-600",  dot: "bg-slate-400",   icon: TbProgress     },
  processing:       { label: "Processing",       bg: "bg-blue-50",     text: "text-blue-700",   dot: "bg-blue-500",    icon: FiRefreshCw    },
  pending_approval: { label: "Pending Approval", bg: "bg-amber-50",    text: "text-amber-700",  dot: "bg-amber-500",   icon: FiClock        },
  approved:         { label: "Approved",         bg: "bg-emerald-50",  text: "text-emerald-700",dot: "bg-emerald-500", icon: FiCheckCircle  },
  paid:             { label: "Paid",             bg: "bg-violet-50",   text: "text-violet-700", dot: "bg-violet-500",  icon: TbBuildingBank },
  locked:           { label: "Locked",           bg: "bg-rose-50",     text: "text-rose-700",   dot: "bg-rose-500",    icon: TbLock         },
};

/* ─── HELPERS ───────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("en-KE").format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ─── STAT CARD ─────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, change, positive, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-default ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{ transition: `opacity 0.4s ${delay}ms ease, transform 0.4s ${delay}ms ease, box-shadow 0.2s, border-color 0.2s` }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            <FiArrowUpRight className="w-3 h-3" /> {change}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
      <p className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[11.5px] text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
};

/* ─── STATUS BADGE ──────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.bg.replace("bg-","border-").replace("-50","-100").replace("-100","-200")}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ─── NEW PERIOD FORM MODAL (inline, no external Modal component needed) ─── */
const PeriodFormModal = ({ editing, formData, setFormData, onClose, onSubmit, isSubmitting, error }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
    style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
      style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 to-blue-400" />
      <div className="px-7 pt-6 pb-0 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FiCalendar className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-900">{editing ? "Edit Payroll Period" : "New Payroll Period"}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Configure the period dates and type</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="px-7 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex gap-2.5 items-start">
            <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div>
          <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Period Name</label>
          <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
            placeholder="e.g. Payroll March 2025" required />
        </div>
        <div>
          <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Period Type</label>
          <select value={formData.periodType} onChange={e => setFormData(p => ({ ...p, periodType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none">
            <option value="monthly">Monthly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Start Date", key: "startDate" },
            { label: "End Date",   key: "endDate"   },
            { label: "Pay Date",   key: "payDate"   },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
              <input type="date" value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" required />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5 justify-end px-7 pb-6">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.3)]">
          {isSubmitting
            ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <FiCheck className="w-3.5 h-3.5" />
          }
          {editing ? "Update Period" : "Create Period"}
        </button>
      </div>
    </div>
  </div>
);

/* ─── CONFIRM MODAL ─────────────────────────────────────── */
const ConfirmModal = ({ config, onClose, onConfirm }) => {
  if (!config) return null;
  const isDelete = config.type === "delete";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
        style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <div className={`h-1 w-full ${isDelete ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-blue-700 to-blue-400"}`} />
        <div className="p-7">
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDelete ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"}`}>
              {isDelete
                ? <FiTrash2 className="w-4.5 h-4.5 text-red-600" />
                : <FiAlertTriangle className="w-4.5 h-4.5 text-blue-600" />
              }
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-slate-900">{config.title}</h3>
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{config.message}</p>
            </div>
          </div>
          <div className="flex gap-2.5 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors ${isDelete ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
              {config.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
const PeriodsPage = () => {
  // ── state ──────────────────────────────────────────────────
  const [periods, setPeriods]               = useState(MOCK_PERIODS);
  const [isLoading, setIsLoading]           = useState(false);
  const [filterStatus, setFilterStatus]     = useState("");
  const [currentPage, setCurrentPage]       = useState(1);
  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingPeriod, setEditingPeriod]   = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [formError, setFormError]           = useState("");
  const [confirmModal, setConfirmModal]     = useState(null);
  const [exceptions, setExceptions]         = useState(MOCK_EXCEPTIONS);
  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    name: "", periodType: "monthly", startDate: "", endDate: "", payDate: "",
  });

  // ── derived ────────────────────────────────────────────────
  const currentPeriod = periods.find(p => p.status === "draft") || periods[0];
  const filtered      = periods.filter(p => !filterStatus || p.status === filterStatus);
  const paginated     = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages    = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = [
    {
      label: "Periods This Year", value: "3", sub: "Processed successfully",
      icon: FiCalendar, iconBg: "bg-blue-50", iconColor: "#2563eb", change: null, delay: 0,
    },
    {
      label: "Total Employees", value: "247", sub: "Active this cycle",
      icon: PiUsersThreeDuotone, iconBg: "bg-cyan-50", iconColor: "#0891b2", change: "+3 this month", positive: true, delay: 70,
    },
    {
      label: "Estimated Gross", value: "KES 52.4M", sub: "March 2025",
      icon: TbMoneybag, iconBg: "bg-emerald-50", iconColor: "#059669", change: "+7.2%", positive: true, delay: 140,
    },
    {
      label: "Payroll Exceptions", value: String(exceptions.length), sub: "Resolve before processing",
      icon: TbAlertHexagon, iconBg: "bg-red-50", iconColor: "#dc2626", change: null, delay: 210,
    },
  ];

  // ── actions ────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingPeriod(null);
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last  = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const pay   = new Date(today.getFullYear(), today.getMonth() + 1, 5);
    setFormData({
      name: `Payroll ${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      periodType: "monthly",
      startDate: first.toISOString().split("T")[0],
      endDate:   last.toISOString().split("T")[0],
      payDate:   pay.toISOString().split("T")[0],
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    setFormData({ name: period.name, periodType: period.periodType, startDate: period.startDate, endDate: period.endDate, payDate: period.payDate });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.payDate) {
      setFormError("All fields are required."); return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    if (editingPeriod) {
      setPeriods(p => p.map(x => x.id === editingPeriod.id ? { ...x, ...formData } : x));
    } else {
      setPeriods(p => [{ id: String(Date.now()), ...formData, status: "draft", totalEmployees: 0, totalNet: 0, totalGross: 0, totalDeductions: 0 }, ...p]);
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  const triggerConfirm = (config) => setConfirmModal(config);

  const handleProcess = (id) => triggerConfirm({
    type: "confirm", title: "Process Payroll Period",
    message: "This will calculate payroll for all employees in this period. Continue?",
    confirmText: "Process",
    onConfirm: () => { setPeriods(p => p.map(x => x.id === id ? { ...x, status: "pending_approval" } : x)); setConfirmModal(null); },
  });

  const handleApprove = (id) => triggerConfirm({
    type: "confirm", title: "Approve Payroll Period",
    message: "Approve this payroll period and mark it ready for disbursement?",
    confirmText: "Approve",
    onConfirm: () => { setPeriods(p => p.map(x => x.id === id ? { ...x, status: "approved" } : x)); setConfirmModal(null); },
  });

  const handleLock = (id) => triggerConfirm({
    type: "confirm", title: "Lock Payroll Period",
    message: "Locking this period is permanent and cannot be undone. Proceed?",
    confirmText: "Lock",
    onConfirm: () => { setPeriods(p => p.map(x => x.id === id ? { ...x, status: "locked" } : x)); setConfirmModal(null); },
  });

  const handleDelete = (id) => triggerConfirm({
    type: "delete", title: "Delete Payroll Period",
    message: "This will permanently delete the payroll period. This action cannot be undone.",
    confirmText: "Delete",
    onConfirm: () => { setPeriods(p => p.filter(x => x.id !== id)); setConfirmModal(null); },
  });

  const dismissException = (id) => setExceptions(e => e.filter(x => x.id !== id));

  const grossTotal    = PAYROLL_SUMMARY.filter(r => r.type === "earning").reduce((s, r) => s + r.amount, 0);
  const dedTotal      = PAYROLL_SUMMARY.filter(r => r.type === "deduction").reduce((s, r) => s + r.amount, 0);
  const netTotal      = grossTotal - dedTotal;

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="space-y-6 pb-10">

        {/* ── PAGE HEADER ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-up">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <TbReceiptTax className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Payroll Processing</h1>
                <div className="w-px h-6 bg-slate-200" />
                <p className="text-[13px] text-slate-500 font-medium">Manage payroll periods, summaries & exceptions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-12">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">March 2025 — Not Yet Processed</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => {}} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors">
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleCreate}
              className="flex items-center gap-2 text-[12.5px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]">
              <FiPlus className="w-4 h-4" /> New Period
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── PAYROLL SUMMARY + EXCEPTIONS ROW ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Payroll Summary Card ── */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Blue header strip */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Payroll Summary</h3>
                <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">March 2025 · Estimated breakdown</p>
              </div>
              <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">Not Processed</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-5 py-2.5">Component</th>
                    <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-5 py-2.5">Employees</th>
                    <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-5 py-2.5">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {PAYROLL_SUMMARY.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className={`text-[13px] font-medium ${row.type === "deduction" ? "text-slate-500" : "text-slate-700"}`}>
                          {row.type === "deduction" && <span className="text-red-400 mr-1 font-bold">−</span>}
                          {row.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-[12.5px] text-slate-400">{row.employees}</td>
                      <td className={`px-5 py-2.5 text-right font-mono font-semibold text-[13px] ${row.type === "deduction" ? "text-red-500" : "text-emerald-600"}`}>
                        {row.type === "deduction" ? "−" : ""}{fmt(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-5 py-3 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Total Gross</td>
                    <td className="px-5 py-3 text-right font-mono text-[12.5px] text-slate-400">247</td>
                    <td className="px-5 py-3 text-right font-mono font-extrabold text-[14px] text-emerald-600">{fmt(grossTotal)}</td>
                  </tr>
                  <tr className="bg-blue-50/50 border-t border-blue-100">
                    <td className="px-5 py-3 text-[13px] font-extrabold text-slate-800 uppercase tracking-wide">NET PAY</td>
                    <td className="px-5 py-3 text-right font-mono text-[12.5px] font-bold text-slate-600">247</td>
                    <td className="px-5 py-3 text-right font-mono font-extrabold text-[16px] text-blue-600">{fmt(netTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Total bar */}
            <div className="px-5 py-4 border-t border-slate-100 grid grid-cols-3 gap-4">
              {[
                { label: "Gross Earnings", value: `KES ${(grossTotal/1e6).toFixed(1)}M`, color: "text-emerald-600" },
                { label: "Total Deductions", value: `−KES ${(dedTotal/1e6).toFixed(1)}M`, color: "text-red-500" },
                { label: "Net Disbursement", value: `KES ${(netTotal/1e6).toFixed(1)}M`, color: "text-blue-600" },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl px-4 py-3 ${i === 2 ? "bg-blue-50 border border-blue-100" : "bg-slate-50 border border-slate-100"}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`font-mono font-extrabold text-[15px] ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Exceptions Card ── */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Payroll Exceptions</h3>
                <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">Issues to resolve before processing</p>
              </div>
              {exceptions.length > 0 && (
                <span className="text-[10.5px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">{exceptions.length} issues</span>
              )}
            </div>
            <div className="flex-1 px-4 py-4 space-y-2.5">
              {exceptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <TbCircleCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13.5px] font-bold text-slate-700">All exceptions resolved</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">Ready to process payroll</p>
                  </div>
                </div>
              ) : exceptions.map(ex => {
                const isError = ex.severity === "error";
                return (
                  <div key={ex.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-2xl border group/ex ${isError ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isError ? "bg-red-100" : "bg-amber-100"}`}>
                      {isError
                        ? <FiAlertCircle className="w-3.5 h-3.5 text-red-600" />
                        : <FiAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12.5px] font-bold truncate ${isError ? "text-red-700" : "text-amber-700"}`}>{ex.employee}</p>
                      <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">{ex.issue}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover/ex:opacity-100 transition-opacity">
                      <button className={`text-[10.5px] font-bold px-2 py-1 rounded-lg border transition-colors ${isError ? "text-red-600 border-red-200 hover:bg-red-100" : "text-amber-600 border-amber-200 hover:bg-amber-100"}`}>
                        Fix
                      </button>
                      <button onClick={() => dismissException(ex.id)} className="w-6 h-6 rounded-lg bg-white/60 border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {exceptions.length > 0 && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => triggerConfirm({
                    type: "confirm", title: "Process Payroll Anyway",
                    message: `There are ${exceptions.length} unresolved exceptions. Affected employees will be skipped. Continue?`,
                    confirmText: "Process Anyway",
                    onConfirm: () => setConfirmModal(null),
                  })}
                  className="w-full flex items-center justify-center gap-2 text-[12.5px] font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-2xl transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
                  <FiPlay className="w-3.5 h-3.5" /> Process March 2025 Payroll
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PREVIOUS PERIODS TABLE ───────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Payroll Periods</h3>
              <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">{filtered.length} total periods</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["", "draft", "pending_approval", "approved", "locked", "paid"].map(s => (
                  <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all duration-150 ${filterStatus === s ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}>
                    {s === "" ? "All" : STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {["Period", "Type", "Dates", "Pay Date", "Employees", "Gross", "Net Pay", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: j === 0 ? 120 : j === 8 ? 80 : 70 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <FiCalendar className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-600">No periods found</p>
                          <p className="text-[12px] text-slate-400 mt-0.5">Try adjusting your filter or create a new period</p>
                        </div>
                        <button onClick={handleCreate}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl hover:bg-blue-50 transition-colors mt-1">
                          <FiPlus className="w-3.5 h-3.5" /> New Period
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((period) => (
                  <tr key={period.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-semibold text-slate-800 whitespace-nowrap">{period.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11.5px] font-medium text-slate-500 capitalize bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">{period.periodType}</span>
                    </td>
                    <td className="px-5 py-4 text-[12.5px] text-slate-500 whitespace-nowrap font-medium">
                      {fmtDate(period.startDate)} – {fmtDate(period.endDate)}
                    </td>
                    <td className="px-5 py-4 text-[12.5px] text-slate-500 whitespace-nowrap font-medium">
                      {fmtDate(period.payDate)}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-mono text-slate-600">
                      {period.totalEmployees > 0 ? period.totalEmployees : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-[12.5px] font-semibold text-emerald-600 whitespace-nowrap">
                      {period.totalGross > 0 ? `${(period.totalGross/1e6).toFixed(1)}M` : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-[13px] font-bold text-blue-600 whitespace-nowrap">
                      {period.totalNet > 0 ? `KES ${(period.totalNet/1e6).toFixed(1)}M` : "—"}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={period.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {/* View */}
                        <button className="w-7 h-7 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors" title="View / Review">
                          <FiEye className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit (draft only) */}
                        {period.status === "draft" && (
                          <button onClick={() => handleEdit(period)} className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors" title="Edit">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Process (draft) */}
                        {period.status === "draft" && (
                          <button onClick={() => handleProcess(period.id)} className="w-7 h-7 rounded-lg text-violet-600 hover:bg-violet-50 flex items-center justify-center transition-colors" title="Process">
                            <FiPlay className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Approve (pending_approval) */}
                        {period.status === "pending_approval" && (
                          <button onClick={() => handleApprove(period.id)} className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors" title="Approve">
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Lock (approved) */}
                        {period.status === "approved" && (
                          <button onClick={() => handleLock(period.id)} className="w-7 h-7 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors" title="Lock">
                            <FiLock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete (draft only) */}
                        {period.status === "draft" && (
                          <button onClick={() => handleDelete(period.id)} className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <span className="text-[12px] text-slate-400 font-medium">
                {filtered.length > 0 ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}` : ""}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 text-[12px] font-bold rounded-xl transition-colors ${currentPage === pg ? "bg-blue-600 text-white border border-blue-600" : "text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
                    {pg}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── MODALS ──────────────────────────────────────── */}
      {isFormOpen && (
        <PeriodFormModal
          editing={!!editingPeriod}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          error={formError}
        />
      )}

      <ConfirmModal
        config={confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => confirmModal?.onConfirm?.()}
      />
    </>
  );
};

export default PeriodsPage;