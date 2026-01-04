import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiUsers } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import api from "../../services/api";
import type { Department } from "../../types/department";
import type { Employee } from "../../types/employee";

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/departments");
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete department");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
    fetchDepartments();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your company's organizational structure
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus className="w-4 h-4" />}>
          Add Department
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Name",
              cell: (dept: Department) => (
                <div>
                  <div className="font-medium text-gray-900">{dept.name}</div>
                  {dept.code && (
                    <div className="text-xs text-gray-500">Code: {dept.code}</div>
                  )}
                </div>
              ),
            },
            {
              header: "Manager",
              cell: (dept: Department) => (
                dept.manager ? (
                  <div className="flex items-center gap-2">
                    {dept.manager.photoUrl ? (
                      <img
                        src={dept.manager.photoUrl}
                        alt={`${dept.manager.firstName} ${dept.manager.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                        {dept.manager.firstName.charAt(0)}{dept.manager.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {dept.manager.firstName} {dept.manager.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{dept.manager.jobTitle}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No Manager</span>
                )
              ),
            },
            {
              header: "Parent Department",
              cell: (dept: Department) => (
                <span className="text-gray-600">
                  {dept.parentDepartment ? dept.parentDepartment.name : "Top Level"}
                </span>
              ),
            },
            {
              header: "Employees",
              cell: (dept: Department) => (
                <div className="flex items-center gap-1 text-gray-600">
                  <FiUsers className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {dept.employees?.length || 0}
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              cell: (dept: Department) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dept.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {dept.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Created",
              cell: (dept: Department) => (
                <span className="text-sm text-gray-600">
                  {new Date(dept.createdAt).toLocaleDateString()}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (dept: Department) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(dept);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit department"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(dept.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete department"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={departments}
          totalItems={departments.length}
          startIndex={1}
          endIndex={departments.length}
          currentPage={1}
          totalPages={1}
          tableLoading={isLoading}
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <DepartmentFormModal
          department={editingDepartment}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

interface DepartmentFormModalProps {
  department: Department | null;
  onClose: () => void;
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  department,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: department?.name || "",
    code: department?.code || "",
    description: department?.description || "",
    managerId: department?.managerId || "",
    parentDepartmentId: department?.parentDepartmentId || "",
    isActive: department?.isActive !== undefined ? department.isActive : true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code || "",
        description: department.description || "",
        managerId: department.managerId || "",
        parentDepartmentId: department.parentDepartmentId || "",
        isActive: department.isActive,
      });
    }
    fetchEmployees();
    fetchDepartments();
  }, [department]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees?limit=1000");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        managerId: formData.managerId || undefined,
        parentDepartmentId: formData.parentDepartmentId || undefined,
        code: formData.code || undefined,
      };

      if (department) {
        await api.put(`/departments/${department.id}`, submitData);
      } else {
        await api.post("/departments", submitData);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current department from parent options
  const parentOptions = [
    { value: "", label: "None (Top Level)" },
    ...departments
      .filter((d) => !department || d.id !== department.id)
      .map((d) => ({
        value: d.id,
        label: d.name,
      })),
  ];

  const managerOptions = [
    { value: "", label: "None" },
    ...employees.map((emp) => ({
      value: emp.id,
      label: `${emp.firstName} ${emp.lastName} - ${emp.jobTitle}`,
    })),
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={department ? "Edit Department" : "New Department"}
      size="lg"
      closeOnBackdropClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />

        <Input
          label="Code"
          type="text"
          name="code"
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          placeholder="e.g., FIN, HR, IT"
          helperText="Department code (optional)"
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Manager"
            name="managerId"
            value={formData.managerId}
            onChange={(e) =>
              setFormData({ ...formData, managerId: e.target.value })
            }
            options={managerOptions}
            leftIcon={<FiUser className="w-4 h-4" />}
          />

          <Select
            label="Parent Department"
            name="parentDepartmentId"
            value={formData.parentDepartmentId}
            onChange={(e) =>
              setFormData({ ...formData, parentDepartmentId: e.target.value })
            }
            options={parentOptions}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {department ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentsPage;

