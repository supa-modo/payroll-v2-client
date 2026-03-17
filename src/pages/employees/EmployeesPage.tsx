import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
   FiSearch, FiMail, FiPhone, FiDollarSign,
  FiEye, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp,
  FiMoreVertical, FiDownload, FiUserCheck, FiUserX,
  FiUsers, FiFilter, FiX, FiRefreshCw,
} from "react-icons/fi";
import { TbBuildingSkyscraper, TbUserPlus } from "react-icons/tb";
import { PiUsersThreeDuotone } from "react-icons/pi";
import api from "../../services/api";
import NotificationModal, { NotificationType } from "../../components/ui/NotificationModal";
import type { Employee } from "../../types/employee";
import type { Department } from "../../types/department";
import EmployeeDetailDrawer from "./EmployeeDetailDrawer";
import EmployeeFormDrawer from "./EmployeeFormDrawer";

/* ── font injection ── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .pjs { font-family: 'Plus Jakarta Sans', sans-serif; }
  `}</style>
);

/* ── skeleton row ── */
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-100">
    {[40, 160, 120, 140, 160, 90, 80, 80].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-200 rounded-full" style={{ width: w }} />
        {i === 1 && <div className="h-3 bg-slate-100 rounded-full mt-1.5" style={{ width: 80 }} />}
      </td>
    ))}
  </tr>
);

/* ── status config ── */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  active:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500"  },
  probation:  { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500"    },
  suspended:  { bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500"   },
  terminated: { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-500"     },
  resigned:   { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"    },
};

/* ── quick actions dropdown ── */
const QuickActionsMenu = ({
  onView,
  onEdit,
  onSalary,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onSalary: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1 overflow-hidden">
          <button onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <FiEye className="w-3.5 h-3.5" /> View Profile
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <FiEdit2 className="w-3.5 h-3.5" /> Edit Details
          </button>
          <button onClick={() => { onSalary(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
            <FiDollarSign className="w-3.5 h-3.5" /> View Salary
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
            <FiTrash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ── bulk actions bar ── */
const BulkActionsBar = ({
  count,
  onActivate,
  onSuspend,
  onExport,
  onClear,
}: {
  count: number;
  onActivate: () => void;
  onSuspend: () => void;
  onExport: () => void;
  onClear: () => void;
}) => (
  <div className="flex items-center justify-between bg-blue-600 text-white px-5 py-3 rounded-xl mb-3 animate-[slideDown_0.2s_ease]">
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold">{count} employee{count > 1 ? "s" : ""} selected</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onActivate}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
        <FiUserCheck className="w-3.5 h-3.5" /> Activate
      </button>
      <button onClick={onSuspend}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
        <FiUserX className="w-3.5 h-3.5" /> Suspend
      </button>
      <button onClick={onExport}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
        <FiDownload className="w-3.5 h-3.5" /> Export
      </button>
      <button onClick={onClear}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
        <FiX className="w-3.5 h-3.5" /> Clear
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────── */
const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEmploymentType, setFilterEmploymentType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>("firstName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Drawer states
  const [detailEmpId, setDetailEmpId] = useState<string | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showFormDrawer, setShowFormDrawer] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  const PAGE_SIZE = 30;

  useEffect(() => { fetchEmployees(); fetchDepartments(); },
    [currentPage, searchTerm, filterDepartment, filterStatus, filterEmploymentType, sortField, sortDir]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const p = new URLSearchParams({
        page: currentPage.toString(), limit: PAGE_SIZE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { departmentId: filterDepartment }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterEmploymentType && { employmentType: filterEmploymentType }),
        sortField, sortDir,
      });
      const r = await api.get(`/employees?${p}`);
      setEmployees(r.data.employees || []);
      setTotalItems(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchDepartments = async () => {
    try { const r = await api.get("/departments"); setDepartments(r.data.departments || []); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    setNotification({
      open: true,
      type: "delete",
      title: "Delete employee",
      message: "Are you sure you want to delete this employee? This cannot be undone.",
    });
    const confirmAndDelete = async () => {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
        setNotification({
          open: true,
          type: "success",
          title: "Employee deleted",
          message: "The employee was deleted successfully.",
        });
      } catch (e: any) {
        setNotification({
          open: true,
          type: "error",
          title: "Failed to delete employee",
          message: e.response?.data?.error || "Failed to delete",
        });
      }
    };
    // Override onConfirm when opening delete modal
    setNotification({
      open: true,
      type: "delete",
      title: "Delete employee",
      message: "Are you sure you want to delete this employee? This cannot be undone.",
    });
    (handleDelete as any)._confirm = confirmAndDelete;
  };

  const handleBulkAction = async (action: "activate" | "suspend") => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => api.patch(`/employees/${id}/status`, { status: action === "activate" ? "active" : "suspended" })));
      setSelectedIds(new Set());
      fetchEmployees();
    } catch (e) { console.error(e); }
  };

  const handleExport = () => {
    const selected = employees.filter(e => selectedIds.has(e.id));
    const csv = [
      ["Name","Email","Department","Status","Employment Type","Hire Date"],
      ...selected.map(e => [
        `${e.firstName} ${e.lastName}`, e.workEmail,
        e.department?.name || "", e.status, e.employmentType,
        new Date(e.hireDate).toLocaleDateString(),
      ]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "employees.csv";
    a.click();
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleAll = () => {
    if (selectedIds.size === employees.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(employees.map(e => e.id)));
  };

  const toggleOne = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const getInitials = (f: string, l: string) => `${f[0]}${l[0]}`.toUpperCase();

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api", "")}/uploads/${url}`;
  };

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field
      ? (sortDir === "asc" ? <FiChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <FiChevronDown className="w-3.5 h-3.5 text-blue-600" />)
      : <FiChevronDown className="w-3.5 h-3.5 text-slate-300" />
  );

  const hasFilters = filterDepartment || filterStatus || filterEmploymentType;
  const startIndex = totalItems > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const handleNotificationConfirm = () => {
    const current = (handleDelete as any)._confirm as (() => Promise<void>) | undefined;
    if (current) {
      current();
      (handleDelete as any)._confirm = undefined;
    } else {
      handleNotificationClose();
    }
  };

  return (
    <>
      <FontStyle />
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="pjs space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <PiUsersThreeDuotone className="w-5 h-5" />
              </div>
              Employees
            </h1>
            <p className="text-sm text-slate-500 mt-1 ml-11">
              {totalItems > 0 ? `${totalItems} total employees` : "Manage your workforce"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchEmployees}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditEmployee(null); setShowFormDrawer(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-px active:translate-y-0 transition-all"
            >
              <TbUserPlus className="w-4 h-4" /> Add Employee
            </button>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Search + filters bar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search name, email, number…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2.5 rounded-xl border transition-all ${showFilters || hasFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
            </button>

            <div className="ml-auto text-xs text-slate-400 font-medium">
              {!isLoading && totalItems > 0 && `${startIndex}–${endIndex} of ${totalItems}`}
            </div>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              <select value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-700">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-700">
                <option value="">All Statuses</option>
                {["active","probation","suspended","terminated","resigned"].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select value={filterEmploymentType} onChange={e => { setFilterEmploymentType(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-700">
                <option value="">All Employment Types</option>
                {["permanent","contract","casual","intern"].map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => { setFilterDepartment(""); setFilterStatus(""); setFilterEmploymentType(""); }}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                  <FiX className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="px-5 pt-3">
              <BulkActionsBar
                count={selectedIds.size}
                onActivate={() => handleBulkAction("activate")}
                onSuspend={() => handleBulkAction("suspend")}
                onExport={handleExport}
                onClear={() => setSelectedIds(new Set())}
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox"
                      checked={employees.length > 0 && selectedIds.size === employees.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                    />
                  </th>
                  {[
                    { label: "Employee", field: "firstName", w: "" },
                    { label: "Role",       field: "jobTitle",   w: "w-32" },
                    { label: "Department", field: "department", w: "w-36" },
                    { label: "Contact",    field: "",           w: "w-48" },
                    { label: "Status",     field: "status",     w: "w-28" },
                    { label: "Joined",     field: "hireDate",   w: "w-28" },
                    { label: "",           field: "",           w: "w-12" },
                  ].map(col => (
                    <th key={col.label || "actions"}
                      className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 ${col.w}`}
                    >
                      {col.field ? (
                        <button onClick={() => toggleSort(col.field)}
                          className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                          {col.label} <SortIcon field={col.field} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : employees.length === 0
                  ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <FiUsers className="w-7 h-7" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-semibold text-slate-700 mb-1">
                              {searchTerm || hasFilters ? "No employees match your search" : "No employees yet"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {searchTerm || hasFilters ? "Try adjusting your filters" : "Add your first employee to get started"}
                            </p>
                          </div>
                          {!searchTerm && !hasFilters && (
                            <button
                              onClick={() => { setEditEmployee(null); setShowFormDrawer(true); }}
                              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                            >
                              <TbUserPlus className="w-4 h-4" /> Add First Employee
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                  : employees.map(emp => {
                    const s = STATUS_MAP[emp.status] || STATUS_MAP.resigned;
                    const photoUrl = getPhotoUrl(emp.photoUrl);
                    const isSelected = selectedIds.has(emp.id);
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => setDetailEmpId(emp.id)}
                        className={`border-b border-slate-100 hover:bg-blue-50/40 cursor-pointer transition-colors group ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(emp.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer" />
                        </td>

                        {/* Employee */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {photoUrl
                              ? <img src={photoUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                      : <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                                  {getInitials(emp.firstName, emp.lastName)}
                                </div>
                            }
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {emp.firstName} {emp.middleName} {emp.lastName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">{emp.employeeNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-800">{emp.jobTitle || "—"}</p>
                          <p className="text-xs text-slate-400 capitalize">{emp.employmentType}</p>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5">
                          {emp.department?.name
                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                                <TbBuildingSkyscraper className="w-3 h-3" />{emp.department.name}
                              </span>
                            : <span className="text-xs text-slate-300 italic">Unassigned</span>}
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            {emp.workEmail && <span className="flex items-center gap-1.5 text-xs text-slate-500"><FiMail className="w-3 h-3 shrink-0 text-slate-400" /><span className="truncate max-w-[160px]">{emp.workEmail}</span></span>}
                            {emp.phonePrimary && <span className="flex items-center gap-1.5 text-xs text-slate-500"><FiPhone className="w-3 h-3 shrink-0 text-slate-400" />{emp.phonePrimary}</span>}
                            {!emp.workEmail && !emp.phonePrimary && <span className="text-slate-300 text-xs">—</span>}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${s.bg} ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 text-sm text-slate-500">
                          {new Date(emp.hireDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <QuickActionsMenu
                            onView={() => setDetailEmpId(emp.id)}
                            onEdit={() => { setEditEmployee(emp); setShowFormDrawer(true); }}
                            onSalary={() => navigate(`/employees/${emp.id}/salary`)}
                            onDelete={() => handleDelete(emp.id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">{startIndex}–{endIndex} of {totalItems} employees</p>
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${p === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawers */}
      {detailEmpId && (
        <EmployeeDetailDrawer
          employeeId={detailEmpId}
          onClose={() => setDetailEmpId(null)}
          onEdit={id => { const e = employees.find(x=>x.id===id); if(e){setEditEmployee(e);setShowFormDrawer(true);} setDetailEmpId(null); }}
          onDeleted={() => { setDetailEmpId(null); fetchEmployees(); }}
        />
      )}
      {showFormDrawer && (
        <EmployeeFormDrawer
          employee={editEmployee}
          onClose={() => { setShowFormDrawer(false); setEditEmployee(null); }}
          onSuccess={() => { setShowFormDrawer(false); setEditEmployee(null); fetchEmployees(); }}
        />
      )}

      {notification && (
        <NotificationModal
          isOpen={notification.open}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          confirmText={notification.type === "delete" ? "Delete" : "OK"}
          cancelText="Cancel"
          showCancel={notification.type === "delete"}
          onConfirm={handleNotificationConfirm}
          onClose={handleNotificationClose}
        />
      )}
    </>
  );
};

export default EmployeesPage;