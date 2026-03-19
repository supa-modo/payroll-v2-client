import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown, FiX, FiCheck } from "react-icons/fi";
import { TbComponents } from "react-icons/tb";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import api from "../../services/api";
import type { SalaryComponent, CreateSalaryComponentInput } from "../../types/salary";

/* ─── helpers ─────────────────────────────────────────────── */
const KES = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v)
    : "—";

/* ─── Drawer ──────────────────────────────────────────────── */
interface DrawerProps {
  component?: SalaryComponent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ComponentDrawer: React.FC<DrawerProps> = ({ component, onClose, onSuccess }) => {
  const isEdit = !!component;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateSalaryComponentInput>({
    name: component?.name ?? "",
    code: component?.code ?? "",
    type: component?.type ?? "earning",
    category: component?.category ?? "",
    calculationType: component?.calculationType ?? "fixed",
    defaultAmount: component?.defaultAmount ?? null,
    percentageOf: component?.percentageOf ?? null,
    percentageValue: component?.percentageValue ?? null,
    isTaxable: component?.isTaxable ?? true,
    isStatutory: component?.isStatutory ?? false,
    statutoryType: component?.statutoryType ?? null,
    isActive: component?.isActive ?? true,
    displayOrder: component?.displayOrder ?? 0,
  });

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isEdit) await api.put(`/salary-components/${component!.id}`, form);
      else await api.post("/salary-components", form);
      onSuccess(); handleClose();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to save component.");
    } finally { setLoading(false); }
  };

  const Toggle = ({ label, field }: { label: string; field: keyof typeof form }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form[field] ? "bg-primary-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form[field] ? "translate-x-5" : "translate-x-0"}`} />
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
    </label>
  );

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-60 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(560px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <TbComponents className="w-4 h-4 text-primary-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {isEdit ? "Edit Component" : "New Salary Component"}
              </h3>
              {isEdit && <p className="text-xs text-slate-400 mt-0.5 font-mono">{component!.code}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#f8f9fb]">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Basic Info</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" name="name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Code" name="code" value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
              <Select label="Type" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                options={[{ value: "earning", label: "Earning" }, { value: "deduction", label: "Deduction" }]} required />
              <Input label="Category" name="category" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
              <Input label="Display Order" name="displayOrder" type="number" min="0"
                value={form.displayOrder?.toString() ?? "0"}
                onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Calculation</p>
            <Select label="Calculation Type" value={form.calculationType}
              onChange={e => setForm(f => ({ ...f, calculationType: e.target.value as any }))}
              options={[{ value: "fixed", label: "Fixed Amount" }, { value: "percentage", label: "Percentage" }]} required />
            {form.calculationType === "fixed" && (
              <Input label="Default Amount (KES)" name="defaultAmount" type="number" step="0.01" min="0"
                value={form.defaultAmount?.toString() ?? ""}
                onChange={e => setForm(f => ({ ...f, defaultAmount: e.target.value ? parseFloat(e.target.value) : null }))} />
            )}
            {form.calculationType === "percentage" && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Percentage Value (%)" name="percentageValue" type="number" step="0.01" min="0" max="100"
                  value={form.percentageValue?.toString() ?? ""}
                  onChange={e => setForm(f => ({ ...f, percentageValue: e.target.value ? parseFloat(e.target.value) : null }))} />
                <Input label="Percentage Of" name="percentageOf" value={form.percentageOf ?? ""}
                  onChange={e => setForm(f => ({ ...f, percentageOf: e.target.value || null }))} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Flags</p>
            <div className="space-y-3">
              <Toggle label="Taxable" field="isTaxable" />
              <Toggle label="Statutory" field="isStatutory" />
              <Toggle label="Active" field="isActive" />
            </div>
            {form.isStatutory && (
              <Input label="Statutory Type" name="statutoryType" value={form.statutoryType ?? ""}
                onChange={e => setForm(f => ({ ...f, statutoryType: e.target.value || null }))} />
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> {isEdit ? "Update" : "Create"} Component
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Page ─────────────────────────────────────────────────── */
const ComponentsPage: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryComponent | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => { fetchComponents(); }, [filterType, filterCategory]);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("category", filterCategory);
      const r = await api.get(`/salary-components?${params}`);
      setComponents(r.data.components || []);
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this salary component?")) return;
    try { await api.delete(`/salary-components/${id}`); fetchComponents(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete."); }
  };

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (c: SalaryComponent) => { setEditing(c); setDrawerOpen(true); };

  const categories = Array.from(new Set(components.map(c => c.category))).sort();
  const filtered = components.filter(c => {
    if (filterType && c.type !== filterType) return false;
    if (filterCategory && c.category !== filterCategory) return false;
    return true;
  });

  const earningsCount = filtered.filter(c => c.type === "earning").length;
  const deductionsCount = filtered.filter(c => c.type === "deduction").length;
  const activeCount = filtered.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-google">Salary Components</h1>
          <p className="text-sm text-slate-500 mt-1 font-source">Manage earnings and deduction templates</p>
        </div>
        <Button onClick={openCreate} className="font-source">
          <FiPlus className="w-4 h-4" /> Add Component
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 flex-wrap font-source">
        {[
          { label: "Total", value: filtered.length, color: "bg-slate-100 text-slate-700 border-slate-200" },
          { label: "Earnings", value: earningsCount, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Deductions", value: deductionsCount, color: "bg-red-50 text-red-600 border-red-200" },
          { label: "Active", value: activeCount, color: "bg-primary-50 text-primary-700 border-primary-200" },
        ].map(p => (
          <span key={p.label} className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1.5 ${p.color}`}>
            <span className="text-base font-bold font-mono">{p.value}</span> {p.label}
          </span>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={filterType}
            onChange={e => setFilterType(e.target.value)}
            options={[{ value: "", label: "All Types" }, { value: "earning", label: "Earnings" }, { value: "deduction", label: "Deductions" }]}
            wrapperClassName="mb-0" />
          <Select label="Category" value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            options={[{ value: "", label: "All Categories" }, ...categories.map(c => ({ value: c, label: c }))]}
            wrapperClassName="mb-0" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Component",
              cell: (c: SalaryComponent) => (
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{c.code}</p>
                </div>
              ),
            },
            {
              header: "Type",
              cell: (c: SalaryComponent) => (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${c.type === "earning" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  {c.type === "earning" ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                  {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                </span>
              ),
            },
            {
              header: "Category",
              cell: (c: SalaryComponent) => (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">{c.category}</span>
              ),
            },
            {
              header: "Calculation",
              cell: (c: SalaryComponent) => (
                <div>
                  <p className="text-sm font-medium text-slate-700 capitalize">{c.calculationType}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {c.calculationType === "fixed" && c.defaultAmount ? KES(c.defaultAmount) : ""}
                    {c.calculationType === "percentage" && c.percentageValue ? `${c.percentageValue}%` : ""}
                  </p>
                </div>
              ),
            },
            {
              header: "Flags",
              cell: (c: SalaryComponent) => (
                <div className="flex flex-wrap gap-1">
                  {c.isTaxable && <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">Taxable</span>}
                  {c.isStatutory && <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">Statutory</span>}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (c: SalaryComponent) => (
                <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 ${c.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "",
              cell: (c: SalaryComponent) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => openEdit(c)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filtered}
          totalItems={filtered.length}
          startIndex={1} endIndex={filtered.length}
          currentPage={1} totalPages={1}
          onPageChange={() => {}}
          pageSize={filtered.length}
          tableLoading={loading}
          hasSearched={!!(filterType || filterCategory)}
          showCheckboxes={false}
        />
      </div>

      {drawerOpen && (
        <ComponentDrawer
          component={editing}
          onClose={() => setDrawerOpen(false)}
          onSuccess={fetchComponents}
        />
      )}
    </div>
  );
};

export default ComponentsPage;