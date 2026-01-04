import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import api from "../../services/api";
import type { Expense, ExpenseCategory } from "../../types/expense";

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });
  const pageSize = 30;

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [currentPage, filters]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.expenses || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/expense-categories?isActive=true");
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete expense");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      submitted: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
      pending_manager: { label: "Pending Manager", className: "bg-yellow-100 text-yellow-800" },
      pending_finance: { label: "Pending Finance", className: "bg-orange-100 text-orange-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      paid: { label: "Paid", className: "bg-purple-100 text-purple-800" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and track expense claims</p>
        </div>
        <Button onClick={() => navigate("/expenses/submit")} leftIcon={<FiPlus className="w-4 h-4" />}>
          Submit Expense
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Submitted" },
              { value: "pending_manager", label: "Pending Manager" },
              { value: "pending_finance", label: "Pending Finance" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <Select
            label="Category"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
          <DateInput
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <DateInput
            label="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        <DataTable
          columns={[
            {
              header: "Expense Number",
              cell: (expense: Expense) => (
                <div className="font-medium text-gray-900">{expense.expenseNumber}</div>
              ),
            },
            {
              header: "Employee",
              cell: (expense: Expense) => (
                <div>
                  {expense.employee
                    ? `${expense.employee.firstName} ${expense.employee.lastName}`
                    : "N/A"}
                </div>
              ),
            },
            {
              header: "Category",
              cell: (expense: Expense) => (
                <div>
                  {expense.category ? (
                    <>
                      <div className="font-medium text-gray-900">{expense.category.name}</div>
                      <div className="text-xs text-gray-500">{expense.category.code}</div>
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              ),
            },
            {
              header: "Title",
              cell: (expense: Expense) => (
                <div className="max-w-xs truncate" title={expense.title}>
                  {expense.title}
                </div>
              ),
            },
            {
              header: "Amount",
              cell: (expense: Expense) => (
                <div className="font-medium text-gray-900">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: expense.currency || "KES",
                  }).format(parseFloat(expense.amount.toString()))}
                </div>
              ),
            },
            {
              header: "Date",
              cell: (expense: Expense) => (
                <div className="text-sm text-gray-600">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </div>
              ),
            },
            {
              header: "Status",
              cell: (expense: Expense) => getStatusBadge(expense.status),
            },
            {
              header: "Actions",
              cell: (expense: Expense) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/expenses/${expense.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  {expense.status === "draft" && (
                    <>
                      <button
                        onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          rows={expenses}
          totalItems={totalItems}
          startIndex={(currentPage - 1) * pageSize + 1}
          endIndex={Math.min(currentPage * pageSize, totalItems)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          tableLoading={isLoading}
          hasSearched={!!(filters.status || filters.categoryId || filters.startDate || filters.endDate)}
          showCheckboxes={false}
        />
      </div>
    </div>
  );
};

export default ExpensesPage;

