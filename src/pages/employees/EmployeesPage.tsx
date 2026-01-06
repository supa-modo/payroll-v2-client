import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMail,
  FiPhone,
  FiDollarSign,
  FiEye,
} from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmployeeFormModal from "./EmployeeFormModal";
import api from "../../services/api";
import type { Employee } from "../../types/employee";
import type { Department } from "../../types/department";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const pageSize = 30;

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [
    currentPage,
    searchTerm,
    filterDepartment,
    filterStatus,
    filterEmploymentType,
  ]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (filterDepartment) {
        params.append("departmentId", filterDepartment);
      }
      if (filterStatus) {
        params.append("status", filterStatus);
      }
      if (filterEmploymentType) {
        params.append("employmentType", filterEmploymentType);
      }

      const response = await api.get(`/employees?${params.toString()}`);
      setEmployees(response.data.employees || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete employee");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "probation":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      case "resigned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const startIndex = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your company's employees
          </p>
        </div>
        <Button
          onClick={handleCreate}
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Add Employee
        </Button>
      </div>

      <div className="font-source-sans-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
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
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Department"
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
              wrapperClassName="mb-0"
            />
            <Select
              label="Status"
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
              wrapperClassName="mb-0"
            />
            <Select
              label="Employment Type"
              value={filterEmploymentType}
              onChange={(e) => {
                setFilterEmploymentType(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: "All Types" },
                { value: "permanent", label: "Permanent" },
                { value: "contract", label: "Contract" },
                { value: "casual", label: "Casual" },
                { value: "intern", label: "Intern" },
              ]}
              wrapperClassName="mb-0"
            />
          </div>
        </div>

        <DataTable
          columns={[
            {
              header: "Employee",
              cell: (emp: Employee) => {
                const getPhotoUrl = (photoUrl?: string) => {
                  if (!photoUrl) return null;
                  // If it's already a full URL, return as is
                  if (photoUrl.startsWith("http")) return photoUrl;
                  // Otherwise, construct the full URL
                  const baseURL =
                    api.defaults.baseURL?.replace("/api", "") || "";
                  return `${baseURL}/uploads/${photoUrl}`;
                };
                const photoUrl = getPhotoUrl(emp.photoUrl);
                return (
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/employees/${emp.id}`)}
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
                      <div className="font-semibold text-base text-gray-900">
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
                      <FiMail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">
                        {emp.workEmail}
                      </span>
                    </div>
                  )}
                  {emp.phonePrimary && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FiPhone className="w-3 h-3" />
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
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(emp.status)}`}
                >
                  {emp.status}
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
                      navigate(`/employees/${emp.id}`);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(emp);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit employee"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
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
          pageSize={pageSize}
          tableLoading={isLoading}
          hasSearched={
            !!searchTerm ||
            !!filterDepartment ||
            !!filterStatus ||
            !!filterEmploymentType
          }
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <EmployeeFormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          employee={editingEmployee}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
