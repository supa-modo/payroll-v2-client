import React, { useState, useEffect } from "react";
import {
  FiX, FiTrash2,
  FiFileText,
} from "react-icons/fi";
import { TbBriefcase, TbBuildingSkyscraper, TbEdit, TbExternalLink, TbMailFilled, TbMoneybag, TbPhoneCall, TbReceiptTax } from "react-icons/tb";
import BankDetailsSection from "../../components/employees/BankDetailsSection";
import DocumentManager from "../../components/employees/DocumentManager";
import EmployeeSalaryTab from "../salary/EmployeeSalaryTab";
import SalaryRevisionTab from "../salary/SalaryRevisionTab";
import api from "../../services/api";
import type { Employee } from "../../types/employee";
import Button from "@/components/ui/Button";
import { PiMapPinAreaDuotone, PiUserDuotone } from "react-icons/pi";

/* ─── constants ─────────────────────────────────────────── */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  probation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  suspended: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200" },
  terminated: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  resigned: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
};

const TABS = [
  { id: "personal",   label: "Personal",   icon: PiUserDuotone },
  { id: "employment", label: "Employment", icon: TbBriefcase },
  { id: "salary",     label: "Salary Components",     icon: TbMoneybag },
  { id: "revisions",  label: "Salary Revisions",  icon: TbReceiptTax },
  { id: "documents",  label: "Documents",  icon: FiFileText },
];

/* ─── helpers ────────────────────────────────────────────── */
const Field = ({ label, value, mono = false, span = false }: {
  label: string; value?: string | null; mono?: boolean; span?: boolean;
}) =>
  value ? (
    <div className={span ? "col-span-2" : ""}>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-base text-slate-800 font-semibold ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
    </div>
  ) : null;

const Section = ({ title, children, accent = false }: {
  title: string; children: React.ReactNode; accent?: boolean;
}) => (
  <div className={`rounded-3xl border px-7 py-5 ${accent ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"}`}>
    <p className="text-base font-bold text-tertiary-600 mb-4">{title}</p>
    {children}
  </div>
);

/* ─── main component ─────────────────────────────────────── */
interface Props {
  employeeId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDeleted: () => void;
}

const EmployeeDetailDrawer: React.FC<Props> = ({ employeeId, onClose, onEdit, onDeleted }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    fetchEmployee();
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [employeeId]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const fetchEmployee = async () => {
    setLoading(true);
    try { const r = await api.get(`/employees/${employeeId}`); setEmployee(r.data.employee); }
    catch { } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;
    try { await api.delete(`/employees/${employeeId}`); handleClose(); onDeleted(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete"); }
  };

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api", "")}/uploads/${url}`;
  };

  const fmt = (d?: string | null) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const photoUrl = employee ? getPhotoUrl(employee.photoUrl) : null;
  const s = employee ? (STATUS_MAP[employee.status] || STATUS_MAP.resigned) : STATUS_MAP.resigned;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? "bg-slate-900/40 backdrop-blur-[2px]" : "bg-transparent pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-100 flex flex-col bg-white transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "min(980px, 92vw)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12), -1px 0 0 rgba(0,0,0,0.06)",
        }}
      >
        {/* Accent bar */}
        <div className="h-[3px] w-full rounded-full bg-primary-600 shrink-0" />

        {/* ── Loading ── */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-xs text-slate-400 font-source tracking-wide">Loading profile …</p>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && employee && (
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* ── Header ── */}
            <div className="px-7 pt-6 pb-5 border-b border-slate-200 shrink-0 bg-white">
              <div className="flex items-start gap-5">

                {/* Avatar */}
                <div className="relative shrink-0">
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="w-36 h-36 rounded-3xl object-cover ring-1 ring-slate-200" />
                    : <div className="w-36 h-36 rounded-3xl bg-primary-600 flex items-center justify-center text-white font-semibold text-3xl tracking-tight">
                      <PiUserDuotone className="w-20 h-20" />
                    </div>
                  }
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${s.dot}`} />
                </div>

                <div className="flex w-full flex-col gap-2">
                  <div className="pt-1.5 flex items-start justify-between w-full gap-5">

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h2 className="text-lg font-google font-bold text-slate-900 leading-tight tracking-tight">
                        {employee.firstName} {employee.middleName} {employee.lastName}
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5 mb-3 font-source">{employee.jobTitle}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button onClick={() => onEdit(employee.id)} className="font-source py-1">
                        <TbEdit className="w-3.5 h-3.5" /> Update Details
                      </Button>
                      <button
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center w-9 h-9 text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleClose}
                        className="inline-flex items-center justify-center w-9 h-9 text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="font-source flex flex-wrap items-center gap-1.5">
                    {employee.department?.name && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                        <TbBuildingSkyscraper className="w-3.5 h-3.5 text-slate-600" />
                        {employee.department.name}
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                      {employee.employeeNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 capitalize">
                      {employee.employmentType}
                    </span>
                  </div>

                  {/* Contact strip */}
                  {(employee.workEmail || employee.phonePrimary) && (
                    <div className="flex items-center gap-4 pt-3 pl-2 border-t border-slate-100">
                      {employee.workEmail && (
                        <a href={`mailto:${employee.workEmail}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-2 text-slate-600 hover:text-primary-700 transition-colors">
                          <TbMailFilled className="w-4 h-4 text-slate-400" />
                          {employee.workEmail}
                          <TbExternalLink className="w-4 h-4 text-primary-600" />
                        </a>
                      )}
                      {employee.workEmail && employee.phonePrimary && (
                        <span className="w-px h-4 bg-slate-400" />
                      )}
                      {employee.phonePrimary && (
                        <a href={`tel:${employee.phonePrimary}`}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-primary-700 transition-colors">
                          <TbPhoneCall className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400 text-[0.83rem] font-normal">Phone:</span>
                          {employee.phonePrimary}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="font-source flex items-center px-7 py-1 border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium rounded-[0.7rem] px-6 py-2 border -mb-px mr-1 whitespace-nowrap transition-colors duration-300 ${active
                      ? "bg-gray-700 text-white border-gray-700"
                      : "text-slate-500 border-transparent hover:text-slate-800"
                      }`}
                  >
                    <Icon className={`w-[1.1rem] h-[1.1rem] ${active ? "text-white" : "text-slate-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto bg-[#f8f9fb] px-7 py-6">

              {/* PERSONAL */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <Section title="Personal Details">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3 pl-3">
                      <Field label="Date of Birth" value={fmt(employee.dateOfBirth)} />
                      <Field label="Gender" value={employee.gender} />
                      <Field label="Marital Status" value={employee.maritalStatus} />
                      <Field label="Nationality" value={employee.nationality} />
                      <Field label="Personal Email" value={employee.personalEmail} />
                      <Field label="Secondary Phone" value={employee.phoneSecondary} />
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <div className="grid grid-cols-3 gap-3 pl-3">
                        {[
                          { label: "National ID", value: employee.nationalId },
                          { label: "Passport", value: employee.passportNumber },
                          { label: "KRA PIN", value: employee.kraPin },
                          { label: "NSSF Number", value: employee.nssfNumber },
                          { label: "NHIF Number", value: employee.nhifNumber },
                        ].filter(f => f.value).map(f => (
                          <div key={f.label}>
                            <p className="text-sm text-slate-400 mb-1">{f.label}</p>
                            <p className="text-base font-bold text-slate-800 font-mono tracking-wide">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-4 pl-3">
                      {(employee.addressLine1 || employee.city) && (
                        <div className="flex items-start gap-3">
                          <PiMapPinAreaDuotone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-800 font-medium">
                              {[employee.addressLine1, employee.addressLine2].filter(Boolean).join(", ")}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {[employee.city, employee.county, employee.postalCode, employee.country].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>

                  {(employee.emergencyContactName || employee.emergencyContactPhone) && (
                    <Section title="Emergency Contact" accent>
                      <div className="grid grid-cols-3 gap-x-6 gap-y-3 pl-3">
                        <Field label="Contact Name" value={employee.emergencyContactName} />
                        <Field label="Phone" value={employee.emergencyContactPhone} />
                        <Field label="Relationship" value={employee.emergencyContactRelationship} />
                      </div>
                    </Section>
                  )}
                </div>
              )}

              {/* EMPLOYMENT */}
              {activeTab === "employment" && (
                <div className="space-y-4">
                  <Section title="Employment Details">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3 pl-3">
                      <Field label="Job Title" value={employee.jobTitle} />
                      <Field label="Department" value={employee.department?.name} />
                      <Field label="Job Grade" value={employee.jobGrade} />
                      <Field label="Employment Type" value={employee.employmentType?.charAt(0).toUpperCase() + employee.employmentType?.slice(1)} />
                      <Field label="Hire Date" value={fmt(employee.hireDate)} />
                      <Field label="Probation End" value={fmt(employee.probationEndDate)} />
                      <Field label="Contract End" value={fmt(employee.contractEndDate)} />
                      <Field label="Status" value={employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)} />
                    </div>
                  </Section>

                  <Section title="Bank & Payment Details">
                    <BankDetailsSection employeeId={employeeId} />
                  </Section>
                </div>
              )}

              {/* SALARY */}
              {activeTab === "salary" && (
                <EmployeeSalaryTab employeeId={employeeId} />
              )}

              {/* REVISIONS */}
              {activeTab === "revisions" && (
                <SalaryRevisionTab
                  employeeId={employeeId}
                  employee={{
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    employeeNumber: employee.employeeNumber,
                  }}
                />
              )}

              {/* DOCUMENTS */}
              {activeTab === "documents" && (
                <div>
                  <Section title="Employee Documents">
                    <DocumentManager employeeId={employeeId} />
                  </Section>
                </div>
              )}

            </div>
          </div>
        )}

        {/* NOT FOUND */}
        {!loading && !employee && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <PiUserDuotone className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Employee not found!</p>
              <p className="text-[0.9rem] text-slate-400 mt-1">This record may have been deleted.</p>
            </div>
            <button onClick={handleClose} className="text-sm font-semibold text-primary-600 hover:underline">
              Close panel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeDetailDrawer;