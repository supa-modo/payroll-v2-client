import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { TbCategory } from "react-icons/tb";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import api from "../../services/api";
import type { ExpenseCategory, CreateExpenseCategoryInput } from "../../types/expense";

/* ─── helpers ──────────────────────────────────────────────── */
const KES = (v?: number | null) =>
  v != null ? new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v) : null;

/* ─── Drawer ───────────────────────────────────────────────── */
interface DrawerProps {
  category?: ExpenseCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryDrawer: React.FC<DrawerProps> = ({ category, onClose, onSuccess }) => {
  const isEdit = !!category;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateExpenseCategoryInput>({
    name: category?.name ?? "",
    code: category?.code ?? "",
    description: category?.description ?? "",
    monthlyBudget: category?.monthlyBudget ?? null,
    requiresReceipt: category?.requiresReceipt ?? true,
    maxAmount: category?.maxAmount ?? null,
    requiresManagerApproval: category?.requiresManagerApproval ?? true,
    requiresFinanceApproval: category?.requiresFinanceApproval ?? true,
    autoApproveBelow: category?.autoApproveBelow ?? null,
    glAccountCode: category?.glAccountCode ?? "",
    isActive: category?.isActive ?? true,
    displayOrder: category?.displayOrder ?? 0,
  });

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isEdit) await api.put(`/expense-categories/${category!.id}`, form);
      else await api.post("/expense-categories", form);
      onSuccess(); handleClose();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to save category.");
    } finally { setLoading(false); }
  };

  const Toggle = ({ label, field, hint }: { label: string; field: keyof typeof form; hint?: string }) => (
    <div className="flex items-start gap-3">
      <div onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        className={`relative mt-0.5 w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${form[field] ? "bg-primary-600" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form[field] ? "translate-x-5" : ""}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-60 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(580px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <TbCategory className="w-4 h-4 text-amber-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{isEdit ? "Edit Category" : "New Expense Category"}</h3>
              {isEdit && <p className="text-xs text-slate-400 font-mono mt-0.5">{category!.code}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#f8f9fb]">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5"><p className="text-sm text-red-700">{error}</p></div>}

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Identity</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Code" name="code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
              <Input label="GL Account Code" name="glAccountCode" value={form.glAccountCode ?? ""} onChange={e => setForm(f => ({ ...f, glAccountCode: e.target.value }))} />
              <Input label="Display Order" name="displayOrder" type="number" min="0" value={form.displayOrder?.toString() ?? "0"} onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))} />
            </div>
            <Textarea label="Description" name="description" value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Budget & Limits</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monthly Budget (KES)" name="monthlyBudget" type="number" step="0.01" min="0" value={form.monthlyBudget?.toString() ?? ""} onChange={e => setForm(f => ({ ...f, monthlyBudget: e.target.value ? parseFloat(e.target.value) : null }))} />
              <Input label="Max Amount per Claim (KES)" name="maxAmount" type="number" step="0.01" min="0" value={form.maxAmount?.toString() ?? ""} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value ? parseFloat(e.target.value) : null }))} />
              <Input label="Auto-approve Below (KES)" name="autoApproveBelow" type="number" step="0.01" min="0" value={form.autoApproveBelow?.toString() ?? ""} onChange={e => setForm(f => ({ ...f, autoApproveBelow: e.target.value ? parseFloat(e.target.value) : null }))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Approval & Requirements</p>
            <div className="space-y-4">
              <Toggle label="Requires Receipt" field="requiresReceipt" hint="Claimants must attach a receipt" />
              <Toggle label="Requires Manager Approval" field="requiresManagerApproval" hint="Escalates to line manager" />
              <Toggle label="Requires Finance Approval" field="requiresFinanceApproval" hint="Finance team must sign off" />
              <Toggle label="Active" field="isActive" hint="Visible to employees when submitting claims" />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> {isEdit ? "Update" : "Create"} Category
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Page ──────────────────────────────────────────────────── */
const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [filterActive, setFilterActive] = useState("");

  useEffect(() => { fetchCategories(); }, [filterActive]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterActive) params.append("isActive", filterActive);
      const r = await api.get(`/expense-categories?${params}`);
      setCategories(r.data.categories || []);
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense category?")) return;
    try { await api.delete(`/expense-categories/${id}`); fetchCategories(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete."); }
  };

  const filtered = categories.filter(c => filterActive ? c.isActive.toString() === filterActive : true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-google">Expense Categories</h1>
          <p className="text-sm text-slate-500 mt-1 font-source">Define categories, budgets and approval flows</p>
        </div>
        <Button onClick={() => { setEditing(null); setDrawerOpen(true); }} className="font-source">
          <FiPlus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Filter row */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-600 shrink-0">Show:</p>
          {[["", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilterActive(val)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${filterActive === val ? "bg-slate-700 text-white border-slate-700" : "text-slate-500 border-slate-200 hover:border-slate-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Category",
              cell: (c: ExpenseCategory) => (
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{c.code}</p>
                </div>
              ),
            },
            {
              header: "Budget",
              cell: (c: ExpenseCategory) => (
                <div>
                  <p className="text-sm font-semibold text-slate-700 font-mono">{KES(c.monthlyBudget) ?? <span className="text-slate-300">—</span>}</p>
                  {c.maxAmount && <p className="text-xs text-slate-400 mt-0.5">Max: {KES(c.maxAmount)}</p>}
                </div>
              ),
            },
            {
              header: "Requirements",
              cell: (c: ExpenseCategory) => (
                <div className="flex flex-wrap gap-1">
                  {c.requiresReceipt && <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">Receipt</span>}
                  {c.requiresManagerApproval && <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">Manager</span>}
                  {c.requiresFinanceApproval && <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-1.5 py-0.5">Finance</span>}
                  {c.autoApproveBelow && <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-1.5 py-0.5">Auto &lt;{KES(c.autoApproveBelow)}</span>}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (c: ExpenseCategory) => (
                <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 ${c.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "",
              cell: (c: ExpenseCategory) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(c); setDrawerOpen(true); }}
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
          onPageChange={() => {}} pageSize={filtered.length}
          tableLoading={loading}
          hasSearched={!!filterActive}
          showCheckboxes={false}
        />
      </div>

      {drawerOpen && (
        <CategoryDrawer
          category={editing}
          onClose={() => setDrawerOpen(false)}
          onSuccess={fetchCategories}
        />
      )}
    </div>
  );
};

export default CategoriesPage;