import React, { useState, useEffect } from "react";
import {
  FiX, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin,
  FiBriefcase, FiUsers, FiDollarSign, FiFileText, FiCreditCard,
  FiUser, FiChevronRight, FiExternalLink,
} from "react-icons/fi";
import { TbBuildingSkyscraper, TbId as TbIdIcon } from "react-icons/tb";
import BankDetailsSection from "../../components/employees/BankDetailsSection";
import DocumentManager from "../../components/employees/DocumentManager";
import api from "../../services/api";
import type { Employee } from "../../types/employee";
import { useNavigate } from "react-router-dom";

/* ─── constants ─────────────────────────────────────────── */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; ring: string }> = {
  active:     { bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500",  ring:"ring-emerald-200" },
  probation:  { bg:"bg-amber-50",    text:"text-amber-700",   dot:"bg-amber-500",    ring:"ring-amber-200"   },
  suspended:  { bg:"bg-orange-50",   text:"text-orange-700",  dot:"bg-orange-400",   ring:"ring-orange-200"  },
  terminated: { bg:"bg-rose-50",     text:"text-rose-700",    dot:"bg-rose-500",     ring:"ring-rose-200"    },
  resigned:   { bg:"bg-slate-100",   text:"text-slate-600",   dot:"bg-slate-400",    ring:"ring-slate-200"   },
};

const TABS = [
  { id:"personal",   label:"Personal Info",   icon:<FiUser className="w-4 h-4"/>       },
  { id:"employment", label:"Employment",       icon:<FiBriefcase className="w-4 h-4"/>  },
  { id:"identity",   label:"Identity",         icon:<TbIdIcon className="w-4 h-4"/>     },
  { id:"bank",       label:"Bank Details",     icon:<FiCreditCard className="w-4 h-4"/> },
  { id:"documents",  label:"Documents",        icon:<FiFileText className="w-4 h-4"/>   },
];

/* ─── sub-components ─────────────────────────────────────── */
const SectionHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
  </div>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-x-8 gap-y-4">{children}</div>
);

const Field = ({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) =>
  value ? (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  ) : null;

const ContactCard = ({
  icon, color, label, value, href,
}: {
  icon: React.ReactNode; color: string; label: string; value: string; href?: string;
}) => {
  const inner = (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${color} hover:shadow-sm transition-all group cursor-pointer`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
        style={{ background: "currentColor" }}>
        <span className="text-current">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
      <FiChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform shrink-0" />
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
};

/* ─── main component ─────────────────────────────────────── */
interface Props {
  employeeId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDeleted: () => void;
}

const EmployeeDetailDrawer: React.FC<Props> = ({ employeeId, onClose, onEdit, onDeleted }) => {
  const navigate = useNavigate();
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

  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  const fetchEmployee = async () => {
    setLoading(true);
    try { const r = await api.get(`/employees/${employeeId}`); setEmployee(r.data.employee); }
    catch {} finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;
    try { await api.delete(`/employees/${employeeId}`); handleClose(); onDeleted(); }
    catch (e: any) { alert(e.response?.data?.error || "Failed to delete"); }
  };

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api","")}/uploads/${url}`;
  };

  const fmt = (d?: string | null) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }); }
    catch { return d; }
  };

  const photoUrl = employee ? getPhotoUrl(employee.photoUrl) : null;
  const s = employee ? (STATUS_MAP[employee.status] || STATUS_MAP.resigned) : STATUS_MAP.resigned;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ed-drawer { font-family:'Plus Jakarta Sans',sans-serif; }
      `}</style>

      {/* ── Backdrop ── */}
      <div onClick={handleClose}
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* ── Drawer ── */}
      <div className={`ed-drawer fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-[0_0_80px_rgba(0,0,0,0.22)] transform transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(820px, 88vw)" }}
      >
        {/* top colour bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 shrink-0" />

        {/* ───── LOADING ───── */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-slate-100 border-t-blue-600 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading employee profile…</p>
          </div>
        )}

        {/* ───── CONTENT ───── */}
        {!loading && employee && (
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* ── Hero header ── */}
            <div className="relative px-8 pt-7 pb-6 border-b border-slate-100 shrink-0"
              style={{ background: "linear-gradient(135deg,#f8faff 0%,#f0f5ff 100%)" }}>

              {/* close button */}
              <button onClick={handleClose}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all">
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-white" />
                    : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center text-white font-bold text-3xl shadow-md ring-4 ring-white">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                  }
                  {/* status dot */}
                  <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white ${s.dot} shadow-sm`} />
                </div>

                {/* Identity block */}
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                    {employee.firstName} {employee.middleName} {employee.lastName}
                  </h2>
                  <p className="text-base text-slate-500 font-medium mb-3">{employee.jobTitle}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 ring-1 ${s.ring} ${s.bg} ${s.text}`}>
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                    {employee.department?.name && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white ring-1 ring-slate-200 text-slate-600 rounded-full px-3 py-1.5 shadow-sm">
                        <TbBuildingSkyscraper className="w-3.5 h-3.5 text-blue-500" />
                        {employee.department.name}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-500 rounded-full px-3 py-1.5">
                      {employee.employeeNumber}
                    </span>
                    <span className="text-xs font-semibold bg-white ring-1 ring-slate-200 text-slate-500 rounded-full px-3 py-1.5 capitalize shadow-sm">
                      {employee.employmentType}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0 pt-1">
                  <button onClick={() => onEdit(employee.id)}
                    className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.4)] hover:-translate-y-px transition-all">
                    <FiEdit2 className="w-4 h-4" /> Edit Profile
                  </button>
                  <button onClick={() => navigate(`/employees/${employee.id}/salary`)}
                    className="flex items-center gap-2 text-sm font-bold bg-white hover:bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 rounded-xl px-4 py-2.5 hover:-translate-y-px transition-all shadow-sm">
                    <FiDollarSign className="w-4 h-4" /> View Salary
                  </button>
                  <button onClick={handleDelete}
                    className="flex items-center gap-2 text-sm font-semibold bg-white hover:bg-rose-50 text-rose-600 ring-1 ring-rose-200 rounded-xl px-4 py-2.5 transition-all shadow-sm">
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {/* Quick contact strip */}
              {(employee.workEmail || employee.phonePrimary) && (
                <div className="flex items-center gap-3 mt-5 flex-wrap">
                  {employee.workEmail && (
                    <a href={`mailto:${employee.workEmail}`}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-white ring-1 ring-blue-200 rounded-xl px-4 py-2 hover:bg-blue-50 hover:shadow-sm transition-all">
                      <FiMail className="w-4 h-4" />{employee.workEmail}
                      <FiExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                  {employee.phonePrimary && (
                    <a href={`tel:${employee.phonePrimary}`}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white ring-1 ring-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 hover:shadow-sm transition-all">
                      <FiPhone className="w-4 h-4 text-slate-400" />{employee.phonePrimary}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 px-8 pt-4 border-b border-slate-100 overflow-x-auto shrink-0 bg-white">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-t-xl border-b-2 -mb-px whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "text-blue-700 border-blue-600 bg-blue-50/60"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                  }`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto px-8 py-7 bg-slate-50/40">

              {/* PERSONAL */}
              {activeTab === "personal" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <SectionHeading icon={<FiUser className="w-4 h-4"/>} title="Personal Details" />
                    <FieldGrid>
                      <Field label="Date of Birth"  value={fmt(employee.dateOfBirth)} />
                      <Field label="Gender"         value={employee.gender} />
                      <Field label="Marital Status" value={employee.maritalStatus} />
                      <Field label="Nationality"    value={employee.nationality} />
                      <Field label="Personal Email" value={employee.personalEmail} />
                      <Field label="Secondary Phone" value={employee.phoneSecondary} />
                    </FieldGrid>
                  </div>

                  {(employee.addressLine1 || employee.city || employee.county) && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <SectionHeading icon={<FiMapPin className="w-4 h-4"/>} title="Address" />
                      <div className="bg-slate-50 rounded-xl px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {[employee.addressLine1, employee.addressLine2].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {[employee.city, employee.county, employee.postalCode, employee.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {(employee.emergencyContactName || employee.emergencyContactPhone) && (
                    <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
                      <SectionHeading icon={<FiUsers className="w-4 h-4"/>} title="Emergency Contact" />
                      <FieldGrid>
                        <Field label="Contact Name"   value={employee.emergencyContactName} />
                        <Field label="Phone"          value={employee.emergencyContactPhone} />
                        <Field label="Relationship"   value={employee.emergencyContactRelationship} />
                      </FieldGrid>
                    </div>
                  )}
                </div>
              )}

              {/* EMPLOYMENT */}
              {activeTab === "employment" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <SectionHeading icon={<FiBriefcase className="w-4 h-4"/>} title="Employment Details" />
                    <FieldGrid>
                      <Field label="Job Title"       value={employee.jobTitle} />
                      <Field label="Job Grade"       value={employee.jobGrade} />
                      <Field label="Department"      value={employee.department?.name} />
                      <Field label="Employment Type" value={employee.employmentType?.charAt(0).toUpperCase() + employee.employmentType?.slice(1)} />
                      <Field label="Hire Date"       value={fmt(employee.hireDate)} />
                      <Field label="Probation End"   value={fmt(employee.probationEndDate)} />
                      <Field label="Contract End"    value={fmt(employee.contractEndDate)} />
                      <Field label="Status"          value={employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)} />
                    </FieldGrid>
                  </div>

                  {/* Salary summary strip */}
                  <button
                    onClick={() => navigate(`/employees/${employee.id}/salary`)}
                    className="w-full flex items-center justify-between bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <FiDollarSign className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">Salary Structure</p>
                        <p className="text-xs text-slate-400">View earnings, deductions &amp; net pay</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                      Open <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              )}

              {/* IDENTITY */}
              {activeTab === "identity" && (
                <div className="max-w-3xl">
                  {(employee.nationalId || employee.passportNumber || employee.kraPin || employee.nssfNumber || employee.nhifNumber)
                    ? <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <SectionHeading icon={<TbIdIcon className="w-4 h-4"/>} title="Identification Documents" />
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label:"National ID",   value:employee.nationalId    },
                            { label:"Passport",      value:employee.passportNumber },
                            { label:"KRA PIN",       value:employee.kraPin        },
                            { label:"NSSF Number",   value:employee.nssfNumber    },
                            { label:"NHIF Number",   value:employee.nhifNumber    },
                          ].filter(f=>f.value).map(f => (
                            <div key={f.label} className="bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
                              <p className="text-base font-bold text-slate-800 font-mono">{f.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    : <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <TbIdIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700 mb-1">No identification on file</p>
                          <p className="text-sm text-slate-400">Add national ID, KRA PIN, NSSF and NHIF numbers</p>
                        </div>
                        <button onClick={() => onEdit(employee.id)}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors">
                          <FiEdit2 className="w-4 h-4" /> Add Identification
                        </button>
                      </div>
                  }
                </div>
              )}

              {/* BANK */}
              {activeTab === "bank" && (
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Bank &amp; Payment Details</h4>
                      <p className="text-sm text-slate-400 mt-0.5">Payment methods for payroll processing</p>
                    </div>
                  </div>
                  <BankDetailsSection employeeId={employeeId} />
                </div>
              )}

              {/* DOCUMENTS */}
              {activeTab === "documents" && (
                <div className="max-w-3xl">
                  <div className="mb-5">
                    <h4 className="text-base font-bold text-slate-800">Employee Documents</h4>
                    <p className="text-sm text-slate-400 mt-0.5">Contracts, ID copies, certificates and more</p>
                  </div>
                  <DocumentManager employeeId={employeeId} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOT FOUND */}
        {!loading && !employee && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <FiUser className="w-7 h-7" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700 mb-1">Employee not found</p>
              <p className="text-sm text-slate-400">This record may have been deleted.</p>
            </div>
            <button onClick={handleClose} className="text-sm font-bold text-blue-600 hover:underline">Close panel</button>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeDetailDrawer;