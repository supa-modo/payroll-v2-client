import React, { useEffect, useState } from "react";
import {
  FiUsers, FiDollarSign, FiClock, FiArrowUpRight, FiArrowDownRight,
  FiCalendar, FiCheckCircle, FiAlertCircle,
  FiUserPlus, FiChevronRight, FiTrendingUp,
  FiPlay, FiAlertTriangle, FiCheck, FiX
} from "react-icons/fi";
import { TbBuildingSkyscraper, TbMoneybag, TbReceiptTax, TbTrendingUp } from "react-icons/tb";
import { PiUsersThreeDuotone } from "react-icons/pi";

/* ─── MOCK DATA ─────────────────────────────────────── */
const departmentPayroll = [
  { name: "Engineering",  amount: 14800000, pct: 28, color: "#2563eb" },
  { name: "Sales",        amount: 10500000, pct: 20, color: "#0891b2" },
  { name: "Finance",      amount: 7350000,  pct: 14, color: "#7c3aed" },
  { name: "Operations",   amount: 6280000,  pct: 12, color: "#059669" },
  { name: "HR & Admin",   amount: 5240000,  pct: 10, color: "#d97706" },
  { name: "IT",           amount: 4714000,  pct: 9,  color: "#0284c7" },
  { name: "Marketing",    amount: 3534000,  pct: 7,  color: "#db2777" },
];

const payrollBars = [
  { m: "Aug", v: 46.2 }, { m: "Sep", v: 47.1 }, { m: "Oct", v: 46.8 },
  { m: "Nov", v: 47.5 }, { m: "Dec", v: 48.9 }, { m: "Jan", v: 49.8 },
  { m: "Feb", v: 51.4 }, { m: "Mar", v: 52.4 },
];

const activityLog = [
  { type: "success", icon: FiCheckCircle,  title: "March payroll processed",  meta: "247 employees · KES 38.7M disbursed",    time: "2 min ago" },
  { type: "info",    icon: FiUserPlus,     title: "New employee onboarded",   meta: "Engineering — Senior Dev",               time: "1h ago"    },
  { type: "warn",    icon: FiAlertCircle,  title: "Expense pending review",   meta: "KES 45,000 · Travel & Accommodation",    time: "3h ago"    },
  { type: "success", icon: FiCheckCircle,  title: "Loan approved",            meta: "Staff loan · KES 120,000",               time: "5h ago"    },
  { type: "info",    icon: FiDollarSign,   title: "Salary structure updated", meta: "Housing allowance revised upward",        time: "1d ago"    },
];

const deptBreakdown = [
  { name: "Engineering",        count: 14, payroll: "1,820,000", pct: 31, status: "processed" },
  { name: "Finance & Accts",    count: 7,  payroll: "910,000",   pct: 16, status: "processed" },
  { name: "Operations",         count: 19, payroll: "2,090,000", pct: 36, status: "pending"   },
  { name: "HR & Administration",count: 6,  payroll: "780,000",   pct: 13, status: "processed" },
  { name: "Sales & Marketing",  count: 4,  payroll: "520,000",   pct: 9,  status: "processed" },
];

const approvalQueue = [
  { name: "Esther Wambui",  detail: "Housing Loan · KES 150,000",    type: "loan",    urgency: "high"   },
  { name: "Amina Mwangi",   detail: "Personal Loan · KES 80,000",    type: "loan",    urgency: "medium" },
  { name: "Brian Odhiambo", detail: "Client Lunch · KES 18,000",     type: "expense", urgency: "medium" },
  { name: "Daniel Kiprono", detail: "Conference Reg. · KES 45,000",  type: "expense", urgency: "high"   },
];

const workforceSegments = [
  { label: "Permanent", count: 168, pct: 68, color: "#2563eb" },
  { label: "Contract",  count: 40,  pct: 16, color: "#0891b2" },
  { label: "Part-Time", count: 25,  pct: 10, color: "#d97706" },
  { label: "Intern",    count: 14,  pct: 6,  color: "#9ca3af" },
];

/* ─── SPARKLINE ─────────────────────────────────────── */
const Sparkline = ({ data, color }) => {
  const w = 88, h = 34;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 6) - 3
  ]);
  const line = `M ${pts.map(p => p.join(",")).join(" L ")}`;
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace("#","")})`} />
      <path d={line} stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={color} />
    </svg>
  );
};

/* ─── PAYROLL BAR CHART ─────────────────────────────── */
const PayrollBarChart = () => {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...payrollBars.map(b => b.v));
  return (
    <div className="flex items-end gap-2 h-36 w-full pt-1">
      {payrollBars.map((bar, i) => {
        const pct = (bar.v / max) * 100;
        const isLast = i === payrollBars.length - 1;
        const isHov = hovered === i;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {isHov && (
              <div className="text-[10px] font-bold text-white bg-slate-800 rounded-lg px-2 py-1 whitespace-nowrap shadow-lg mb-0.5">
                KES {bar.v}M
              </div>
            )}
            <div className="w-full rounded-t-xl transition-all duration-200"
              style={{
                height: `${pct}%`,
                background: isLast
                  ? "linear-gradient(to top, #1d4ed8, #2563eb)"
                  : isHov
                  ? "linear-gradient(to top, #3b82f6, #60a5fa)"
                  : "#e0e7ff",
                minHeight: 6,
              }} />
            <span className={`text-[9px] font-bold uppercase tracking-wide ${isLast ? "text-blue-600" : "text-slate-400"}`}>{bar.m}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── DONUT CHART ───────────────────────────────────── */
const DonutChart = () => {
  const r = 48, cx = 60, cy = 60, sw = 16;
  const circ = 2 * Math.PI * r;
  let offset = -0.25 * circ;
  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
          {workforceSegments.map((seg, i) => {
            const dash = (seg.pct / 100) * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color} strokeWidth={sw}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt" />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-slate-900">247</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 flex-1">
        {workforceSegments.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-slate-500 flex-1">{s.label}</span>
            <span className="text-sm font-bold text-slate-700 font-mono">{s.count}</span>
            <span className="text-xs text-slate-400 font-mono w-7 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── KPI CARD ──────────────────────────────────────── */
const KPICard = ({ label, value, sub, change, positive, sparkData, sparkColor, icon: Icon, iconBg, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      className={`group bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-default ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{ transition: `opacity 0.45s ${delay}ms ease, transform 0.45s ${delay}ms ease, box-shadow 0.2s, border-color 0.2s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" style={{ color: sparkColor }} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {positive ? <FiArrowUpRight className="w-3 h-3" /> : <FiArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
          <p className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none truncate">{value}</p>
          {sub && <p className="text-[11.5px] text-slate-400 mt-1.5 font-medium">{sub}</p>}
        </div>
        {sparkData && (
          <div className="flex-shrink-0 mb-1">
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── SECTION CARD ──────────────────────────────────── */
const Card = ({ title, sub, action, badge, children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${className}`}>
    {(title || action || badge) && (
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
          {sub && <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {action && (
            <button className="flex items-center gap-0.5 text-[11.5px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {action} <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    )}
    <div className="px-6 py-5">{children}</div>
  </div>
);

/* ─── TOAST ─────────────────────────────────────────── */
const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
    {toasts.map(t => (
      <div key={t.id}
        className="flex items-start gap-3 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl min-w-[280px] border border-slate-700"
        style={{ animation: "toastIn 0.3s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <span className="text-base flex-shrink-0 mt-0.5">{t.icon}</span>
        <div>
          <p className="text-[13px] font-bold">{t.title}</p>
          {t.sub && <p className="text-[11.5px] text-slate-400 mt-0.5">{t.sub}</p>}
        </div>
      </div>
    ))}
  </div>
);

/* ─── RUN PAYROLL MODAL ─────────────────────────────── */
const RunPayrollModal = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
    style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-3xl w-full max-w-[520px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
      style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>
      <div className="h-1 w-full bg-gradient-to-r from-blue-700 to-blue-400" />
      <div className="px-7 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <FiPlay className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-900">Run March 2025 Payroll</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Processing payroll for all 247 employees</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-7 py-5 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-2.5 items-start">
          <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <span className="text-sm text-amber-700">4 exceptions must be resolved before processing. Running anyway will skip affected employees.</span>
        </div>
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Item", "Employees", "Amount (KES)"].map(h => (
                  <th key={h} className="text-left text-[10.5px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-3 text-slate-600">Gross Earnings</td>
                <td className="px-4 py-3 font-mono text-slate-500">247</td>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">52,418,300</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600">Total Deductions</td>
                <td className="px-4 py-3 font-mono text-slate-500">247</td>
                <td className="px-4 py-3 font-mono font-semibold text-red-500">−12,734,400</td>
              </tr>
              <tr className="bg-blue-50/60">
                <td className="px-4 py-3 font-bold text-slate-800">Net Disbursement</td>
                <td className="px-4 py-3 font-mono font-bold text-slate-700">247</td>
                <td className="px-4 py-3 font-mono font-extrabold text-blue-600 text-[15px]">39,683,900</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Disbursement Date</label>
            <input type="date" defaultValue="2025-03-31"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reference</label>
            <input type="text" placeholder="March 2025 Payroll"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-700 placeholder-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
      </div>
      <div className="flex gap-2.5 justify-end px-7 pb-6">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
          <FiPlay className="w-3.5 h-3.5" /> Confirm & Process
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [runModal, setRunModal] = useState(false);
  const [toasts, setToasts]     = useState([]);
  const [queue, setQueue]       = useState(approvalQueue);

  const addToast = (icon, title, sub) => {
    const id = Date.now();
    setToasts(p => [...p, { id, icon, title, sub }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    {
      label: "Total Employees", value: "247", sub: "Active headcount",
      change: "+3 this month", positive: true,
      sparkData: [220,224,228,226,232,238,244,247], sparkColor: "#2563eb",
      icon: PiUsersThreeDuotone, iconBg: "bg-blue-50", delay: 0,
    },
    {
      label: "Departments", value: "12", sub: "Active units",
      sparkData: null, sparkColor: "#0891b2",
      icon: TbBuildingSkyscraper, iconBg: "bg-cyan-50", delay: 70,
    },
    {
      label: "Monthly Payroll", value: "KES 52.4M", sub: "March 2025",
      change: "+7.2%", positive: true,
      sparkData: [46.2,47.1,46.8,47.5,48.9,49.8,51.4,52.4], sparkColor: "#059669",
      icon: TbMoneybag, iconBg: "bg-emerald-50", delay: 140,
    },
    {
      label: "Pending Actions", value: "19", sub: "Require attention",
      change: "2 from last week", positive: true,
      sparkData: [28,22,26,18,24,16,19,19], sparkColor: "#d97706",
      icon: FiClock, iconBg: "bg-amber-50", delay: 210,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes toastIn  { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="space-y-6 pb-8">

        {/* ── PAGE HEADER ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TbCalendarDot className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-400">{today}</span>
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {greeting}, David 👋
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 font-medium">Here's what's happening with your payroll today.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm px-4 py-2.5 rounded-xl transition-all duration-150">
              <FiCalendar className="w-3.5 h-3.5" /> March 2025
            </button>
            <button
              onClick={() => setRunModal(true)}
              className="flex items-center gap-2 text-[12.5px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all duration-150 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
            >
              <FiPlay className="w-3.5 h-3.5" /> Run Payroll
            </button>
          </div>
        </div>

        {/* ── ALERT BANNER ──────────────────────────── */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 fade-up" style={{ animationDelay: "80ms" }}>
          <FiAlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[13px] text-amber-800">
            <span className="font-bold">Action Required:</span>{" "}
            <span className="text-amber-700">March 2025 payroll has not been run. 7 loan applications and 12 expense claims are awaiting approval.</span>{" "}
            <button onClick={() => setRunModal(true)} className="font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors">Process now →</button>
          </p>
        </div>

        {/* ── KPI GRID ──────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} {...k} />)}
        </div>

        {/* ── PAYROLL STATUS + CHART ROW ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Blue Payroll Status Card */}
          <div className="lg:col-span-2 rounded-3xl p-6 flex flex-col relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)" }}>
            {/* subtle decorative circles */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />

            <div className="relative z-10 flex flex-col flex-1 gap-4">
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.18em] mb-1">Current Payroll Run</p>
                <p className="text-[15px] font-bold text-white/90">March 2025 — Not Yet Processed</p>
                <p className="text-[11px] text-blue-200/70 font-medium mt-0.5">Period closes in 8 days</p>
              </div>
              <div>
                <p className="text-[11px] text-blue-200/70 font-medium mb-1">Estimated Net Disbursement</p>
                <p className="text-[38px] font-black text-white tracking-tight leading-none">
                  <span className="text-[16px] font-medium text-blue-200">KES </span>38.7M
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { l: "Gross",      v: "52.4M",  positive: true  },
                  { l: "Deductions", v: "−13.7M", positive: false },
                  { l: "Net Pay",    v: "38.7M",  positive: true  },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <p className="text-[9px] text-blue-200/60 uppercase tracking-widest font-bold mb-1">{s.l}</p>
                    <p className={`font-mono text-[13px] font-bold ${s.positive ? "text-emerald-300" : "text-red-300"}`}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-blue-200/60 font-medium mb-2">
                  <span>Payroll Completion</span><span>0 / 247</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="h-full rounded-full w-0" style={{ background: "linear-gradient(90deg, #6ee7b7, #60a5fa)" }} />
                </div>
              </div>
              <button onClick={() => setRunModal(true)}
                className="mt-auto flex items-center justify-center gap-2 text-[12.5px] font-bold text-white/90 rounded-xl py-2.5 hover:bg-white/10 transition-all duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
                <FiPlay className="w-3.5 h-3.5" /> Process March 2025 Payroll
              </button>
            </div>
          </div>

          {/* Payroll Bar Chart */}
          <Card title="Payroll Disbursements" sub="Monthly totals — last 8 months" className="lg:col-span-3"
            badge={
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                <TbTrendingUp className="w-3.5 h-3.5" /> +8.3% avg
              </span>
            }>
            <PayrollBarChart />
            <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-[11.5px] font-medium text-slate-400">Disbursed</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300">KES values in millions</span>
            </div>
          </Card>
        </div>

        {/* ── WORKFORCE + DEPT PAYROLL ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Workforce Breakdown" sub="By employment type">
            <DonutChart />
          </Card>

          <Card title="Payroll by Department" sub="Monthly gross — March 2025"
            badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wide">Cost Split</span>}>
            <div className="flex flex-col gap-2.5">
              {departmentPayroll.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-500 w-24 flex-shrink-0 truncate">{d.name}</span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                    <div className="h-full flex items-center px-2.5 rounded-lg text-white transition-all duration-700"
                      style={{ width: `${(d.pct / 28) * 100}%`, background: d.color, minWidth: 48 }}>
                      <span className="text-[10px] font-bold opacity-90">KES {(d.amount / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-400 w-8 text-right font-mono">{d.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── APPROVALS + ACTIVITY ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Approval Queue */}
          <Card
            title="Approval Queue" sub="Loans & expenses awaiting action" action="View all"
            badge={<span className="text-[10.5px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">{queue.length} pending</span>}
            className="lg:col-span-2"
          >
            <div className="flex flex-col divide-y divide-slate-50">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <FiCheckCircle className="w-8 h-8 text-emerald-400" />
                  <p className="text-[13px] font-semibold text-slate-400">All caught up!</p>
                </div>
              ) : queue.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 group/item">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.type === "loan" ? "bg-blue-50 border border-blue-100" : "bg-amber-50 border border-amber-100"}`}>
                    {item.type === "loan"
                      ? <TbMoneybag className="w-4 h-4 text-blue-600" />
                      : <TbReceiptTax className="w-4 h-4 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11.5px] text-slate-400 font-medium truncate">{item.detail}</p>
                  </div>
                  {item.urgency === "high" && (
                    <span className="text-[9.5px] font-bold text-red-500 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded-lg uppercase tracking-wide flex-shrink-0">Urgent</span>
                  )}
                  <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => { addToast("✅", "Approved", item.name + " — " + item.detail); setQueue(q => q.filter((_, j) => j !== i)); }}
                      className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center">
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { addToast("❌", "Rejected", item.name + " — Request declined"); setQueue(q => q.filter((_, j) => j !== i)); }}
                      className="w-7 h-7 rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card title="Recent Activity" sub="Live system events" action="View all" className="lg:col-span-3">
            <div className="flex flex-col gap-0.5">
              {activityLog.map((a, i) => {
                const Icon = a.icon;
                const styles = {
                  success: { wrap: "bg-emerald-50 border-emerald-100", icon: "text-emerald-600" },
                  info:    { wrap: "bg-blue-50 border-blue-100",       icon: "text-blue-600"    },
                  warn:    { wrap: "bg-amber-50 border-amber-100",     icon: "text-amber-600"   },
                };
                const s = styles[a.type];
                return (
                  <div key={i} className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-default group">
                    <div className={`w-9 h-9 rounded-2xl ${s.wrap} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${s.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-[11.5px] text-slate-400 font-medium mt-0.5 truncate">{a.meta}</p>
                    </div>
                    <span className="text-[10.5px] text-slate-300 font-semibold flex-shrink-0 mt-0.5 group-hover:text-slate-400 transition-colors whitespace-nowrap">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── DEPARTMENT TABLE ──────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Department Breakdown</h3>
              <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">Headcount & payroll distribution for March 2025</p>
            </div>
            <button className="flex items-center gap-0.5 text-[11.5px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
              View departments <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70">
                  {["Department", "Employees", "Payroll (KES)", "Share", "Status"].map(h => (
                    <th key={h} className="text-left text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptBreakdown.map((d, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                          <TbBuildingSkyscraper className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[13.5px] font-semibold text-slate-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-500 font-mono font-medium">{d.count}</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-800 font-mono">{d.payroll}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="text-[11.5px] font-bold text-slate-400 font-mono">{d.pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full ${
                        d.status === "processed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.status === "processed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {d.status === "processed" ? "Processed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {runModal && (
        <RunPayrollModal
          onClose={() => setRunModal(false)}
          onConfirm={() => {
            setRunModal(false);
            addToast("🚀", "Payroll Processing Started", "March 2025 · KES 38.7M · 247 employees");
            setTimeout(() => addToast("🎉", "Payroll Completed", "All employees processed. Disbursement: 31 Mar 2025"), 3200);
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}