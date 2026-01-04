import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import api from "../../services/api";
import type { ExpenseCategory, CreateExpenseCategoryInput } from "../../types/expense";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<CreateExpenseCategoryInput>({
    name: "",
    code: "",
    description: "",
    monthlyBudget: null,
    requiresReceipt: true,
    maxAmount: null,
    requiresManagerApproval: true,
    requiresFinanceApproval: true,
    autoApproveBelow: null,
    glAccountCode: "",
    isActive: true,
    displayOrder: 0,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterActive, setFilterActive] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [filterActive]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterActive) params.append("isActive", filterActive);
      const response = await api.get(`/expense-categories?${params.toString()}`);
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Failed to fetch expense categories:", error);
      setError(error.response?.data?.error || "Failed to fetch expense categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      monthlyBudget: null,
      requiresReceipt: true,
      maxAmount: null,
      requiresManagerApproval: true,
      requiresFinanceApproval: true,
      autoApproveBelow: null,
      glAccountCode: "",
      isActive: true,
      displayOrder: 0,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      monthlyBudget: category.monthlyBudget || null,
      requiresReceipt: category.requiresReceipt,
      maxAmount: category.maxAmount || null,
      requiresManagerApproval: category.requiresManagerApproval,
      requiresFinanceApproval: category.requiresFinanceApproval,
      autoApproveBelow: category.autoApproveBelow || null,
      glAccountCode: category.glAccountCode || "",
      isActive: category.isActive,
      displayOrder: category.displayOrder,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingCategory) {
        await api.put(`/expense-categories/${editingCategory.id}`, formData);
      } else {
        await api.post("/expense-categories", formData);
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save expense category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense category?")) {
      return;
    }

    try {
      await api.delete(`/expense-categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete expense category");
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterActive && cat.isActive.toString() !== filterActive) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage expense categories and their approval requirements
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        <DataTable
          columns={[
            {
              header: "Category",
              cell: (cat: ExpenseCategory) => (
                <div>
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.code}</div>
                </div>
              ),
            },
            {
              header: "Budget",
              cell: (cat: ExpenseCategory) => (
                <div className="text-sm">
                  {cat.monthlyBudget ? (
                    <span className="text-gray-900">
                      {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(cat.monthlyBudget)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                  {cat.maxAmount && (
                    <div className="text-xs text-gray-500">
                      Max: {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(cat.maxAmount)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Requirements",
              cell: (cat: ExpenseCategory) => (
                <div className="flex flex-wrap gap-1">
                  {cat.requiresReceipt && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                      Receipt
                    </span>
                  )}
                  {cat.requiresManagerApproval && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                      Manager
                    </span>
                  )}
                  {cat.requiresFinanceApproval && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                      Finance
                    </span>
                  )}
                  {cat.autoApproveBelow && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                      Auto &lt; {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(cat.autoApproveBelow)}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (cat: ExpenseCategory) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cat.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (cat: ExpenseCategory) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredCategories}
          totalItems={filteredCategories.length}
          startIndex={1}
          endIndex={filteredCategories.length}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          pageSize={filteredCategories.length}
          tableLoading={isLoading}
          hasSearched={!!filterActive}
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingCategory ? "Edit Expense Category" : "New Expense Category"}
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
              <Textarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Input
                label="Monthly Budget"
                name="monthlyBudget"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyBudget?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyBudget: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <Input
                label="Max Amount"
                name="maxAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.maxAmount?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAmount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <Input
                label="Auto Approve Below"
                name="autoApproveBelow"
                type="number"
                step="0.01"
                min="0"
                value={formData.autoApproveBelow?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    autoApproveBelow: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <Input
                label="GL Account Code"
                name="glAccountCode"
                value={formData.glAccountCode || ""}
                onChange={(e) => setFormData({ ...formData, glAccountCode: e.target.value })}
              />
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
                  checked={formData.requiresReceipt}
                  onChange={(e) => setFormData({ ...formData, requiresReceipt: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Requires Receipt</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresManagerApproval}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresManagerApproval: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Requires Manager Approval</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresFinanceApproval}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresFinanceApproval: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Requires Finance Approval</span>
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
                {editingCategory ? "Update" : "Create"} Category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoriesPage;

