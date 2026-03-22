import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { TbShield, TbBuildingBank } from "react-icons/tb";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import api from "../../services/api";

interface StatutoryRate {
  id: string;
  country: string;
  rateType: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  config: Record<string, any>;
  isActive: boolean;
}

/* ─── Rate Drawer ───────────────────────────────────────────── */
interface DrawerProps {
  rate?: StatutoryRate | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RateDrawer: React.FC<DrawerProps> = ({ rate, onClose, onSuccess }) => {
  const isEdit = !!rate;
  const toDateInput = (value?: string | null) => {
    if (!value) return "";
    try { return new Date(value).toISOString().split("T")[0]; } catch { return value; }
  };
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [configText, setConfigText] = useState(rate ? JSON.stringify(rate.config, null, 2) : "{}");
  const [form, setForm] = useState({
    rateType: (rate?.rateType ?? "").toLowerCase(),
    effectiveFrom: toDateInput(rate?.effectiveFrom),
    effectiveTo: toDateInput(rate?.effectiveTo),
    country: rate?.country ?? "Kenya",
  });
  const [rateValue, setRateValue] = useState(String(rate?.config?.rate ?? ""));
  const [minAmount, setMinAmount] = useState(String(rate?.config?.minAmount ?? ""));
  const [employeeRate, setEmployeeRate] = useState(String(rate?.config?.employeeRate ?? ""));
  const [employerRate, setEmployerRate] = useState(String(rate?.config?.employerRate ?? ""));
  const [personalRelief, setPersonalRelief] = useState(String(rate?.config?.personalRelief ?? 2400));
  const [insuranceReliefRate, setInsuranceReliefRate] = useState(String(rate?.config?.insuranceReliefRate ?? 15));
  const [insuranceReliefCap, setInsuranceReliefCap] = useState(String(rate?.config?.insuranceReliefCap ?? 5000));

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const buildConfig = () => {
    if (form.rateType === "shif") {
      return { rate: Number(rateValue || 0), minAmount: Number(minAmount || 0) };
    }
    if (form.rateType === "housing_levy") {
      return {
        employeeRate: Number(employeeRate || 0),
        employerRate: Number(employerRate || employeeRate || 0),
      };
    }
    if (form.rateType === "relief") {
      return {
        personalRelief: Number(personalRelief || 0),
        insuranceReliefRate: Number(insuranceReliefRate || 0),
        insuranceReliefCap: Number(insuranceReliefCap || 0),
      };
    }
    if (form.rateType === "nssf" && !rateTextHasJson(configText)) {
      return {
        tiers: [
          { min: 0, max: 9000, employeeRate: 6, employerRate: 6 },
          { min: 9000, max: 108000, employeeRate: 6, employerRate: 6 },
        ],
      };
    }
    try { return JSON.parse(configText); } catch { return {}; }
  };
  const rateTextHasJson = (value: string) => {
    const trimmed = value.trim();
    return trimmed.startsWith("{") && trimmed.endsWith("}");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setJsonError("");
    let parsedConfig: Record<string, any> = buildConfig();
    if (!parsedConfig || typeof parsedConfig !== "object") {
      setJsonError("Invalid configuration.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, rateType: form.rateType.toLowerCase(), config: parsedConfig };
      if (isEdit) await api.put(`/settings/statutory-rates/${rate!.id}`, payload);
      else await api.post("/settings/statutory-rates", payload);
      onSuccess(); handleClose();
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to save rate.");
    } finally { setLoading(false); }
  };

  // Preview config keys as badges
  const configKeys = (() => {
    try { return Object.keys(JSON.parse(configText)); }
    catch { return []; }
  })();

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
        onClick={handleClose} />
      <div className={`fixed top-0 right-0 h-full z-60 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(580px, 94vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="h-[3px] bg-primary-600 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <TbShield className="w-4 h-4 text-blue-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{isEdit ? "Edit Statutory Rate" : "New Statutory Rate"}</h3>
              {isEdit && <p className="text-xs text-slate-400 mt-0.5">{rate!.rateType} · {rate!.country}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#f8f9fb]">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5"><p className="text-sm text-red-700">{error}</p></div>}

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rate Identity</p>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Rate Type" value={form.rateType}
                onChange={e => setForm(f => ({ ...f, rateType: e.target.value }))}
                options={[
                  { value: "", label: "Select type…" },
                  { value: "paye", label: "PAYE" },
                  { value: "nssf", label: "NSSF" },
                  { value: "shif", label: "SHIF" },
                  { value: "housing_levy", label: "Housing Levy" },
                  { value: "relief", label: "Relief" },
                ]}
                required />
              <Input label="Country" name="country" value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DateInput label="Effective From" name="effectiveFrom" value={form.effectiveFrom}
                onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} required />
              <DateInput label="Effective To (Optional)" name="effectiveTo" value={form.effectiveTo}
                onChange={e => setForm(f => ({ ...f, effectiveTo: e.target.value }))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Structured Inputs</p>
            {form.rateType === "shif" && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Rate (%)" type="number" value={rateValue} onChange={e => setRateValue(e.target.value)} />
                <Input label="Minimum Amount" type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
              </div>
            )}
            {form.rateType === "housing_levy" && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Employee Rate (%)" type="number" value={employeeRate} onChange={e => setEmployeeRate(e.target.value)} />
                <Input label="Employer Rate (%)" type="number" value={employerRate} onChange={e => setEmployerRate(e.target.value)} />
              </div>
            )}
            {form.rateType === "relief" && (
              <div className="grid grid-cols-3 gap-4">
                <Input label="Personal Relief" type="number" value={personalRelief} onChange={e => setPersonalRelief(e.target.value)} />
                <Input label="Insurance Relief Rate (%)" type="number" value={insuranceReliefRate} onChange={e => setInsuranceReliefRate(e.target.value)} />
                <Input label="Insurance Relief Cap" type="number" value={insuranceReliefCap} onChange={e => setInsuranceReliefCap(e.target.value)} />
              </div>
            )}
            {form.rateType === "nssf" && (
              <p className="text-xs text-slate-500">NSSF uses default Kenya tier configuration unless you provide custom JSON below.</p>
            )}
            {form.rateType === "paye" && (
              <p className="text-xs text-slate-500">PAYE brackets are configured via JSON below for full flexibility.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Configuration (JSON)</p>
              {configKeys.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {configKeys.map(k => (
                    <span key={k} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5">{k}</span>
                  ))}
                </div>
              )}
            </div>
            <textarea
              value={configText}
              onChange={e => { setConfigText(e.target.value); setJsonError(""); }}
              className={`w-full px-3 py-3 border rounded-xl font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${jsonError ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              rows={12} spellCheck={false} required
            />
            {jsonError && <p className="text-xs text-red-600 font-medium">{jsonError}</p>}
            <p className="text-xs text-slate-400">Enter valid JSON. Keys should reflect rate bands, thresholds, or fixed amounts depending on the rate type.</p>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" isLoading={loading} onClick={submit}>
            <FiCheck className="w-4 h-4" /> {isEdit ? "Update" : "Create"} Rate
          </Button>
        </div>
      </div>
    </>
  );
};

/* ─── Page ──────────────────────────────────────────────────── */
const StatutoryRatesPage: React.FC = () => {
  const [rates, setRates] = useState<StatutoryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StatutoryRate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const r = await api.get("/settings/statutory-rates?includeInactive=true");
      setRates(r.data.rates || []);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to fetch rates.");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this statutory rate?")) return;
    try { await api.delete(`/settings/statutory-rates/${id}`); fetchRates(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete."); }
  };

  const fmt = (d?: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const RATE_COLORS: Record<string, string> = {
    paye: "bg-blue-50 text-blue-700 border-blue-200",
    nssf: "bg-emerald-50 text-emerald-700 border-emerald-200",
    shif: "bg-purple-50 text-purple-700 border-purple-200",
    housing_levy: "bg-amber-50 text-amber-700 border-amber-200",
    relief: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const RATE_LABELS: Record<string, string> = {
    paye: "PAYE",
    nssf: "NSSF",
    shif: "SHIF",
    housing_levy: "Housing Levy",
    relief: "Relief",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-google">Statutory Rates</h1>
          <p className="text-sm text-slate-500 mt-1 font-source">Manage PAYE, NSSF and SHIF rate configurations</p>
        </div>
        <Button onClick={() => { setEditing(null); setDrawerOpen(true); }} className="font-source">
          <FiPlus className="w-4 h-4" /> Add Rate
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Rate type summary */}
      <div className="grid grid-cols-5 gap-4">
        {["paye", "nssf", "shif", "housing_levy", "relief"].map(type => {
          const typeRates = rates.filter(r => r.rateType === type);
          const active = typeRates.find(r => r.isActive);
          return (
            <div key={type} className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold rounded-full px-2.5 py-1 border ${RATE_COLORS[type] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{RATE_LABELS[type] || type}</span>
                {active && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <p className="text-sm font-semibold text-slate-700">{typeRates.length} rate{typeRates.length !== 1 ? "s" : ""}</p>
              <p className="text-xs text-slate-400 mt-0.5">{active ? `Active from ${fmt(active.effectiveFrom)}` : "No active rate"}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Type",
              cell: (r: StatutoryRate) => (
                <span className={`inline-flex items-center text-xs font-bold rounded-full px-2.5 py-1 border ${RATE_COLORS[r.rateType] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {RATE_LABELS[r.rateType] || r.rateType}
                </span>
              ),
            },
            {
              header: "Country",
              cell: (r: StatutoryRate) => (
                <div className="flex items-center gap-1.5">
                  <TbBuildingBank className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700">{r.country}</span>
                </div>
              ),
            },
            {
              header: "Effective Period",
              cell: (r: StatutoryRate) => (
                <div>
                  <p className="text-sm font-medium text-slate-700">{fmt(r.effectiveFrom)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.effectiveTo ? `→ ${fmt(r.effectiveTo)}` : "Ongoing"}</p>
                </div>
              ),
            },
            {
              header: "Config Keys",
              cell: (r: StatutoryRate) => (
                <div className="flex flex-wrap gap-1">
                  {Object.keys(r.config).slice(0, 4).map(k => (
                    <span key={k} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">{k}</span>
                  ))}
                  {Object.keys(r.config).length > 4 && (
                    <span className="text-[10px] font-mono text-slate-400">+{Object.keys(r.config).length - 4}</span>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (r: StatutoryRate) => (
                <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 ${r.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${r.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {r.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "",
              cell: (r: StatutoryRate) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(r); setDrawerOpen(true); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={rates}
          totalItems={rates.length}
          startIndex={1} endIndex={rates.length}
          currentPage={1} totalPages={1}
          onPageChange={() => {}}
          pageSize={rates.length}
          tableLoading={loading}
          showCheckboxes={false}
        />
      </div>

      {drawerOpen && (
        <RateDrawer
          rate={editing}
          onClose={() => setDrawerOpen(false)}
          onSuccess={fetchRates}
        />
      )}
    </div>
  );
};

export default StatutoryRatesPage;