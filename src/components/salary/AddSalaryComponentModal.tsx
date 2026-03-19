import { useState } from "react";
import { SalaryComponent } from "../../types/salary";
import { AssignSalaryComponentsInput } from "../../types/salary";
import api from "../../services/api";
import { useEffect } from "react";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import Textarea from "../ui/Textarea";

/* ─── Add Salary Component Modal ────────────────────────────────── */
interface AddSalaryComponentModalProps {
  employeeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSalaryComponentModal: React.FC<AddSalaryComponentModalProps> = ({ employeeId, onClose, onSuccess }) => {
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.components.length) { setError("Add at least one component."); return; }
    if (form.components.some(c => !c.salaryComponentId || c.amount < 0)) {
      setError("All components need a valid selection and non-negative amount."); return;
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
                  onChange={e => updateRow(i, "salaryComponentId", e.target.value)}
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

export default AddSalaryComponentModal;