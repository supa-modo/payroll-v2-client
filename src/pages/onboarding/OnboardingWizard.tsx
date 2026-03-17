import { useState, useEffect, useCallback } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiArrowRight,
  FiDollarSign,
  FiZap,
  FiPlus,
  FiUpload,
  FiBarChart2,
} from "react-icons/fi";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import api from "../../services/api";
import { TbAlertTriangle, TbArrowBack, TbBriefcaseFilled, TbCheck, TbTrash } from "react-icons/tb";
import { PiUsersThreeDuotone } from "react-icons/pi";

/* ─── types ─────────────────────────────────────────────── */
interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  { id: "welcome", title: "Welcome", description: "Get started", icon: FiZap },
  { id: "departments", title: "Departments", description: "Org structure", icon: TbBriefcaseFilled },
  { id: "employees", title: "Employees", description: "Add your team", icon: PiUsersThreeDuotone },
  { id: "salary", title: "Salary", description: "Pay structure", icon: FiDollarSign },
  { id: "review", title: "Review", description: "Confirm setup", icon: FiBarChart2 },
  { id: "complete", title: "Complete", description: "All done", icon: FiCheck },
];

/* ─── Toggle ─────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? "bg-primary-600" : "bg-slate-200"
      }`}
  >
    <span
      className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
    />
  </button>
);

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */
const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [stepKey, setStepKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/auth/me");
        if (r.data.user?.tenant?.settings?.onboardingComplete === true) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch { }
      finally { setCheckingStatus(false); }
    })();
  }, [navigate]);

  /* ── form state ── */
  const [departments, setDepartments] = useState([
    { name: "Human Resources", code: "HR" },
    { name: "Finance", code: "FIN" },
  ]);
  const [employees, setEmployees] = useState([{
    firstName: "", lastName: "", workEmail: "",
    jobTitle: "", departmentId: "", phonePrimary: "",
    roleId: "", userPassword: "",
  }]);
  const [salaryComponents, setSalaryComponents] = useState([
    { name: "Basic Salary", type: "earning", isTaxable: true, isStatutory: false },
    { name: "PAYE", type: "deduction", isTaxable: false, isStatutory: true },
    { name: "NSSF", type: "deduction", isTaxable: false, isStatutory: true },
    { name: "NHIF", type: "deduction", isTaxable: false, isStatutory: true },
  ]);
  const [createdDepartmentIds, setCreatedDepartmentIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/roles");
        setRoles(r.data.roles || []);
      } catch {
        // ignore, role select will just be empty
      }
    })();
  }, []);

  /* ── autosave / restore ── */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("onboardingState") || "{}");
      if (s.departments) setDepartments(s.departments);
      if (s.employees) setEmployees(s.employees);
      if (s.salaryComponents) setSalaryComponents(s.salaryComponents);
    } catch { }
  }, []);
  useEffect(() => {
    localStorage.setItem("onboardingState", JSON.stringify({ departments, employees, salaryComponents }));
  }, [departments, employees, salaryComponents]);

  /* ── validation ── */
  const canContinue = useCallback(() => {
    const id = steps[currentStep].id;
    if (id === "departments") return departments.some(d => d.name.trim());
    if (id === "employees") {
      return employees.some(e =>
        e.firstName.trim() &&
        e.lastName.trim() &&
        e.workEmail.trim() &&
        e.jobTitle.trim() &&
        e.roleId &&
        e.userPassword &&
        e.userPassword.length >= 8
      );
    }
    return true;
  }, [currentStep, departments, employees]);

  /* ── keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canContinue() && !loading) handleNext();
      if (e.key === "Backspace" && e.shiftKey) handleBack();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [currentStep, canContinue, loading]);

  const advance = (n: number) => { setStepKey(k => k + 1); setCurrentStep(n); };

  /* ── handleNext ── */
  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setLoading(true);
      try { await api.post("/auth/onboarding/complete"); localStorage.removeItem("onboardingState"); }
      catch { }
      navigate("/dashboard", { replace: true });
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (steps[currentStep].id === "departments") {
        const ids: string[] = [];
        for (const d of departments) {
          if (d.name.trim()) {
            const r = await api.post("/departments", { name: d.name.trim(), code: d.code.trim() || undefined });
            ids.push(r.data.department.id);
          }
        }
        setCreatedDepartmentIds(ids);
      } else if (steps[currentStep].id === "employees") {
        // Basic client-side validation before hitting the API
        for (const e of employees) {
          if (!e.firstName.trim() || !e.lastName.trim() || !e.workEmail.trim()) {
            continue;
          }
          if (!e.jobTitle.trim()) {
            setError("Job title is required for each employee.");
            setLoading(false);
            return;
          }
          if (!e.roleId) {
            setError("Role is required for each employee user account.");
            setLoading(false);
            return;
          }
          if (!e.userPassword || e.userPassword.length < 8) {
            setError("Password must be at least 8 characters for each employee user account.");
            setLoading(false);
            return;
          }
        }

        for (const e of employees) {
          if (e.firstName.trim() && e.lastName.trim() && e.workEmail.trim()) {
            await api.post("/employees", {
              ...e,
              departmentId: e.departmentId || undefined,
              hireDate: new Date().toISOString().split("T")[0],
              employmentType: "permanent",
              roleId: e.roleId,
              userPassword: e.userPassword,
            });
          }
        }
      } else if (steps[currentStep].id === "salary") {
        for (const c of salaryComponents) {
          if (c.name.trim()) {
            const code = c.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
            await api.post("/salary-components", { name: c.name.trim(), code, type: c.type, category: c.isStatutory ? "Statutory" : "Basic", calculationType: "fixed", isTaxable: c.isTaxable, isStatutory: c.isStatutory, isActive: true });
          }
        }
      }
      advance(currentStep + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => { if (currentStep > 0) advance(currentStep - 1); };
  const handleSkip = async () => {
    if (currentStep === steps.length - 1) {
      setLoading(true);
      try { await api.post("/auth/onboarding/complete"); } catch { }
      navigate("/dashboard", { replace: true });
    } else { advance(currentStep + 1); }
  };

  /* ── helpers ── */
  const addDepartment = () => setDepartments([...departments, { name: "", code: "" }]);
  const removeDepartment = (i: number) => setDepartments(departments.filter((_, x) => x !== i));
  const updateDepartment = (i: number, f: string, v: string) => { const u = [...departments]; u[i] = { ...u[i], [f]: v }; setDepartments(u); };

  const addEmployee = () => setEmployees([
    ...employees,
    {
      firstName: "",
      lastName: "",
      workEmail: "",
      jobTitle: "",
      departmentId: "",
      phonePrimary: "",
      roleId: "",
      userPassword: "",
    },
  ]);
  const removeEmployee = (i: number) => setEmployees(employees.filter((_, x) => x !== i));
  const updateEmployee = (i: number, f: string, v: string) => { const u = [...employees]; u[i] = { ...u[i], [f]: v }; setEmployees(u); };

  const updateSalary = (i: number, f: string, v: any) => { const u = [...salaryComponents]; u[i] = { ...u[i], [f]: v }; setSalaryComponents(u); };

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  /* ══════════════════════════════════════════════
     STEP CONTENT
     ══════════════════════════════════════════════ */
  const renderStep = () => {
    switch (steps[currentStep].id) {

      /* WELCOME */
      case "welcome": return (
        <div className="pt-20 flex flex-col gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-sm font-semibold px-3 py-1.5 rounded-full border border-primary-200 mb-5">
              <FiZap size={18} /> Setup Wizard
            </div>
            <h2 className="text-5xl font-extrabold text-slate-900 leading-tight font-google mb-3">
              Let's get your<br />
              <span className="text-primary-600  font-google">payroll running & ready.</span>
            </h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-md">
              Four quick steps to configure your workspace. Most teams finish in under 2 minutes.
            </p>
          </div>

          {/* Steps preview cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <TbBriefcaseFilled size={20} />, label: "Departments", desc: "Org structure" },
              { icon: <PiUsersThreeDuotone size={24} />, label: "Employees", desc: "Team members" },
              { icon: <FiDollarSign size={20} />, label: "Salary", desc: "Pay structure" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary-300 hover:shadow-md transition-all duration-200 group">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">{item.label}</p>
                  <p className="text-sm font-source text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[0.8rem] text-gray-500 tracking-wide font-source pl-2 pt-2">
            Press{" "}
            <kbd className="bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
              Enter
            </kbd>{" "}
            to continue
          </p>
        </div>
      );

      /* DEPARTMENTS */
      case "departments": return (
        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-3">
              <TbBriefcaseFilled size={20} /> Step 2 of 6
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-google mb-1.5">Departments</h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Define your organisational units. These drive payroll reporting and cost allocation.
            </p>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex gap-2.5 items-start text-sm text-primary-700">
            <TbBriefcaseFilled size={18} className="mt-0.5 shrink-0 text-primary-500" />
            <span>Departments help you segment payroll costs and generate per-team reports automatically.</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {departments.map((dept, i) => (
              <div key={i} className="group flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 pt-3.5 pb-1 shadow-sm hover:border-primary-300 transition-all duration-200 focus-within:border-primary-400">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <Input label="Department Name" value={dept.name} onChange={e => updateDepartment(i, "name", e.target.value)} placeholder="e.g., Human Resources" />
                  <Input label="Short Code" value={dept.code} onChange={e => updateDepartment(i, "code", e.target.value)} placeholder="e.g., HR" />
                </div>
                {departments.length > 1 && (
                  <button onClick={() => removeDepartment(i)} className="mb-1 w-8 h-8 shrink-0 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors">
                    <TbTrash size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addDepartment} className="self-start flex items-center gap-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-full px-4 py-2.5 hover:bg-primary-50 hover:border-primary-400 transition-all duration-200">
            <FiPlus /> Add Another Department
          </button>
        </div>
      );

      /* EMPLOYEES */
      case "employees": return (
        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-3">
              <PiUsersThreeDuotone size={20} /> Step 3 of 6
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-google mb-1.5">Your Employees</h2>
            <p className="text-base text-slate-500 leading-relaxed">Add your first team members. You can bulk-import more from the Employees page.</p>
          </div>
          <div className="flex flex-col gap-3">
            {employees.map((emp, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl px-4 py-4 shadow-sm hover:border-primary-300 transition-all duration-200 focus-within:border-primary-500">
                <div className="grid grid-cols-3 gap-2">
                  <Input label="First Name" value={emp.firstName} onChange={e => updateEmployee(i, "firstName", e.target.value)} required className="text-sm" />
                  <Input label="Last Name" value={emp.lastName} onChange={e => updateEmployee(i, "lastName", e.target.value)} required className="text-sm" />
                  <Input label="Work Email" type="email" value={emp.workEmail} onChange={e => updateEmployee(i, "workEmail", e.target.value)} required className="text-sm" />
                  <Input label="Phone" type="tel" value={emp.phonePrimary} onChange={e => updateEmployee(i, "phonePrimary", e.target.value)} className="text-sm" />
                  <Input label="Job Title *" value={emp.jobTitle} onChange={e => updateEmployee(i, "jobTitle", e.target.value)} required className="text-sm" />
                  <Select
                    label="Department"
                    value={emp.departmentId}
                    onChange={e => updateEmployee(i, "departmentId", e.target.value)}
                    options={[
                      { value: "", label: "Select department" },
                      ...createdDepartmentIds.map((id, idx) => ({ value: id, label: departments[idx]?.name || `Department ${idx + 1}` })),
                    ]}
                    className="text-sm"
                  />
                  <Select
                    label="Role *"
                    value={emp.roleId}
                    onChange={e => updateEmployee(i, "roleId", e.target.value)}
                    options={[
                      { value: "", label: "Select role" },
                      ...roles.map(r => ({ value: r.id, label: r.name })),
                    ]}
                    required
                    className="text-sm"
                  />
                  <Input
                    label="Password *"
                    type="password"
                    value={emp.userPassword}
                    onChange={e => updateEmployee(i, "userPassword", e.target.value)}
                    required
                    placeholder="Minimum 8 characters"
                    className="text-sm"
                  />
                </div>
                {employees.length > 1 && (
                  <div className="flex justify-end mt-3">
                    <button onClick={() => removeEmployee(i)} className="flex items-center gap-1.5 text-xs font-semibold border border-red-500 hover:bg-red-100 rounded-full px-3 py-1 text-red-500 hover:text-red-600 transition-colors">
                      <TbTrash size={16} /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addEmployee} className="flex items-center gap-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-full px-4 py-2.5 hover:bg-primary-50 hover:border-primary-400 transition-all duration-200">
              <FiPlus /> Add Another Employee
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 border border-slate-200 bg-white rounded-full px-4 py-2.5 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200">
              <FiUpload /> Import from CSV
            </button>
          </div>
        </div>
      );

      /* SALARY */
      case "salary": return (
        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-3">
              <FiDollarSign /> Step 4 of 6
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-google mb-1.5">Salary Components</h2>
            <p className="text-base text-slate-500 leading-relaxed">Pre-configured with Kenyan statutory components. Adjust as needed.</p>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex gap-2.5 items-start text-sm text-primary-700">
            <FiDollarSign size={18} className="mt-0.5 shrink-0 text-primary-500" />
            <span><strong>Basic Salary</strong> — primary taxable earning · <strong>PAYE</strong> — income tax · <strong>NSSF / NHIF</strong> — statutory deductions</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_1.2fr_80px_90px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-400">
              <span>Component</span><span>Type</span><span>Taxable</span><span>Statutory</span>
            </div>
            {salaryComponents.map((c, i) => (
              <div key={i} className="grid grid-cols-[2fr_1.2fr_80px_90px] gap-4 items-center px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-primary-50/40 transition-colors">
                <Input value={c.name} onChange={e => updateSalary(i, "name", e.target.value)} placeholder="Name" className="text-sm" />
                <Select value={c.type} onChange={e => updateSalary(i, "type", e.target.value)} options={[{ value: "earning", label: "Earning" }, { value: "deduction", label: "Deduction" }]} className="text-sm" />
                <Toggle checked={c.isTaxable} onChange={v => updateSalary(i, "isTaxable", v)} />
                <Toggle checked={c.isStatutory} onChange={v => updateSalary(i, "isStatutory", v)} />
              </div>
            ))}
          </div>
        </div>
      );

      /* REVIEW */
      case "review": return (
        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 mb-3">
              <FiBarChart2 size={20} /> Step 5 of 6
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-google mb-1.5">Review setup</h2>
            <p className="text-base text-slate-500 leading-relaxed">Everything looks good below. Hit <strong className="text-slate-700">Confirm &amp; Finish</strong> to go live.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm"><TbBriefcaseFilled size={20} /></div>
                <span className="text-sm font-semibold text-slate-800">Departments</span>
                <span className="ml-auto text-xs font-bold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{departments.filter(d => d.name.trim()).length}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {departments.filter(d => d.name.trim()).map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{d.code || "—"}</span>
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm"><PiUsersThreeDuotone size={20} /></div>
                <span className="text-sm font-semibold text-slate-700">Employees</span>
                <span className="ml-auto text-xs font-bold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{employees.filter(e => e.firstName && e.workEmail).length}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {employees.filter(e => e.firstName).map((e, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">{e.firstName} {e.lastName}</span>
                    <span className="text-xs text-slate-400">{e.workEmail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm"><FiDollarSign /></div>
                <span className="text-sm font-semibold text-slate-700">Salary Components</span>
                <span className="ml-auto text-xs font-bold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{salaryComponents.filter(c => c.name.trim()).length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {salaryComponents.filter(c => c.name.trim()).map((c, i) => (
                  <span key={i} className={`text-xs font-semibold rounded-full px-3 py-1 ${c.type === "earning" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{c.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      /* COMPLETE */
      case "complete": return (
        <div className="flex flex-col items-center text-center gap-5 pt-12">
          <div className="text-5xl animate-bounce">🎉</div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-google mb-2">You're all set!</h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-lg">Your payroll system is live. Head to the dashboard to start processing payrolls.</p>
          </div>
          <div className="w-full max-w-md flex flex-col gap-2.5 text-center">
            {["Departments configured", "Employees added", "Salary components set up", "Payroll engine ready"].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-3 text-sm font-medium text-slate-700">
                <TbCheck size={20} className="text-green-600" />
                {item}
              </div>
            ))}
          </div>
          <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-left">
            <p className="text-base font-bold text-slate-400 mb-2">Recommended next steps</p>
            <ul className="list-disc list-inside space-y-1">
              {["Assign salaries to your employees", "Create your first payroll period", "Configure expense categories", "Set up user roles & permissions"].map((s, i) => (
                <li key={i} className="text-sm text-slate-500">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      );

      default: return null;
    }
  };

  /* ── loading ── */
  if (checkingStatus) return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );


  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes owSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ow-animate { animation: owSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      <div className="ow-root min-h-screen flex items-center justify-center p-6"
        style={{
          backgroundImage: "url('/background2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary-300/50" />
        {/* ── OUTER CARD ── */}
        <div className="relative z-10 w-full max-w-312 flex rounded-4xl overflow-hidden shadow-[0_20px_60px_rgba(37,99,235,0.12),0_0_0_1px_rgba(37,99,235,0.08)] bg-white max-h-[calc(100vh-3rem)]">

          {/* ══ LEFT PANEL ══ */}
          <div className="relative w-84 shrink-0 flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #1d4ed8 0%, #1e40af 40%, #1e3a8a 100%)",
            }}
          >
            {/* Subtle inner texture */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            {/* Decorative arc shape bottom-right */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border-32 border-white/10 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full border-20 border-white/6 pointer-events-none" />

            <div className="relative flex flex-col flex-1 px-6 py-8 gap-6">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/25 shadow-inner">
                  P
                </div>
                <span className="text-white font-bold text-2xl font-google">PayrollHQ System</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/15" />

              {/* Step nav */}
              <nav className="flex flex-col gap-0.5 flex-1">
                <p className="text-white/60 text-base font-bold mb-2 px-1">Setup Progress</p>
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index === currentStep;
                  const done = index < currentStep;
                  return (
                    <div key={step.id} className="relative">
                      <div className={`flex items-center gap-3.5 px-2.5 py-2 rounded-xl transition-all duration-200 ${active ? "bg-white/20 shadow-sm" : ""}`}>
                        {/* Icon */}
                        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-base transition-all duration-200 ${done ? "bg-green-600 text-white shadow-sm" :
                          active ? "bg-white text-primary-700 shadow-sm" :
                            "bg-white/10 text-white/40"
                          }`}>
                          {done ? <TbCheck size={20} /> : <Icon className="size-5" />}
                        </div>

                        {/* Label */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-base font-semibold leading-tight truncate ${done ? "text-green-400" :
                            active ? "text-white" :
                              "text-white/55"
                            }`}>
                            {step.title}
                          </span>
                          {active && (
                            <>
                              <div className="w-px h-4 bg-white/70" />
                              <span className="text-sm text-white/50 mt-0.5">{step.description}</span>
                            </>
                          )}
                        </div>

                        {/* Active indicator */}
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                        )}
                      </div>

                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div className={`ml-[25px] my-0.5 w-px h-3.5 transition-colors duration-300 ${done ? "bg-green-600/50" : "bg-white/15"}`} />
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Progress pill */}
              <div className="bg-white/10 rounded-2xl -mx-2 px-4 py-2 border border-white/15">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[0.8rem] font-semibold text-white/70">Progress</span>
                  <span className="text-[0.8rem] font-bold text-white">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-2.5">Step {currentStep + 1} of {steps.length}</p>
              </div>

              {/* Help */}
              <div className="flex items-center gap-2 text-[0.8rem] border-t border-white/15 pt-3 justify-center">
                <p className="text-white/35">Need help?</p>
                <a href="mailto:support@payroll.co" className="text-primary-200 hover:text-white transition-colors">
                  support@payroll.co
                </a>
              </div>
            </div>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="flex flex-1 flex-col bg-white min-h-[640px]">

            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-linear-to-r from-primary-600 via-primary-400 to-white" />

            <div className="flex flex-1 flex-col px-10 py-9">
              {/* Content */}
              <div key={stepKey} className="ow-animate flex-1 overflow-y-auto">
                {renderStep()}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
                  <TbAlertTriangle size={18} /> {error}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                <div>
                  {currentStep > 0 && currentStep < steps.length - 1 && (
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-500 border border-gray-300 rounded-full px-6 py-2.5 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 transition-all duration-200"
                    >
                      <TbArrowBack className="text-base" /> Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < steps.length - 1 && (
                    <button
                      onClick={handleSkip}
                      disabled={loading}
                      className="text-sm font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-colors px-2 py-2.5"
                    >
                      Skip for now
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    disabled={!canContinue() || loading}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-primary-600 border-primary-600 hover:bg-primary-700 rounded-full px-6 py-2.5 shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                    ) : currentStep === steps.length - 1 ? (
                      "Go to Dashboard"
                    ) : (
                      <><span>Continue</span><FiArrowRight className="text-[14px]" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingWizard;