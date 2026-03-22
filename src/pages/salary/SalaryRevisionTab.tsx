/**
 * SalaryRevisionTab
 * Renders inside EmployeeDetailDrawer.
 * Shows: revision history timeline + a slide-in panel to create a new revision.
 * Design: fully consistent with the drawer's design language.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiX, FiTrendingUp, FiTrendingDown,
  FiArrowRight, FiTrash2, FiCheck,
} from "react-icons/fi";
import { TbClockRecord, TbReceipt } from "react-icons/tb";
import api from "../../services/api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DateInput from "@/components/ui/DateInput";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { EmployeeSalary, SalaryComponent, SalaryRevisionHistory } from "../../types/salary";
import { autoCalcStatutoryAmount } from "@/utils/statutoryCalc";

/* ─── helpers ────────────────────────────────────────────── */
const KES = (v: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);

const fmt = (d?: string | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

/* ─── Revision History Card ──────────────────────────────── */
const RevisionCard: React.FC<{ revision: SalaryRevisionHistory; isFirst: boolean }> = ({ revision, isFirst }) => {
  const pct = Number(revision.changePercentage);
  const isPositive = pct >= 0;
  const prevGross = Number(revision.previousGross) || 0;
  const newGross = Number(revision.newGross) || 0;

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${isFirst ? "border-primary-600 bg-primary-600" : "border-slate-300 bg-white"}`}>
          {isFirst
            ? <TbReceipt className="w-4 h-4 text-white" />
            : <span className="w-2 h-2 rounded-full bg-slate-300" />}
        </span>
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 rounded-2xl border px-5 py-4 ${isFirst ? "border-primary-200 bg-primary-50/30" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className={`text-sm font-bold ${isFirst ? "text-primary-700" : "text-slate-700"}`}>
              {fmt(revision.revisionDate)}
              {isFirst && <span className="ml-2 text-xs font-semibold bg-primary-100 text-primary-600 rounded-full px-2 py-0.5">Latest</span>}
            </p>
            {revision.reason && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{revision.reason}</p>
            )}
          </div>
          {revision.changePercentage != null && (
            <span className={`inline-flex items-center gap-1 text-sm font-bold rounded-full px-3 py-1 shrink-0 ${isPositive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {isPositive ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? "+" : ""}{pct.toFixed(2)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2.5">
            <p className="text-xs text-slate-400 mb-0.5">Previous Gross</p>
            <p className="text-sm font-bold font-mono text-slate-700">{KES(prevGross)}</p>
          </div>
          <FiArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          <div className={`flex-1 rounded-xl border px-3 py-2.5 ${isFirst ? "bg-primary-100 border-primary-200" : "bg-emerald-50 border-emerald-200"}`}>
            <p className={`text-xs mb-0.5 ${isFirst ? "text-primary-500" : "text-emerald-500"}`}>New Gross</p>
            <p className={`text-sm font-bold font-mono ${isFirst ? "text-primary-700" : "text-emerald-700"}`}>{KES(newGross)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Create Revision Panel (slide-in) ───────────────────── */
interface PanelProps {
  employeeId: string;
  employee: { firstName: string; lastName: string; employeeNumber: string };
  currentSalary: EmployeeSalary;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRevisionPanel: React.FC<PanelProps> = ({
  employeeId, employee, currentSalary, onClose, onSuccess,
}) => {
  const [available, setAvailable] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  type CompRow = {
    id?: string; salaryComponentId: string; amount: number;
    effectiveTo: string | null; isNew: boolean; isDeleted: boolean;
    componentName?: string; componentType?: string;
    amountSource?: "manual" | "auto";
  };

  const [components, setComponents] = useState<CompRow[]>([]);
  const [originals, setOriginals] = useState<Array<{ id: string; amount: number; effectiveTo: string | null }>>([]);
  const [prevGross, setPrevGross] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    api.get("/salary-components").then(r => setAvailable(r.data.components || [])).catch(() => {});

    // Initialize from current salary
    const comps: CompRow[] = currentSalary.salaryComponents.map(esc => ({
      id: esc.id,
      salaryComponentId: esc.salaryComponentId || "",
      amount: parseFloat(esc.amount.toString()) || 0,
      effectiveTo: esc.effectiveTo || null,
      isNew: false,
      isDeleted: false,
      componentName: esc.salaryComponent?.name || "Unknown",
      componentType: esc.salaryComponent?.type || "earning",
      amountSource: "manual",
    }));
    setComponents(comps);
    setOriginals(comps.map(c => ({ id: c.id!, amount: c.amount, effectiveTo: c.effectiveTo })));
    setPrevGross(currentSalary.totals.grossPay);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const addRow = () =>
    setComponents(cs => [
      { salaryComponentId: "", amount: 0, effectiveTo: null, isNew: true, isDeleted: false, amountSource: "manual" },
      ...cs,
    ]);

  const removeRow = (i: number) =>
    setComponents(cs => {
      const updated = [...cs];
      if (updated[i].id && !updated[i].isNew) {
        updated[i] = { ...updated[i], isDeleted: true };
      } else {
        updated.splice(i, 1);
      }
      return updated;
    });

  const updateRow = (i: number, field: string, value: any) =>
    setComponents(cs => {
      const updated = [...cs];
      if (field === "salaryComponentId") {
        const selected = available.find(a => a.id === value);
        const basicSalary = (() => {
          const basicRow = cs
            .filter(r => !r.isDeleted)
            .find(r => {
              const comp = available.find(a => a.id === r.salaryComponentId);
              const code = (comp?.code || "").toLowerCase();
              const name = (comp?.name || r.componentName || "").toLowerCase();
              return comp?.type === "earning" && (code === "basic" || name.includes("basic"));
            });
          return basicRow?.amount || 0;
        })();

        const autoAmount = selected ? autoCalcStatutoryAmount(selected, basicSalary) : null;
        updated[i] = {
          ...updated[i],
          salaryComponentId: value,
          amount: autoAmount === null ? 0 : autoAmount,
          amountSource: autoAmount === null ? "manual" : "auto",
        };
      } else if (field === "amount") {
        updated[i] = { ...updated[i], amount: parseFloat(value) || 0, amountSource: "manual" };
      } else {
        updated[i] = { ...updated[i], [field]: value || null };
      }
      return updated;
    });

  const basicSalary = (() => {
    const basicRow = components
      .filter(r => !r.isDeleted)
      .find(r => {
        const comp = available.find(a => a.id === r.salaryComponentId);
        const code = (comp?.code || "").toLowerCase();
        const name = (comp?.name || r.componentName || "").toLowerCase();
        return comp?.type === "earning" && (code === "basic" || name.includes("basic"));
      });
    return basicRow?.amount || 0;
  })();

  // If the user changes Basic salary, keep auto-calculated statutory deduction rows in sync.
  // We only update rows marked as `amountSource: "auto"` so manual overrides remain untouched.
  React.useEffect(() => {
    if (!available.length) return;
    setComponents(prev => {
      let changed = false;
      const next = prev.map(row => {
        if (row.isDeleted) return row;
        if (row.amountSource !== "auto") return row;
        const comp = available.find(a => a.id === row.salaryComponentId);
        if (!comp) return row;
        const autoAmount = autoCalcStatutoryAmount(comp, basicSalary);
        if (autoAmount === null) return row;
        if (Number(row.amount) === Number(autoAmount)) return row;
        changed = true;
        return { ...row, amount: autoAmount };
      });
      return changed ? next : prev;
    });
  }, [basicSalary, available]);

  const currentGross = components
    .filter(c => !c.isDeleted)
    .reduce((sum, c) => {
      const comp = available.find(a => a.id === c.salaryComponentId);
      const type = comp?.type || c.componentType;
      return type === "earning" ? sum + (c.amount || 0) : sum;
    }, 0);

  const changePct = prevGross > 0 ? ((currentGross - prevGross) / prevGross) * 100 : currentGross > 0 ? 100 : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!reason.trim()) { setError("Reason is required."); return; }

    const deletedIds = components.filter(c => c.isDeleted && c.id).map(c => c.id!);
    const newComps = components.filter(c => c.isNew && !c.isDeleted);
    if (basicSalary <= 0) {
      const hasStatutoryDeduction = newComps.some((c) => {
        const selected = available.find((a) => a.id === c.salaryComponentId);
        return selected?.type === "deduction" && selected.isStatutory;
      });
      if (hasStatutoryDeduction) {
        setError("Add Basic Salary first before adding statutory deductions (PAYE, NSSF, SHIF, Housing Levy).");
        return;
      }
    }
    const modComps = components.filter(c => {
      if (c.isNew || c.isDeleted || !c.id) return false;
      const orig = originals.find(o => o.id === c.id);
      if (!orig) return false;
      return Number(orig.amount) !== Number(c.amount) || (orig.effectiveTo || null) !== (c.effectiveTo || null);
    });

    if (!deletedIds.length && !newComps.length && !modComps.length) {
      setError("No changes detected. Modify at least one component."); return;
    }
    if (newComps.some(c => !c.salaryComponentId || c.amount < 0)) {
      setError("New components need a valid selection and non-negative amount."); return;
    }

    setLoading(true);
    try {
      await api.post(`/employees/${employeeId}/salary/revision`, {
        effectiveFrom, reason,
        modifiedComponents: modComps.map(c => ({ id: c.id!, amount: Number(c.amount), effectiveTo: c.effectiveTo || null })),
        newComponents: newComps.map(c => ({ salaryComponentId: c.salaryComponentId, amount: Number(c.amount), effectiveTo: c.effectiveTo || null })),
        deletedComponentIds: deletedIds,
      });
      onSuccess(); handleClose();
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.details || "Failed to create revision.");
    } finally { setLoading(false); }
  };

  const visibleComponents = components.filter(c => !c.isDeleted);

  return (
    <>
      <div className={`fixed inset-0 z-150 transition-all duration-300 ${visible ? "bg-slate-900/30 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />

      <div
        className={`fixed top-0 right-0 h-full z-160 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(640px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
      >
        <div className="h-[3px] w-full bg-primary-600 shrink-0 rounded-t" />

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <TbReceipt className="w-4 h-4 text-primary-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Create Salary Revision</h3>
              <p className="text-xs text-slate-400 mt-0.5">{employee.firstName} {employee.lastName} · {employee.employeeNumber}</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Panel content */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#f8f9fb]">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Current salary snapshot */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Current Salary</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Gross Pay</p>
                <p className="text-base font-bold font-mono text-slate-800">{KES(currentSalary.totals.grossPay)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Net Pay</p>
                <p className="text-base font-bold font-mono text-primary-600">{KES(currentSalary.totals.netPay)}</p>
              </div>
            </div>
          </div>

          {/* Revision meta */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Revision Details</p>
            <DateInput label="Effective From" name="effectiveFrom"
              value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} required />
            <Textarea label="Reason for Revision" name="reason"
              value={reason} onChange={e => setReason(e.target.value)} rows={2} required />
          </div>

          {/* Components */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Salary Components</p>
                <p className="text-xs text-slate-400 mt-0.5">Edit amounts, add new, or remove existing</p>
              </div>
              <button type="button" onClick={addRow}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-1.5 transition-colors">
                <FiPlus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {visibleComponents.map((comp, idx) => {
              const actualIdx = components.indexOf(comp);
              const srcComp = available.find(a => a.id === comp.salaryComponentId);
              const orig = originals.find(o => o.id === comp.id);
              const isModified = !comp.isNew && orig &&
                (Number(orig.amount) !== Number(comp.amount) || (orig.effectiveTo || null) !== (comp.effectiveTo || null));
              const compType = srcComp?.type || comp.componentType;

              return (
                <div key={comp.id || `new-${idx}`}
                  className={`rounded-2xl border-2 p-4 space-y-3 transition-colors ${comp.isNew ? "border-emerald-300 bg-emerald-50/40" : isModified ? "border-blue-300 bg-blue-50/40" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {!comp.isNew ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800">
                            {srcComp?.name || comp.componentName}
                          </p>
                          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${compType === "earning" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                            {compType === "earning" ? "Earning" : "Deduction"}
                          </span>
                          {isModified && <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Modified</span>}
                          {comp.isNew && <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">New</span>}
                        </div>
                      ) : (
                  <Select
                          label="Select Component"
                          value={comp.salaryComponentId || ""}
                          onChange={e => updateRow(actualIdx, "salaryComponentId", e.target.value)}
                          options={[
                            { value: "", label: "Choose a component…" },
                            ...available.filter(c => c.isActive).map(c => ({ value: c.id, label: `${c.name} (${c.type})` })),
                          ]}
                          required />
                      )}
                    </div>
                    <button type="button" onClick={() => removeRow(actualIdx)}
                      className="ml-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Amount (KES)" name={`amt-${idx}`} type="number" step="0.01" min="0"
                      value={comp.amount.toString()}
                      onChange={e => updateRow(actualIdx, "amount", e.target.value)} required />
                    <DateInput label="Effective To (opt.)" name={`to-${idx}`}
                      value={comp.effectiveTo || ""}
                      onChange={e => updateRow(actualIdx, "effectiveTo", e.target.value || null)} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview summary */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Revision Preview</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5">
                <p className="text-xs text-slate-400 mb-0.5">Previous Gross</p>
                <p className="text-sm font-bold font-mono text-slate-700">{KES(prevGross)}</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 rounded-xl bg-primary-50 border border-primary-200 px-3 py-2.5">
                <p className="text-xs text-primary-400 mb-0.5">New Gross</p>
                <p className="text-sm font-bold font-mono text-primary-700">{KES(currentGross)}</p>
              </div>
              {changePct !== null && (
                <span className={`text-sm font-bold rounded-full px-3 py-1.5 shrink-0 ${changePct >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> Create Revision
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Main Tab ───────────────────────────────────────────── */
interface Props {
  employeeId: string;
  employee: { firstName: string; lastName: string; employeeNumber: string };
}

const SalaryRevisionTab: React.FC<Props> = ({ employeeId, employee }) => {
  const [revisions, setRevisions] = useState<SalaryRevisionHistory[]>([]);
  const [salary, setSalary] = useState<EmployeeSalary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHistoryError(null);
    try {
      const [salaryRes, historyRes] = await Promise.allSettled([
        api.get(`/employees/${employeeId}/salary`),
        api.get(`/employees/${employeeId}/salary/history`),
      ]);
      if (salaryRes.status === "fulfilled") setSalary(salaryRes.value.data || null);
      if (historyRes.status === "fulfilled") {
        setRevisions(historyRes.value.data.revisions || []);
      } else {
        const responseData = (historyRes.reason as any)?.response?.data;
        const message =
          responseData?.error ||
          responseData?.details ||
          "Unable to load revision history right now.";
        setHistoryError(message);
        setRevisions([]);
      }
    } catch { }
    finally { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-xs text-slate-400 tracking-wide">Loading revisions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Revision History</h3>
          <p className="text-xs text-slate-400 mt-0.5">{revisions.length} revision{revisions.length !== 1 ? "s" : ""} on record</p>
        </div>
        {salary && (
          <Button onClick={() => setShowPanel(true)} className="font-source py-1">
            <FiPlus className="w-3.5 h-3.5" /> New Revision
          </Button>
        )}
      </div>

      {historyError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{historyError}</p>
        </div>
      )}

      {/* History list */}
      {revisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center rounded-3xl border border-dashed border-slate-300 bg-white">
          <span className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <TbClockRecord className="w-6 h-6 text-slate-400" />
          </span>
          <div>
            <p className="font-semibold text-slate-700">No revisions yet</p>
            <p className="text-sm text-slate-400 mt-1">Create the first salary revision for this employee.</p>
          </div>
          {salary && (
            <Button onClick={() => setShowPanel(true)}>
              <FiPlus className="w-4 h-4" /> Create First Revision
            </Button>
          )}
          {!salary && (
            <p className="text-xs text-slate-400 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Add salary components first before creating a revision.
            </p>
          )}
        </div>
      ) : (
        <div className="pt-2">
          {revisions.map((rev, i) => (
            <RevisionCard key={rev.id} revision={rev} isFirst={i === 0} />
          ))}
          {/* End of timeline */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center w-8">
              <span className="w-4 h-4 rounded-full border-2 border-slate-200 bg-white" />
            </div>
            <p className="text-xs text-slate-400 pb-4 pt-1">Start of records</p>
          </div>
        </div>
      )}

      {/* Slide-in panel */}
      {showPanel && salary && (
        <CreateRevisionPanel
          employeeId={employeeId}
          employee={employee}
          currentSalary={salary}
          onClose={() => setShowPanel(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default SalaryRevisionTab;