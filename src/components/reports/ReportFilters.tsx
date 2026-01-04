/**
 * Report Filters Component
 */

import { useState, useEffect } from "react";
import DateInput from "../ui/DateInput";
import Select from "../ui/Select";
import { ReportFilters as ReportFiltersType } from "../../types/report";
import api from "../../services/api";
import { Department } from "../../types/department";
import { Employee } from "../../types/employee";
import { ExpenseCategory } from "../../types/expense";

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  showDepartment?: boolean;
  showEmployee?: boolean;
  showCategory?: boolean;
  showLimit?: boolean;
}

export default function ReportFilters({
  filters,
  onChange,
  showDepartment = false,
  showEmployee = false,
  showCategory = false,
  showLimit = false,
}: ReportFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (showDepartment) {
          const response = await api.get("/departments");
          setDepartments(response.data.departments || []);
        }
        if (showEmployee) {
          const response = await api.get("/employees?page=1&limit=1000");
          setEmployees(response.data.employees || []);
        }
        if (showCategory) {
          const response = await api.get("/expense-categories");
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };

    loadData();
  }, [showDepartment, showEmployee, showCategory]);

  const handleDateChange = (field: "startDate" | "endDate") => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  const handleSelectChange = (field: keyof ReportFiltersType, value: string) => {
    onChange({ ...filters, [field]: value || undefined });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({ ...filters, limit: value ? Number(value) : undefined });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <DateInput
          value={filters.startDate}
          onChange={handleDateChange("startDate")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <DateInput
          value={filters.endDate}
          onChange={handleDateChange("endDate")}
        />
      </div>

      {showDepartment && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select
            value={filters.departmentId || ""}
            onChange={(e) => handleSelectChange("departmentId", e.target.value)}
            options={[
              { value: "", label: "All Departments" },
              ...departments.map((dept) => ({
                value: dept.id,
                label: dept.name,
              })),
            ]}
          />
        </div>
      )}

      {showEmployee && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <Select
            value={filters.employeeId || ""}
            onChange={(e) => handleSelectChange("employeeId", e.target.value)}
            options={[
              { value: "", label: "All Employees" },
              ...employees.map((emp) => ({
                value: emp.id,
                label: `${emp.firstName} ${emp.lastName}`,
              })),
            ]}
          />
        </div>
      )}

      {showCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={filters.categoryId || ""}
            onChange={(e) => handleSelectChange("categoryId", e.target.value)}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
          />
        </div>
      )}

      {showLimit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limit
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={filters.limit || 10}
            onChange={handleLimitChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}

