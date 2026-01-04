import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiSend, FiX } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import FileUpload from "../../components/ui/FileUpload";
import api from "../../services/api";
import type { ExpenseCategory, CreateExpenseInput } from "../../types/expense";

const SubmitExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateExpenseInput>({
    categoryId: "",
    departmentId: "",
    title: "",
    description: "",
    amount: 0,
    currency: "KES",
    exchangeRate: 1,
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/expense-categories?isActive=true");
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Failed to fetch expense categories:", error);
      setError(error.response?.data?.error || "Failed to load expense categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Create expense
      const expenseResponse = await api.post("/expenses", formData);
      const expense = expenseResponse.data.expense;

      // Upload receipt if provided
      if (receiptFile && expense.id) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", receiptFile);
        formDataUpload.append("documentType", "receipt");

        await api.post(`/expenses/${expense.id}/documents`, formDataUpload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Submit for approval if not saving as draft
      if (!saveAsDraft) {
        await api.post(`/expenses/${expense.id}/submit`);
      }

      navigate("/expenses");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Expense</h1>
        <p className="mt-2 text-sm text-gray-600">Create a new expense claim</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Expense Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            required
            options={[
              { value: "", label: "Select category..." },
              ...categories.map((cat) => ({
                value: cat.id,
                label: `${cat.name} (${cat.code})`,
              })),
            ]}
          />

          <DateInput
            label="Expense Date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            required
          />

          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Brief description of the expense"
          />

          <div className="space-y-2">
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount?.toString() || ""}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
            {selectedCategory?.maxAmount && (
              <p className="text-xs text-gray-500">
                Max amount: {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(selectedCategory.maxAmount)}
              </p>
            )}
          </div>

          <Select
            label="Currency"
            name="currency"
            value={formData.currency || "KES"}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { value: "KES", label: "KES - Kenyan Shilling" },
              { value: "USD", label: "USD - US Dollar" },
              { value: "EUR", label: "EUR - Euro" },
            ]}
          />

          {formData.currency !== "KES" && (
            <Input
              label="Exchange Rate"
              name="exchangeRate"
              type="number"
              step="0.0001"
              min="0"
              value={formData.exchangeRate?.toString() || "1"}
              onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
              required
            />
          )}

          {formData.currency !== "KES" && formData.exchangeRate && formData.amount && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">
                Amount in KES:{" "}
                <span className="font-medium">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(formData.amount * formData.exchangeRate)}
                </span>
              </p>
            </div>
          )}
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Provide additional details about this expense..."
        />

        {selectedCategory?.requiresReceipt && (
          <div>
            <FileUpload
              label="Receipt"
              accept="image/*,.pdf"
              multiple={false}
              onChange={(file) => {
                if (file === null) {
                  setReceiptFile(null);
                } else if (!Array.isArray(file)) {
                  setReceiptFile(file);
                } else if (file.length > 0) {
                  setReceiptFile(file[0]);
                }
              }}
            />
            {selectedCategory.requiresReceipt && (
              <p className="mt-1 text-xs text-gray-500">Receipt is required for this category</p>
            )}
          </div>
        )}

        {selectedCategory && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md px-4 py-2.5">
            <p className="text-sm text-blue-700">
              <strong>Category Requirements:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                {selectedCategory.requiresManagerApproval && (
                  <li>Requires Manager Approval</li>
                )}
                {selectedCategory.requiresFinanceApproval && (
                  <li>Requires Finance Approval</li>
                )}
                {selectedCategory.autoApproveBelow && (
                  <li>
                    Auto-approved if amount is below{" "}
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(selectedCategory.autoApproveBelow)}
                  </li>
                )}
              </ul>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/expenses")}
            disabled={isSubmitting}
          >
            <FiX className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            <FiSave className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <FiSend className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitExpensePage;

