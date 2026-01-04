import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import api from "../../services/api";
import type { SalaryComponent, CreateSalaryComponentInput } from "../../types/salary";

const ComponentsPage: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [formData, setFormData] = useState<CreateSalaryComponentInput>({
    name: "",
    code: "",
    type: "earning",
    category: "",
    calculationType: "fixed",
    defaultAmount: null,
    isTaxable: true,
    isStatutory: false,
    isActive: true,
    displayOrder: 0,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchComponents();
  }, [filterType, filterCategory]);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("category", filterCategory);
      const response = await api.get(`/salary-components?${params.toString()}`);
      setComponents(response.data.components || []);
    } catch (error: any) {
      console.error("Failed to fetch salary components:", error);
      setError(error.response?.data?.error || "Failed to fetch salary components");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingComponent(null);
    setFormData({
      name: "",
      code: "",
      type: "earning",
      category: "",
      calculationType: "fixed",
      defaultAmount: null,
      isTaxable: true,
      isStatutory: false,
      isActive: true,
      displayOrder: 0,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      code: component.code,
      type: component.type,
      category: component.category,
      calculationType: component.calculationType,
      defaultAmount: component.defaultAmount || null,
      percentageOf: component.percentageOf || null,
      percentageValue: component.percentageValue || null,
      isTaxable: component.isTaxable,
      isStatutory: component.isStatutory,
      statutoryType: component.statutoryType || null,
      isActive: component.isActive,
      displayOrder: component.displayOrder,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingComponent) {
        await api.put(`/salary-components/${editingComponent.id}`, formData);
      } else {
        await api.post("/salary-components", formData);
      }
      setIsFormOpen(false);
      fetchComponents();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save salary component");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this salary component?")) {
      return;
    }

    try {
      await api.delete(`/salary-components/${id}`);
      fetchComponents();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete salary component");
    }
  };

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "earning", label: "Earnings" },
    { value: "deduction", label: "Deductions" },
  ];

  const categories = Array.from(new Set(components.map((c) => c.category))).sort();
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const filteredComponents = components.filter((comp) => {
    if (filterType && comp.type !== filterType) return false;
    if (filterCategory && comp.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Components</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage salary components (earnings and deductions)
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus className="w-4 h-4" />}>
          Add Component
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={typeOptions}
              wrapperClassName="mb-0"
            />
            <Select
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={categoryOptions}
              wrapperClassName="mb-0"
            />
          </div>
        </div>

        <DataTable
          columns={[
            {
              header: "Name",
              cell: (comp: SalaryComponent) => (
                <div>
                  <div className="font-medium text-gray-900">{comp.name}</div>
                  <div className="text-sm text-gray-500">{comp.code}</div>
                </div>
              ),
            },
            {
              header: "Type",
              cell: (comp: SalaryComponent) => (
                <div className="flex items-center gap-2">
                  {comp.type === "earning" ? (
                    <FiTrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className="capitalize">{comp.type}</span>
                </div>
              ),
            },
            {
              header: "Category",
              cell: (comp: SalaryComponent) => (
                <span className="text-gray-600">{comp.category}</span>
              ),
            },
            {
              header: "Calculation",
              cell: (comp: SalaryComponent) => (
                <div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {comp.calculationType}
                  </div>
                  {comp.calculationType === "fixed" && comp.defaultAmount && (
                    <div className="text-xs text-gray-500">
                      {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(comp.defaultAmount)}
                    </div>
                  )}
                  {comp.calculationType === "percentage" && comp.percentageValue && (
                    <div className="text-xs text-gray-500">{comp.percentageValue}%</div>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (comp: SalaryComponent) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comp.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {comp.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (comp: SalaryComponent) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(comp)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comp.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredComponents}
          totalItems={filteredComponents.length}
          startIndex={1}
          endIndex={filteredComponents.length}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          pageSize={filteredComponents.length}
          tableLoading={isLoading}
          hasSearched={!!filterType || !!filterCategory}
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingComponent ? "Edit Salary Component" : "New Salary Component"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
              <Select
                label="Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "earning" | "deduction" })
                }
                options={[
                  { value: "earning", label: "Earning" },
                  { value: "deduction", label: "Deduction" },
                ]}
                required
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <Select
                label="Calculation Type"
                value={formData.calculationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calculationType: e.target.value as "fixed" | "percentage",
                  })
                }
                options={[
                  { value: "fixed", label: "Fixed Amount" },
                  { value: "percentage", label: "Percentage" },
                ]}
                required
              />
              {formData.calculationType === "fixed" && (
                <Input
                  label="Default Amount"
                  name="defaultAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultAmount?.toString() || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultAmount: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              )}
              {formData.calculationType === "percentage" && (
                <>
                  <Input
                    label="Percentage Value"
                    name="percentageValue"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.percentageValue?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentageValue: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                  />
                </>
              )}
              <Input
                label="Display Order"
                name="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder?.toString() || "0"}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTaxable}
                  onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Taxable</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isStatutory}
                  onChange={(e) => setFormData({ ...formData, isStatutory: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Statutory</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingComponent ? "Update" : "Create"} Component
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ComponentsPage;

