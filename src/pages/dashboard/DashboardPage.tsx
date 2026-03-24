import React, { useEffect, useState } from "react";
import {
  FiDollarSign, FiClock, FiArrowUpRight, FiArrowDownRight,
  FiCalendar, FiCheckCircle, FiAlertCircle,
  FiUserPlus, FiChevronRight, FiTrendingUp,
  FiPlay, FiAlertTriangle, FiCheck, FiX, FiUsers,
  FiLayers
} from "react-icons/fi";
import { TbBuildingSkyscraper, TbCalendarDot, TbMoneybag, TbReceiptTax, TbTrendingUp } from "react-icons/tb";
import { PiHandCoinsDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { useAuthStore } from "../../store/authStore";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/ui/SectionCard";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell, Tooltip as PieTooltip,
} from "recharts";

/* ─── MOCK DATA ─────────────────────────────────────── */
const departmentPayroll = [
  { name: "Engineering", amount: 14800000, pct: 28, color: "#2563eb" },
  { name: "Sales", amount: 10500000, pct: 20, color: "#0891b2" },
  { name: "Finance", amount: 7350000, pct: 14, color: "#7c3aed" },
  { name: "Operations", amount: 6280000, pct: 12, color: "#059669" },
  { name: "HR & Admin", amount: 5240000, pct: 10, color: "#d97706" },
  { name: "IT", amount: 4714000, pct: 9, color: "#0284c7" },
  { name: "Marketing", amount: 3534000, pct: 7, color: "#db2777" },
];

const payrollBars = [
  { m: "Aug", v: 46.2 }, { m: "Sep", v: 47.1 }, { m: "Oct", v: 46.8 },
  { m: "Nov", v: 47.5 }, { m: "Dec", v: 48.9 }, { m: "Jan", v: 49.8 },
  { m: "Feb", v: 51.4 }, { m: "Mar", v: 52.4 },
];

const activityLog = [
  { type: "success", icon: FiCheckCircle, title: "March payroll processed", meta: "247 employees · KES 38.7M disbursed", time: "2 min ago" },
  { type: "info", icon: FiUserPlus, title: "New employee onboarded", meta: "Engineering — Senior Dev", time: "1h ago" },
  { type: "warn", icon: FiAlertCircle, title: "Expense pending review", meta: "KES 45,000 · Travel & Accommodation", time: "3h ago" },
  { type: "success", icon: FiCheckCircle, title: "Loan approved", meta: "Staff loan · KES 120,000", time: "5h ago" },
  { type: "info", icon: FiDollarSign, title: "Salary structure updated", meta: "Housing allowance revised upward", time: "1d ago" },
];

const approvalQueue = [
  { name: "Esther Wambui", detail: "Housing Loan · KES 150,000", type: "loan", urgency: "high" },
  { name: "Amina Mwangi", detail: "Personal Loan · KES 80,000", type: "loan", urgency: "medium" },
  { name: "Brian Odhiambo", detail: "Client Lunch · KES 18,000", type: "expense", urgency: "medium" },
  { name: "Daniel Kiprono", detail: "Conference Reg. · KES 45,000", type: "expense", urgency: "high" },
];

const workforceSegments = [
  { label: "Permanent", count: 168, pct: 68, color: "#2563eb" },
  { label: "Contract", count: 40, pct: 16, color: "#0891b2" },
  { label: "Part-Time", count: 25, pct: 10, color: "#d97706" },
  { label: "Intern", count: 14, pct: 6, color: "#e2e8f0" },
];

/* ─── RECHARTS BAR TOOLTIP ──────────────────────────── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700 text-[12px]">
      <p className="font-bold text-slate-300 mb-0.5">{label}</p>
      <p className="font-extrabold text-white text-[14px]">KES {payload[0].value}M</p>
    </div>
  );
};

/* ─── RECHARTS BAR CHART ────────────────────────────── */
const PayrollBarChart = () => {
  const lastIdx = payrollBars.length - 1;
  return (
    <ResponsiveContainer width="100%" height={152}>
      <BarChart data={payrollBars} barCategoryGap="6%" margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="m"
          tick={{ fontSize: 10, fontWeight: 700, fill: "#45556c", letterSpacing: 1 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11.5, fill: "#45556c" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}M`}
          domain={[44, 54]}
        />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc", radius: 6 }} />
        <Bar dataKey="v" radius={[8, 8, 0, 0]} maxBarSize={100}>
          {payrollBars.map((entry, i) => (
            <Cell
              key={i}
              fill={i === lastIdx ? "url(#barGradientActive)" : "#16a34a"}
            />
          ))}
        </Bar>
        <defs>
          <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ─── RECHARTS DONUT CHART ──────────────────────────── */
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700 text-[12px]">
      <p className="font-bold text-slate-300 mb-0.5">{payload[0].name}</p>
      <p className="font-extrabold text-white text-[14px]">{payload[0].value} employees</p>
      <p className="text-slate-400 text-[11px]">{payload[0].payload.pct}% of workforce</p>
    </div>
  );
};

const DonutChart = () => {
  /* paddingAngle creates the gap between segments */
  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={workforceSegments}
              cx={85}
              cy={85}
              innerRadius={50}
              outerRadius={85}
              paddingAngle={4}
              dataKey="count"
              nameKey="label"
              strokeWidth={0}
              cornerRadius={10}
            >
              {workforceSegments.map((seg, i) => (
                <PieCell key={i} fill={seg.color} />
              ))}
            </Pie>
            <PieTooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">247</span>
          <span className="text-[0.6rem] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1">
        {workforceSegments.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
             <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-slate-500 flex-1">{s.label}</span>
            <span className="text-sm font-extrabold text-slate-700 font-google">{s.count}</span>
            <span className="text-xs text-slate-400 font-google w-7 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};



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
      <div className="h-1 w-full bg-gradient-to-r from-primary-700 to-primary-400" />
      <div className="px-7 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center flex-shrink-0">
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
                <td className="px-4 py-3 font-mono font-semibold text-secondary-600">52,418,300</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600">Total Deductions</td>
                <td className="px-4 py-3 font-mono text-slate-500">247</td>
                <td className="px-4 py-3 font-mono font-semibold text-red-500">−12,734,400</td>
              </tr>
              <tr className="bg-primary-50/60">
                <td className="px-4 py-3 font-bold text-slate-800">Net Disbursement</td>
                <td className="px-4 py-3 font-mono font-bold text-slate-700">247</td>
                <td className="px-4 py-3 font-mono font-extrabold text-primary-600 text-[15px]">39,683,900</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Disbursement Date</label>
            <input type="date" defaultValue="2025-03-31"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reference</label>
            <input type="text" placeholder="March 2025 Payroll"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-700 placeholder-slate-300 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
          </div>
        </div>
      </div>
      <div className="flex gap-2.5 justify-end px-7 pb-6">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
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
  const [toasts, setToasts] = useState([]);
  const [queue, setQueue] = useState(approvalQueue);
  const user = useAuthStore((s) => s.user);

  const addToast = (icon, title, sub) => {
    const id = Date.now();
    setToasts(p => [...p, { id, icon, title, sub }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @keyframes toastIn  { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .stagger-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .stagger-2 { animation: fadeUp 0.4s 0.10s ease both; }
        .stagger-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .stagger-4 { animation: fadeUp 0.4s 0.20s ease both; }
      `}</style>

      <div className="space-y-7 pb-8">

       {/* ── PAGE HEADER ───────────────────────────── */}
       <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TbCalendarDot size={20} className=" text-slate-400" />
              <span className="text-[0.9rem] font-medium font-google text-slate-400">{today}</span>
            </div>
            <h1 className="text-[2rem] font-extrabold font-google text-slate-900 tracking-tight leading-tight">
              {greeting}, {user?.firstName} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button variant="outline" size="sm" rounded="xl" className="py-2 px-5 ">
              <FiCalendar className="w-3.5 h-3.5" /> March 2025
            </Button>

            <Button variant="primary" size="sm" rounded="xl" className="py-2 px-5 ">
              <FiPlay className="w-3.5 h-3.5" /> Go to Payrolls
            </Button>


          </div>
        </div>

        {/* ── ALERT BANNER ──────────────────────────── */}
        {/* <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 fade-up" style={{ animationDelay: "80ms" }}>
          <FiAlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-[13px] text-amber-800">
            <span className="font-bold">Action Required:</span>{" "}
            <span className="text-amber-700">March 2025 payroll has not been run. 7 loan applications and 12 expense claims are awaiting approval.</span>{" "}
            <button onClick={() => setRunModal(true)} className="font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors">Process now →</button>
          </p>
        </div> */}

        {/* ── STAT CARDS (new reusable StatCard) ────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
          <div className="stagger-1">
            <StatCard
              icon={PiUsersThreeDuotone}
              iconColor="#101828"
              label="Total Employees"
              value="247"
              sub="Active headcount"
              badge={{ label: "+3 this month", positive: true }}
            />
          </div>
          <div className="stagger-2">
            <StatCard
              icon={TbBuildingSkyscraper}
              iconColor="#101828"
              label="Departments"
              value="12"
              sub="Active units"
            />
          </div>
          <div className="stagger-3">
            <StatCard
              icon={TbMoneybag}
              iconColor="#101828"
              label="Monthly Payroll"
              value="KES 52.4M"
              sub="March 2025"
              badge={{ label: "+7.2%", positive: true }}
            />
          </div>
          <div className="stagger-4">
            <StatCard
              icon={FiClock}
              iconColor="#d97706"
              label="Pending Actions"
              value="19"
              sub="Require attention"
              badge={{ label: "2 new", positive: null }}
            />
          </div>
        </div>

        {/* ── PAYROLL STATUS + CHART ROW ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* primary Payroll Status Card */}
          <div className="lg:col-span-2 rounded-4xl p-6 flex flex-col relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)" }}>

            <div className="relative z-10 flex flex-col flex-1 gap-4">
              <div>
                <p className=" flex justify-between gap-2 items-center text-sm font-bold text-primary-200 mb-1"><span>
                  Current Payroll Run</span><span className="text-sm text-secondary-300 font-medium">Period closes in 8 days</span></p>
                <p className="text-[1.2rem] font-bold text-white/90">March 2025 — Not Yet Processed</p>

              </div>
              <div className="text-center">
                <p className="text-sm text-primary-200/70 font-medium mb-1">Estimated Net Disbursement</p>
                <p className="text-5xl font-black font-google tracking-wide text-white  leading-none">
                  <span className="text-sm font-medium  text-primary-200 pr-1">KES </span>38.7M
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { l: "Gross", v: "52.4M", positive: true },
                  { l: "Deductions", v: "−13.7M", positive: false },
                  { l: "Net Pay", v: "38.7M", positive: true },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <p className="text-sm text-primary-200/60 font-medium">{s.l}</p>
                    <p className={`font-mono text-lg font-bold ${s.positive ? "text-secondary-300" : "text-red-300"}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setRunModal(true)}
                className="mt-auto flex items-center justify-center gap-2 text-sm font-semibold text-white/90 rounded-2xl py-2.5 hover:bg-white/10 transition-all duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
                <FiPlay className="w-3.5 h-3.5" /> Process March 2025 Payroll
              </button>
            </div>
          </div>

          <SectionCard title="Payroll Cost by Department" sub="Monthly gross — March 2025" className="lg:col-span-3">
            <div className="flex flex-col gap-2.5">
              {departmentPayroll.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 font-medium w-24 shrink-0 truncate">{d.name}</span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden border border-slate-100/50">
                    <div className="h-full flex items-center px-2.5 rounded-xl   text-white transition-all duration-700"
                      style={{ width: `${(d.pct / 28) * 100}%`, background: d.color, minWidth: 48 }}>
                      <span className="text-sm font-bold opacity-90">KES {(d.amount / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-400 w-8 text-right font-mono">{d.pct}%</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── WORKFORCE + PAYROLL BAR CHART ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Workforce Breakdown" sub="By employment type" className="lg:col-span-1">
            <DonutChart />
          </SectionCard>

          <SectionCard  
            title="Payroll Disbursements"
            sub="Monthly totals — last 8 months"
            className="lg:col-span-2"
            badge={
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-secondary-600 bg-secondary-50 border border-secondary-100 px-2.5 py-1 rounded-lg">
                <TbTrendingUp className="w-3.5 h-3.5" /> +8.3% avg
              </span>
            }>
            <PayrollBarChart />
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Values in KES millions</span>
              <span className="text-sm font-semibold text-primary-500">Mar 2025: KES 52.4M ↑</span>
            </div>
          </SectionCard>
        </div>

        {/* ── APPROVALS + ACTIVITY ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Approval Queue */}
          <SectionCard
            title="Approval Queue" sub="Loans & expenses" action="View all"
            badge={<span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">{queue.length} pending</span>}
            className="lg:col-span-2"
          >
            <div className="flex flex-col divide-y divide-slate-50">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <FiCheckCircle className="w-8 h-8 text-slate-300" />
                  <p className="font-semibold text-slate-400 text-sm">All caught up!</p>
                </div>
              ) : queue.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 group/item">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === "loan" ? "bg-primary-50 border border-primary-200" : "bg-amber-50 border border-amber-200"}`}>
                    {item.type === "loan"
                      ? <PiHandCoinsDuotone className="w-[1.2rem] h-[1.2rem] text-primary-600" />
                      : <TbReceiptTax className="w-[1.1rem] h-[1.1rem] text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.88rem] font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[0.78rem] text-slate-400 truncate">{item.detail}</p>
                  </div>
                  {item.urgency === "high" && (
                    <span className="text-[9px] font-bold text-red-500 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">Urgent</span>
                  )}
                  <div className="flex gap-1.5 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => { addToast("✅", "Approved", item.name + " — " + item.detail); setQueue(q => q.filter((_, j) => j !== i)); }}
                      className="w-7 h-7 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-600 hover:bg-secondary-100 transition-colors flex items-center justify-center">
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { addToast("❌", "Rejected", item.name + " — Request declined"); setQueue(q => q.filter((_, j) => j !== i)); }}
                      className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Activity Feed */}
          <SectionCard title="Recent Activity" sub="Live system events" action="View all" className="lg:col-span-3">
            <div className="flex flex-col gap-0.5">
              {activityLog.map((a, i) => {
                const Icon = a.icon;
                const styles = {
                  success: { wrap: "bg-secondary-50 border-secondary-200", icon: "text-secondary-600" },
                  info: { wrap: "bg-primary-50 border-primary-200", icon: "text-primary-600" },
                  warn: { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-600" },
                };
                const s = styles[a.type];
                return (
                  <div key={i} className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-default group">
                    <div className={`w-9 h-9 rounded-xl ${s.wrap} border flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${s.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.88rem] font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-[0.78rem] text-slate-400 font-medium mt-0.5 truncate">{a.meta}</p>
                    </div>
                    <span className="text-[0.78rem] text-slate-400 font-semibold shrink-0 mt-0.5 group-hover:text-slate-600 transition-colors whitespace-nowrap">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
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