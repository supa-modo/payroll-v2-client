import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiDollarSign, FiTrash2,
  FiMoreVertical, FiDownload, FiUserCheck, FiUserX,
  FiX, FiRefreshCw,
  FiClock,
} from "react-icons/fi";
import { PiUserDuotone, PiUserPlusDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import api from "../../services/api";
import NotificationModal, { NotificationType } from "../../components/ui/NotificationModal";
import type { Employee } from "../../types/employee";
import type { Department } from "../../types/department";
import EmployeeDetailDrawer from "./EmployeeDetailDrawer";
import EmployeeFormDrawer from "./EmployeeFormDrawer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import { TbBuildingSkyscraper, TbEdit, TbMoneybag } from "react-icons/tb";
import StatCard from "@/components/ui/StatCard";

/* ── status config ── */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  probation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  suspended: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  terminated: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  resigned: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const MENU_WIDTH = 192; // w-48
    const MARGIN = 8;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.getBoundingClientRect().height ?? 220;

    const spaceBelow = window.innerHeight - rect.bottom;
    const placeBelow = spaceBelow >= menuHeight + MARGIN;

    const top = placeBelow ? rect.bottom + MARGIN : rect.top - menuHeight - MARGIN;

    let left = rect.right - MENU_WIDTH;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - MENU_WIDTH - MARGIN));

    setPosition({ top, left });
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 9999,
            }}
            className="min-w-48 bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <PiUserDuotone className="w-5 h-5" /> View Profile
            </button>
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <TbEdit className="w-5 h-5" /> Edit Details
            </button>
            <button
              onClick={() => {
                onSalary();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <TbMoneybag className="w-5 h-5" /> View Salary
            </button>
            <div className="h-px bg-slate-200/80 " />
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>,
          document.body
        )
      }
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
  const [sortField] = useState<string>("firstName");
  const [sortDir] = useState<"asc" | "desc">("asc");

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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setNotification({
      open: true,
      type: "delete",
      title: "Delete employee",
      message: "Are you sure you want to delete this employee? This cannot be undone.",
    });
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
      ["Name", "Email", "Department", "Status", "Employment Type", "Hire Date"],
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

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employees.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const getInitials = (f: string, l: string) => `${f[0]}${l[0]}`.toUpperCase();

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api", "")}/uploads/${url}`;
  };

  const startIndex = totalItems > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const handleNotificationConfirm = async () => {
    if (notification?.type === "delete" && pendingDeleteId) {
      try {
        await api.delete(`/employees/${pendingDeleteId}`);
        await fetchEmployees();
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
      } finally {
        setPendingDeleteId(null);
      }
    } else {
      handleNotificationClose();
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <PiUsersThreeDuotone className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-extrabold font-source text-gray-900">Employees</h1>
                <div className="bg-gray-300 w-px h-6" />
                <p className="text-sm font-source text-gray-600">
                  {totalItems > 0 ? `${totalItems} total employees` : "Manage your company's workforce"}
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchEmployees}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <Button
              rounded="xl"
              size="sm"
              className="py-2 px-6"
              onClick={() => { setEditEmployee(null); setShowFormDrawer(true); }}
              leftIcon={<PiUserPlusDuotone className="w-5 h-5" />}
            >
              Add New Employee
            </Button>

          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={PiUsersThreeDuotone} label="Total Employees" value={totalItems} sub="All records" />
          <StatCard icon={TbBuildingSkyscraper} label="Departments" value={departments.length} sub="Active structure" />
          <StatCard icon={TbMoneybag} label="On Probation" value={employees.filter(e => e.status === "probation").length} sub="Needs close follow-up" />
          <StatCard icon={FiClock} label="Suspended/Terminated" value={employees.filter(e => e.status === "suspended" || e.status === "terminated").length} sub="Pending HR action" />
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Search + filters bar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-4">


              <div className="relative flex-1 min-w-sm lg:min-w-lg">
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<FiSearch className="w-5 h-5" />}
                  wrapperClassName="mb-0"
                  className="text-sm"
                />
              </div>

              <Select
                // label="Department"
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "", label: "All Departments" },
                  ...departments.map((dept) => ({
                    value: dept.id,
                    label: dept.name,
                  })),
                ]}
                wrapperClassName="mb-0 min-w-[12rem]"
                className="text-sm"
              />
              <Select
                // label="Status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "probation", label: "Probation" },
                  { value: "suspended", label: "Suspended" },
                  { value: "terminated", label: "Terminated" },
                  { value: "resigned", label: "Resigned" },
                ]}
                wrapperClassName="mb-0 min-w-[8rem]"
                className="text-sm"
              />
              <Select
                // label="Employment Type"
                value={filterEmploymentType}
                onChange={(e) => {
                  setFilterEmploymentType(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "", label: "Employment Type" },
                  { value: "permanent", label: "Permanent" },
                  { value: "contract", label: "Contract" },
                  { value: "casual", label: "Casual" },
                  { value: "intern", label: "Intern" },
                ]}
                wrapperClassName="mb-0 min-w-[10rem]"
                className="text-sm "
              />
            </div>



            <div className="ml-auto text-xs text-slate-400 font-medium">
              {!isLoading && totalItems > 0 && `${startIndex}–${endIndex} of ${totalItems}`}
            </div>
          </div>


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


          <div className="p-2">
            <DataTable
              columns={[
                {
                  header: "Employee",
                  cell: (emp: Employee) => {
                    const photoUrl = getPhotoUrl(emp.photoUrl);
                    return (
                      <div
                        className="flex items-center gap-3"
                      >
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement("div");
                                fallback.className =
                                  "w-10 h-10 rounded-full border bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm";
                                fallback.textContent = getInitials(
                                  emp.firstName,
                                  emp.lastName
                                );
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[0.9rem] text-gray-900">
                            {emp.firstName} {emp.middleName} {emp.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {emp.employeeNumber}
                          </div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Role",
                  cell: (emp: Employee) => (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {emp.jobTitle}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {emp.employmentType}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Department",
                  cell: (emp: Employee) => (
                    <span className="text-gray-600">
                      {emp.department?.name || "Unassigned"}
                    </span>
                  ),
                },
                {
                  header: "Contact",
                  cell: (emp: Employee) => (
                    <div className="space-y-1">
                      {emp.workEmail && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          {/* <FiMail className="w-3 h-3" /> */}
                          <span className="truncate max-w-[200px]">
                            {emp.workEmail}
                          </span>
                        </div>
                      )}
                      {emp.phonePrimary && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          {/* <FiPhone className="w-3 h-3" /> */}
                          <span>{emp.phonePrimary}</span>
                        </div>
                      )}
                      {!emp.workEmail && !emp.phonePrimary && (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  ),
                },
                {
                  header: "Status",
                  cell: (emp: Employee) => (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_MAP[emp.status].bg} ${STATUS_MAP[emp.status].text}`}>

                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  ),
                },
                {
                  header: "Joined",
                  cell: (emp: Employee) => (
                    <span className="text-sm text-gray-600">
                      {new Date(emp.hireDate).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  header: "Actions",
                  cell: (emp: Employee) => (
                    <div className="flex items-center gap-2">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/${emp.id}/salary`);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View salary"
                      >
                        <FiDollarSign className="w-4 h-4" />
                      </button>
                      {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(emp);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit employee"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button> */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(emp.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete employee"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>

                      <QuickActionsMenu
                        onView={() => setDetailEmpId(emp.id)}
                        onEdit={() => { setEditEmployee(emp); setShowFormDrawer(true); }}
                        onSalary={() => navigate(`/employees/${emp.id}/salary`)}
                        onDelete={() => handleDelete(emp.id)}
                      />


                    </div>
                  ),
                },
              ]}
              rows={employees}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              tableLoading={isLoading}
              hasSearched={
                !!searchTerm ||
                !!filterDepartment ||
                !!filterStatus ||
                !!filterEmploymentType
              }
              onRowClick={(row: Employee) => setDetailEmpId(row.id)}


              showCheckboxes={true}
              isAllSelected={employees.length > 0 && selectedIds.size === employees.length}
              onToggleAll={toggleAll}
              isRowSelected={(row) => selectedIds.has(row.id)}
              onToggleRow={(rowId, isSelected) => toggleOne(rowId as string, isSelected)}
              getRowId={(row: Employee) => row.id as string}
            />
          </div>

        </div>
      </div>

      {/* Drawers */}
      {detailEmpId && (
        <EmployeeDetailDrawer
          employeeId={detailEmpId}
          onClose={() => setDetailEmpId(null)}
          onEdit={id => { const e = employees.find(x => x.id === id); if (e) { setEditEmployee(e); setShowFormDrawer(true); } setDetailEmpId(null); }}
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