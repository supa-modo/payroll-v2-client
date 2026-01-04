import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEye } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import StatCard from "../../components/ui/StatCard";
import api from "../../services/api";
import type { Expense } from "../../types/expense";

const MyExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [stats, setStats] = useState({
    totalSubmitted: 0,
    pendingApproval: 0,
    approved: 0,
    paid: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, [filterStatus]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);

      const response = await api.get(`/expenses?${params.toString()}`);
      const allExpenses = response.data.expenses || [];

      // Filter to only current user's expenses (assuming employeeId matches user)
      // In a real app, the backend should filter by employeeId
      setExpenses(allExpenses);

      // Calculate stats
      setStats({
        totalSubmitted: allExpenses.length,
        pendingApproval: allExpenses.filter(
          (e: Expense) => e.status === "pending_manager" || e.status === "pending_finance"
        ).length,
        approved: allExpenses.filter((e: Expense) => e.status === "approved").length,
        paid: allExpenses.filter((e: Expense) => e.status === "paid").length,
      });
    } catch (error: any) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage your expense claims</p>
        </div>
        <Button onClick={() => navigate("/expenses/submit")} leftIcon={<FiPlus className="w-4 h-4" />}>
          Submit New Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={stats.totalSubmitted.toString()}
          icon={<FiPlus className="w-5 h-5" />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval.toString()}
          icon={<FiEye className="w-5 h-5" />}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Approved"
          value={stats.approved.toString()}
          icon={<FiPlus className="w-5 h-5" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Paid"
          value={stats.paid.toString()}
          icon={<FiPlus className="w-5 h-5" />}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
                <button
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View"
                >
                  <FiEye className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          rows={expenses}
          totalItems={expenses.length}
          startIndex={1}
          endIndex={expenses.length}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          pageSize={expenses.length}
          tableLoading={isLoading}
          hasSearched={!!filterStatus}
          showCheckboxes={false}
        />
      </div>
    </div>
  );
};

export default MyExpensesPage;

