import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiX, FiCheck, FiSend, FiSave, FiDollarSign } from "react-icons/fi";
import { TbReceipt, TbReceiptOff, TbClockHour4, TbCurrencyDollar, TbFileText } from "react-icons/tb";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import FileUpload from "../../components/ui/FileUpload";
import ExpenseApprovalTimeline from "../../components/expenses/ExpenseApprovalTimeline";
import ExpenseDocumentsSection from "../../components/expenses/ExpenseDocumentsSection";
import api from "../../services/api";
import type { Expense, ExpenseCategory, ExpenseApproval, ExpenseDocument, CreateExpenseInput } from "../../types/expense";

/* ─── helpers ──────────────────────────────────────────────── */
const KES = (v: number, currency = "KES") =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(v);

const fmt = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
  submitted: { label: "Submitted", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  pending_manager: { label: "Pending Manager", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  pending_finance: { label: "Pending Finance", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200" },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  paid: { label: "Paid", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-300", border: "border-slate-200" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ─── Action Confirm Panel (layered on top of detail drawer) ─ */
interface ActionPanelProps {
  type: "approve" | "reject" | "mark-paid";
  expenseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ type, expenseId, onClose, onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ comments: "", reason: "", paymentReference: "" });

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 250); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "approve") await api.post(`/expenses/${expenseId}/approve`, { comments: data.comments });
      else if (type === "reject") await api.post(`/expenses/${expenseId}/reject`, { reason: data.reason, comments: data.comments });
      else await api.post(`/expenses/${expenseId}/mark-paid`, { paymentReference: data.paymentReference });
      onSuccess(); handleClose();
    } catch (e: any) { alert(e.response?.data?.error || "Action failed."); }
    finally { setLoading(false); }
  };

  const titles = { approve: "Approve Expense", reject: "Reject Expense", "mark-paid": "Mark as Paid" };
  const icons = { approve: <FiCheck className="w-4 h-4 text-emerald-600" />, reject: <FiX className="w-4 h-4 text-red-500" />, "mark-paid": <FiDollarSign className="w-4 h-4 text-primary-600" /> };
  const accent = { approve: "bg-emerald-100", reject: "bg-red-100", "mark-paid": "bg-primary-100" };

  return (
    <>
      <div className={`fixed inset-0 z-170 transition-all duration-250 ${visible ? "bg-slate-900/20" : "bg-transparent pointer-events-none"}`} onClick={handleClose} />
      <div className={`fixed bottom-0 right-0 z-180 flex flex-col bg-white rounded-t-3xl transition-transform duration-250 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ width: "min(560px, 94vw)", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] rounded-t-3xl bg-primary-600" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent[type]}`}>{icons[type]}</span>
            <h3 className="text-sm font-bold text-slate-800">{titles[type]}</h3>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {type === "reject" && (
            <Textarea label="Rejection Reason" name="reason" value={data.reason}
              onChange={e => setData(d => ({ ...d, reason: e.target.value }))} required rows={3} />
          )}
          {type === "mark-paid" && (
            <Input label="Payment Reference (Optional)" name="paymentReference" value={data.paymentReference}
              onChange={e => setData(d => ({ ...d, paymentReference: e.target.value }))} />
          )}
          <Textarea label="Comments (Optional)" name="comments" value={data.comments}
            onChange={e => setData(d => ({ ...d, comments: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" isLoading={loading} onClick={submit}>{titles[type]}</Button>
          </div>
        </form>
      </div>
    </>
  );
};

/* ─── Expense Detail Drawer ─────────────────────────────────── */
interface DetailDrawerProps {
  expenseId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const ExpenseDetailDrawer: React.FC<DetailDrawerProps> = ({ expenseId, onClose, onUpdated }) => {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [approvals, setApprovals] = useState<ExpenseApproval[]>([]);
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "documents">("details");
  const [actionType, setActionType] = useState<"approve" | "reject" | "mark-paid" | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    fetchAll();
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [expenseId]);

  const fetchAll = async () => {
    setLoading(true);
    const [expRes, appRes, docRes] = await Promise.allSettled([
      api.get(`/expenses/${expenseId}`),
      api.get(`/expenses/${expenseId}/approvals`),
      api.get(`/expenses/${expenseId}/documents`),
    ]);
    if (expRes.status === "fulfilled") setExpense(expRes.value.data.expense);
    if (appRes.status === "fulfilled") setApprovals(appRes.value.data.approvals || []);
    if (docRes.status === "fulfilled") setDocuments(docRes.value.data.documents || []);
    setLoading(false);
  };

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const canApprove = expense && ["pending_manager", "pending_finance"].includes(expense.status);
  const canMarkPaid = expense?.status === "approved";
  const canEdit = expense?.status === "draft";

  return (
    <>
      <div className={`fixed inset-0 z-100 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-110 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(780px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading expense…</p>
          </div>
        ) : !expense ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center">
            <TbReceiptOff className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-slate-600">Expense not found</p>
            <button onClick={handleClose} className="text-sm text-primary-600 hover:underline font-semibold">Close</button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-200 shrink-0 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold font-mono text-slate-500">{expense.expenseNumber}</span>
                    <StatusBadge status={expense.status} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-google leading-tight truncate">{expense.title}</h2>
                  <p className="text-sm text-slate-500 mt-1 font-source">
                    {expense.employee ? `${expense.employee.firstName} ${expense.employee.lastName}` : "—"}
                    {expense.category && <span className="mx-1.5 text-slate-300">·</span>}
                    {expense.category?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canApprove && <>
                    <Button onClick={() => setActionType("approve")} className="font-source py-1 text-xs">
                      <FiCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <button onClick={() => setActionType("reject")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <FiX className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>}
                  {canMarkPaid && (
                    <Button onClick={() => setActionType("mark-paid")} className="font-source py-1 text-xs">
                      <FiDollarSign className="w-3.5 h-3.5" /> Mark Paid
                    </Button>
                  )}
                  <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount hero */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {KES(parseFloat(expense.amount.toString()), expense.currency || "KES")}
                  </span>
                  {expense.currency && expense.currency !== "KES" && expense.exchangeRate && (
                    <span className="text-sm text-slate-400">
                      ≈ {KES(parseFloat(expense.amount.toString()) * expense.exchangeRate)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-400">{fmt(expense.expenseDate)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-6 py-1 border-b border-slate-200 bg-white shrink-0 font-source">
              {(["details", "timeline", "documents"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 text-sm font-medium rounded-[0.7rem] px-5 py-2 border -mb-px mr-1 transition-colors duration-200 ${activeTab === tab ? "bg-gray-700 text-white border-gray-700" : "text-slate-500 border-transparent hover:text-slate-800"}`}>
                  {tab === "details" && <TbFileText className="w-4 h-4" />}
                  {tab === "timeline" && <TbClockHour4 className="w-4 h-4" />}
                  {tab === "documents" && <TbReceipt className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "timeline" && approvals.length > 0 && (
                    <span className="ml-1 text-xs bg-white/20 rounded-full px-1.5">{approvals.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-[#f8f9fb] px-6 py-5">

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Expense Details</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        { label: "Category", value: `${expense.category?.name ?? "—"} (${expense.category?.code ?? "—"})` },
                        { label: "Employee", value: expense.employee ? `${expense.employee.firstName} ${expense.employee.lastName}` : "—" },
                        { label: "Expense Date", value: fmt(expense.expenseDate) },
                        { label: "Currency", value: expense.currency || "KES" },
                        expense.exchangeRate && expense.currency !== "KES" ? { label: "Exchange Rate", value: `${expense.exchangeRate}` } : null,
                      ].filter(Boolean).map(f => (
                        <div key={f!.label}>
                          <p className="text-xs text-slate-400 mb-1">{f!.label}</p>
                          <p className="text-sm font-semibold text-slate-800">{f!.value}</p>
                        </div>
                      ))}
                    </div>
                    {expense.description && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1.5">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{expense.description}</p>
                      </div>
                    )}
                    {expense.rejectionReason && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-xs font-bold text-red-500 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-700">{expense.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Approval Timeline</p>
                  <ExpenseApprovalTimeline approvals={approvals} />
                </div>
              )}

              {activeTab === "documents" && (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5">
                  <ExpenseDocumentsSection
                    expenseId={expense.id}
                    documents={documents}
                    onDocumentsChange={fetchAll}
                    canEdit={canEdit}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {actionType && expense && (
          <ActionPanel
            type={actionType}
            expenseId={expense.id}
            onClose={() => setActionType(null)}
            onSuccess={() => { fetchAll(); onUpdated(); }}
          />
        )}
      </div>
    </>
  );
};

/* ─── Submit Expense Drawer ─────────────────────────────────── */
interface SubmitDrawerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SubmitExpenseDrawer: React.FC<SubmitDrawerProps> = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState<CreateExpenseInput>({
    categoryId: "", departmentId: "", title: "", description: "",
    amount: 0, currency: "KES", exchangeRate: 1,
    expenseDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    api.get("/expense-categories?isActive=true").then(r => setCategories(r.data.categories || [])).catch(() => {});
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const submit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const expRes = await api.post("/expenses", form);
      const expense = expRes.data.expense;
      if (receiptFile && expense.id) {
        const fd = new FormData();
        fd.append("file", receiptFile);
        fd.append("documentType", "receipt");
        await api.post(`/expenses/${expense.id}/documents`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      if (!saveAsDraft) await api.post(`/expenses/${expense.id}/submit`);
      onSuccess(); handleClose();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to create expense.");
    } finally { setLoading(false); }
  };

  const selectedCat = categories.find(c => c.id === form.categoryId);

  return (
    <>
      <div className={`fixed inset-0 z-100 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-110 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(640px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <TbReceipt className="w-4 h-4 text-primary-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Submit Expense</h3>
              <p className="text-xs text-slate-400 mt-0.5">Create a new expense claim</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={e => submit(e, false)} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#f8f9fb]">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5"><p className="text-sm text-red-700">{error}</p></div>}

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Claim Info</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Select label="Category" value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  options={[{ value: "", label: "Select category…" }, ...categories.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))]}
                  required />
              </div>
              <div className="col-span-2">
                <Input label="Title" name="title" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  placeholder="Brief description of the expense" />
              </div>
              <DateInput label="Expense Date" name="expenseDate" value={form.expenseDate}
                onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} required />
              <div>
                <Input label="Amount" name="amount" type="number" step="0.01" min="0"
                  value={form.amount?.toString() ?? ""}
                  onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} required />
                {selectedCat?.maxAmount && (
                  <p className="text-xs text-slate-400 mt-1">Max: {KES(selectedCat.maxAmount)}</p>
                )}
              </div>
              <Select label="Currency" value={form.currency || "KES"}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                options={[{ value: "KES", label: "KES" }, { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }]} />
              {form.currency !== "KES" && (
                <Input label="Exchange Rate" name="exchangeRate" type="number" step="0.0001" min="0"
                  value={form.exchangeRate?.toString() ?? "1"}
                  onChange={e => setForm(f => ({ ...f, exchangeRate: parseFloat(e.target.value) || 1 }))} required />
              )}
              {form.currency !== "KES" && form.exchangeRate && form.amount ? (
                <div className="col-span-2 rounded-xl bg-primary-50 border border-primary-200 px-4 py-2.5 flex items-center gap-2">
                  <TbCurrencyDollar className="w-4 h-4 text-primary-500" />
                  <p className="text-sm font-semibold text-primary-700">
                    Amount in KES: <span className="font-mono">{KES(form.amount * form.exchangeRate)}</span>
                  </p>
                </div>
              ) : null}
            </div>
            <Textarea label="Description" name="description" value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              placeholder="Provide additional details…" />
          </div>

          {selectedCat?.requiresReceipt && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receipt</p>
              <FileUpload label="Attach Receipt" accept="image/*,.pdf" multiple={false}
                onChange={f => {
                  if (f === null) setReceiptFile(null);
                  else if (!Array.isArray(f)) setReceiptFile(f);
                  else if (f.length > 0) setReceiptFile(f[0]);
                }} />
              <p className="text-xs text-slate-400">Receipt required for this category.</p>
            </div>
          )}

          {selectedCat && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 space-y-2">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Category Requirements</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCat.requiresManagerApproval && <span className="text-xs font-semibold bg-white border border-amber-200 text-amber-700 rounded-full px-2.5 py-1">Manager Approval</span>}
                {selectedCat.requiresFinanceApproval && <span className="text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 rounded-full px-2.5 py-1">Finance Approval</span>}
                {selectedCat.autoApproveBelow && <span className="text-xs font-semibold bg-white border border-purple-200 text-purple-700 rounded-full px-2.5 py-1">Auto-approved &lt; {KES(selectedCat.autoApproveBelow)}</span>}
              </div>
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="secondary" isLoading={loading} onClick={e => submit(e, true)}>
            <FiSave className="w-4 h-4" /> Save Draft
          </Button>
          <Button variant="primary" isLoading={loading} onClick={e => submit(e, false)}>
            <FiSend className="w-4 h-4" /> Submit for Approval
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Expenses Page ─────────────────────────────────────────── */
const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [filters, setFilters] = useState({ status: "", categoryId: "", startDate: "", endDate: "" });
  const pageSize = 30;

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      const r = await api.get(`/expenses?${params}`);
      setExpenses(r.data.expenses || []);
      setTotalItems(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch { } finally { setLoading(false); }
  }, [currentPage, filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => {
    api.get("/expense-categories?isActive=true").then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await api.delete(`/expenses/${id}`); fetchExpenses(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-google">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1 font-source">Track and manage expense claims</p>
        </div>
        <Button onClick={() => setShowSubmit(true)} className="font-source">
          <FiPlus className="w-4 h-4" /> Submit Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select label="Status" value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            options={[
              { value: "", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Submitted" },
              { value: "pending_manager", label: "Pending Manager" },
              { value: "pending_finance", label: "Pending Finance" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
            ]} />
          <Select label="Category" value={filters.categoryId}
            onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}
            options={[{ value: "", label: "All Categories" }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <DateInput label="From" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          <DateInput label="To" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Expense",
              cell: (e: Expense) => (
                <div>
                  <p className="font-semibold text-slate-800 truncate max-w-[180px]" title={e.title}>{e.title}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{e.expenseNumber}</p>
                </div>
              ),
            },
            {
              header: "Employee",
              cell: (e: Expense) => (
                <p className="text-sm text-slate-700">{e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : "—"}</p>
              ),
            },
            {
              header: "Category",
              cell: (e: Expense) => e.category ? (
                <div>
                  <p className="text-sm font-medium text-slate-700">{e.category.name}</p>
                  <p className="text-xs font-mono text-slate-400">{e.category.code}</p>
                </div>
              ) : <span className="text-slate-300">—</span>,
            },
            {
              header: "Amount",
              cell: (e: Expense) => (
                <p className="text-sm font-bold font-mono text-slate-800">
                  {KES(parseFloat(e.amount.toString()), e.currency || "KES")}
                </p>
              ),
            },
            {
              header: "Date",
              cell: (e: Expense) => <p className="text-sm text-slate-600">{fmt(e.expenseDate)}</p>,
            },
            {
              header: "Status",
              cell: (e: Expense) => <StatusBadge status={e.status} />,
            },
            {
              header: "",
              cell: (e: Expense) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => setViewId(e.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <FiEye className="w-3.5 h-3.5" />
                  </button>
                  {e.status === "draft" && <>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(e.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </>}
                </div>
              ),
            },
          ]}
          rows={expenses}
          totalItems={totalItems}
          startIndex={(currentPage - 1) * pageSize + 1}
          endIndex={Math.min(currentPage * pageSize, totalItems)}
          currentPage={currentPage} totalPages={totalPages}
          onPageChange={setCurrentPage} pageSize={pageSize}
          tableLoading={loading}
          hasSearched={!!(filters.status || filters.categoryId || filters.startDate || filters.endDate)}
          showCheckboxes={false}
        />
      </div>

      {viewId && (
        <ExpenseDetailDrawer
          expenseId={viewId}
          onClose={() => setViewId(null)}
          onUpdated={fetchExpenses}
        />
      )}
      {showSubmit && (
        <SubmitExpenseDrawer
          onClose={() => setShowSubmit(false)}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
};

export default ExpensesPage;