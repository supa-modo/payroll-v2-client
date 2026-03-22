/**
 * EmployeeSalaryTab
 * Renders inside EmployeeDetailDrawer – matches the drawer's design language exactly.
 * Handles: salary overview, add component modal, edit component amount inline.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown,
  FiDollarSign, FiX, FiEdit2, FiCheck,
} from "react-icons/fi";
import { TbMoneybag, TbReceiptTax } from "react-icons/tb";
import api from "../../services/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DateInput from "@/components/ui/DateInput";
import Textarea from "@/components/ui/Textarea";
import type { EmployeeSalary, SalaryComponent, AssignSalaryComponentsInput } from "../../types/salary";
import { autoCalcStatutoryAmount } from "@/utils/statutoryCalc";

/* ─── helpers ────────────────────────────────────────────── */
const KES = (v: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);

const fmt = (d?: string | null) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

/* ─── sub-components ─────────────────────────────────────── */

/** Stat card matching drawer's white-card aesthetic */
const StatCard = ({
  icon, label, value, accent = false, sub,
}: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean; sub?: string;
}) => (
  <div className={`rounded-2xl border px-5 py-4 flex flex-col gap-2 ${accent ? "border-primary-200 bg-primary-50" : "border-slate-200 bg-white"}`}>
    <div className="flex items-center gap-2">
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-primary-100" : "bg-slate-100"}`}>
        {icon}
      </span>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
    <p className={`text-xl font-bold font-mono tracking-tight ${accent ? "text-primary-700" : "text-slate-800"}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);

/** Single component row */
const ComponentRow = ({
  name, amount, effectiveFrom, effectiveTo, type, onDelete, onEdit,
}: {
  name: string; amount: number; effectiveFrom: string; effectiveTo?: string | null;
  type: "earning" | "deduction"; onDelete?: () => void; onEdit?: () => void;
}) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors group">
    <div className="flex items-center gap-3 min-w-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${type === "earning" ? "bg-emerald-500" : "bg-red-400"}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {fmt(effectiveFrom)}{effectiveTo ? ` → ${fmt(effectiveTo)}` : "  (ongoing)"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0 ml-4">
      <p className={`text-sm font-bold font-mono ${type === "earning" ? "text-emerald-600" : "text-red-500"}`}>
        {type === "deduction" ? "−" : "+"}{KES(amount)}
      </p>
      {onEdit && (
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

/* ─── Add Component Modal ────────────────────────────────── */
interface AddModalProps {
  employeeId: string;
  basicSalary: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AddComponentModal: React.FC<AddModalProps> = ({ employeeId, basicSalary, onClose, onSuccess }) => {
  const [available, setAvailable] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AssignSalaryComponentsInput>({
    components: [],
    effectiveFrom: new Date().toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    api.get("/salary-components")
      .then(r => setAvailable(r.data.components || []))
      .catch(() => {});
  }, []);

  const addRow = () =>
    setForm(f => ({ ...f, components: [...f.components, { salaryComponentId: "", amount: 0, effectiveTo: null }] }));

  const removeRow = (i: number) =>
    setForm(f => ({ ...f, components: f.components.filter((_, idx) => idx !== i) }));

  const updateRow = (i: number, field: string, value: any) =>
    setForm(f => {
      const comps = [...f.components];
      comps[i] = { ...comps[i], [field]: field === "amount" ? parseFloat(value) || 0 : value };
      return { ...f, components: comps };
    });

  const selectComponent = (i: number, salaryComponentId: string) => {
    const selected = available.find(c => c.id === salaryComponentId);
    const autoAmount =
      selected ? autoCalcStatutoryAmount(selected, basicSalary) : null;

    setForm(f => {
      const comps = [...f.components];
      comps[i] = {
        ...comps[i],
        salaryComponentId,
        amount: autoAmount === null ? 0 : autoAmount,
      };
      return { ...f, components: comps };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.components.length) { setError("Add at least one component."); return; }
    if (form.components.some(c => !c.salaryComponentId || c.amount < 0)) {
      setError("All components need a valid selection and non-negative amount."); return;
    }
    if (basicSalary <= 0) {
      const hasStatutoryDeduction = form.components.some((c) => {
        const selected = available.find((a) => a.id === c.salaryComponentId);
        return selected?.type === "deduction" && selected.isStatutory;
      });
      if (hasStatutoryDeduction) {
        setError("Add Basic Salary first before adding statutory deductions (PAYE, NSSF, SHIF, Housing Levy).");
        return;
      }
    }
    setLoading(true);
    try {
      await api.post(`/employees/${employeeId}/salary`, form);
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.details || "Failed to add components.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="h-[3px] rounded-t-3xl bg-primary-600" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FiPlus className="w-4 h-4 text-emerald-600" />
            </span>
            <h3 className="text-base font-bold text-slate-800">Add Salary Components</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DateInput
            label="Effective From"
            name="effectiveFrom"
            value={form.effectiveFrom}
            onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))}
            required
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Components</p>
              <button type="button" onClick={addRow}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-1.5 transition-colors">
                <FiPlus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {form.components.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                <p className="text-sm text-slate-400">No components yet. Click "Add Row" to start.</p>
              </div>
            )}

            {form.components.map((comp, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Component {i + 1}</p>
                  <button type="button" onClick={() => removeRow(i)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                    Remove
                  </button>
                </div>
                <Select
                  label="Select Component"
                  value={comp.salaryComponentId}
                  onChange={e => selectComponent(i, e.target.value)}
                  options={[
                    { value: "", label: "Choose…" },
                    ...available.filter(c => c.isActive).map(c => ({ value: c.id, label: `${c.name} (${c.type})` })),
                  ]}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Amount (KES)" name={`amt-${i}`} type="number" step="0.01" min="0"
                    value={comp.amount.toString()}
                    onChange={e => updateRow(i, "amount", e.target.value)} required />
                  <DateInput label="Effective To (opt.)" name={`to-${i}`}
                    value={comp.effectiveTo || ""}
                    onChange={e => updateRow(i, "effectiveTo", e.target.value || null)} />
                </div>
              </div>
            ))}
          </div>

          <Textarea label="Reason (Optional)" name="reason"
            value={form.reason || ""}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            rows={2} />
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> Save Components
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Tab ───────────────────────────────────────────── */
interface Props { employeeId: string; }

const EmployeeSalaryTab: React.FC<Props> = ({ employeeId }) => {
  const [salary, setSalary] = useState<EmployeeSalary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSalary = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/employees/${employeeId}/salary`);
      setSalary(r.data || null);
    } catch { setSalary(null); }
    finally { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { fetchSalary(); }, [fetchSalary]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-xs text-slate-400 tracking-wide">Loading salary data…</p>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <TbMoneybag className="w-7 h-7 text-slate-400" />
        </span>
        <div>
          <p className="font-semibold text-slate-700">No salary data found</p>
          <p className="text-sm text-slate-400 mt-1">Add components to get started.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <FiPlus className="w-4 h-4" /> Add Salary Components
        </Button>
        {showAddModal && (
          <AddComponentModal
            employeeId={employeeId}
            basicSalary={0}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchSalary}
          />
        )}
      </div>
    );
  }

  const basicSalary = (() => {
    const basicRow = salary.salaryComponents.find((c) => {
      const comp = c.salaryComponent;
      return (
        comp?.type === "earning" &&
        ((comp.code || "").toLowerCase() === "basic" ||
          (comp.name || "").toLowerCase().includes("basic"))
      );
    });
    return basicRow ? parseFloat(basicRow.amount.toString()) : 0;
  })();

  const earnings = salary.salaryComponents.filter(c => c.salaryComponent?.type === "earning");
  const deductions = salary.salaryComponents.filter(c => c.salaryComponent?.type === "deduction");

  return (
    <div className="space-y-5">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={<FiTrendingUp className="w-4 h-4 text-emerald-600" />}
          label="Total Earnings"
          value={KES(salary.totals.earnings)}
        />
        <StatCard
          icon={<FiTrendingDown className="w-4 h-4 text-red-500" />}
          label="Total Deductions"
          value={KES(salary.totals.deductions)}
        />
        <StatCard
          icon={<FiDollarSign className="w-4 h-4 text-blue-600" />}
          label="Gross Pay"
          value={KES(salary.totals.grossPay)}
        />
        <StatCard
          icon={<TbReceiptTax className="w-4 h-4 text-primary-600" />}
          label="Net Pay"
          value={KES(salary.totals.netPay)}
          accent
        />
      </div>

      {/* ── Earnings ── */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-bold text-slate-700">Earnings</p>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{earnings.length}</span>
          </div>
          <p className="text-sm font-bold font-mono text-emerald-600">{KES(salary.totals.earnings)}</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {earnings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No earnings configured.</p>
          ) : (
            earnings.map(esc => (
              <ComponentRow
                key={esc.id}
                name={esc.salaryComponent?.name || "Unknown"}
                amount={parseFloat(esc.amount.toString())}
                effectiveFrom={esc.effectiveFrom}
                effectiveTo={esc.effectiveTo}
                type="earning"
              />
            ))
          )}
        </div>
      </div>

      {/* ── Deductions ── */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <p className="text-sm font-bold text-slate-700">Deductions</p>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{deductions.length}</span>
          </div>
          <p className="text-sm font-bold font-mono text-red-500">{KES(salary.totals.deductions)}</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {deductions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No deductions configured.</p>
          ) : (
            deductions.map(esc => (
              <ComponentRow
                key={esc.id}
                name={esc.salaryComponent?.name || "Unknown"}
                amount={parseFloat(esc.amount.toString())}
                effectiveFrom={esc.effectiveFrom}
                effectiveTo={esc.effectiveTo}
                type="deduction"
              />
            ))
          )}
        </div>
      </div>

      {/* ── Add Component CTA ── */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white hover:border-primary-300 hover:bg-primary-50 py-4 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-all group"
      >
        <FiPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Add Salary Component
      </button>

      {showAddModal && (
        <AddComponentModal
          employeeId={employeeId}
            basicSalary={basicSalary}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSalary}
        />
      )}
    </div>
  );
};

export default EmployeeSalaryTab;