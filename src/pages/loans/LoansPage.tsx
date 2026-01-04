/**
 * Loans Management Page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiDollarSign, FiCheck, FiPlus, FiEye, FiEdit } from "react-icons/fi";
import api from "../../services/api";
import { EmployeeLoan, LoansResponse } from "../../types/loan";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatCard from "../../components/ui/StatCard";
import LoanForm from "../../components/loans/LoanForm";

export default function LoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<EmployeeLoan | null>(null);
  const [filters, setFilters] = useState({
    employeeId: "",
    status: "",
    loanType: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalActive: 0,
    totalOutstanding: 0,
    totalCompleted: 0,
  });

  useEffect(() => {
    fetchLoans();
  }, [pagination.page, filters]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await api.get<LoansResponse>(`/loans?${params}`);
      setLoans(response.data.loans);
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });

      // Calculate summary
      const active = response.data.loans.filter((l) => l.status === "active");
      const outstanding = active.reduce(
        (sum, l) => sum + parseFloat(l.remainingBalance.toString()),
        0
      );
      const completed = response.data.loans.filter((l) => l.status === "completed").length;

      setSummary({
        totalActive: active.length,
        totalOutstanding: outstanding,
        totalCompleted: completed,
      });
    } catch (error: any) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLoan(null);
    setShowForm(true);
  };

  const handleEdit = (loan: EmployeeLoan) => {
    if (loan.status === "pending") {
      setEditingLoan(loan);
      setShowForm(true);
    }
  };

  const handleView = (loan: EmployeeLoan) => {
    navigate(`/loans/${loan.id}`);
  };

  const handleApprove = async (loan: EmployeeLoan) => {
    if (loan.status !== "pending") return;

    try {
      await api.post(`/loans/${loan.id}/approve`);
      fetchLoans();
    } catch (error: any) {
      console.error("Error approving loan:", error);
      alert(error.response?.data?.error || "Failed to approve loan");
    }
  };

  const handleComplete = async (loan: EmployeeLoan) => {
    if (loan.status !== "active") return;

    try {
      await api.post(`/loans/${loan.id}/complete`);
      fetchLoans();
    } catch (error: any) {
      console.error("Error completing loan:", error);
      alert(error.response?.data?.error || "Failed to complete loan");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLoan(null);
    fetchLoans();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      written_off: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      header: "Loan Number",
      cell: (loan: EmployeeLoan) => loan.loanNumber,
    },
    {
      header: "Employee",
      cell: (loan: EmployeeLoan) =>
        loan.employee
          ? `${loan.employee.firstName} ${loan.employee.lastName}`
          : "N/A",
    },
    {
      header: "Type",
      cell: (loan: EmployeeLoan) => loan.loanType,
    },
    {
      header: "Principal",
      cell: (loan: EmployeeLoan) =>
        `KES ${parseFloat(loan.principalAmount.toString()).toLocaleString()}`,
    },
    {
      header: "Total Amount",
      cell: (loan: EmployeeLoan) =>
        `KES ${parseFloat(loan.totalAmount.toString()).toLocaleString()}`,
    },
    {
      header: "Monthly Deduction",
      cell: (loan: EmployeeLoan) =>
        `KES ${parseFloat(loan.monthlyDeduction.toString()).toLocaleString()}`,
    },
    {
      header: "Remaining Balance",
      cell: (loan: EmployeeLoan) =>
        `KES ${parseFloat(loan.remainingBalance.toString()).toLocaleString()}`,
    },
    {
      header: "Status",
      cell: (loan: EmployeeLoan) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
            loan.status
          )}`}
        >
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1).replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (loan: EmployeeLoan) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(loan)}
            className="text-blue-600 hover:text-blue-800"
            title="View"
          >
            <FiEye size={18} />
          </button>
          {loan.status === "pending" && (
            <>
              <button
                onClick={() => handleEdit(loan)}
                className="text-gray-600 hover:text-gray-800"
                title="Edit"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={() => handleApprove(loan)}
                className="text-green-600 hover:text-green-800"
                title="Approve"
              >
                <FiCheck size={18} />
              </button>
            </>
          )}
          {loan.status === "active" && parseFloat(loan.remainingBalance.toString()) <= 0 && (
            <button
              onClick={() => handleComplete(loan)}
              className="text-green-600 hover:text-green-800"
              title="Complete"
            >
              <FiCheck size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Loans Management</h1>
        <Button onClick={handleCreate} leftIcon={<FiPlus />}>
          New Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Loans"
          value={summary.totalActive}
          icon={<FiDollarSign />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Outstanding"
          value={`KES ${summary.totalOutstanding.toLocaleString()}`}
          icon={<FiDollarSign />}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Completed Loans"
          value={summary.totalCompleted}
          icon={<FiCheck />}
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "written_off", label: "Written Off" },
            ]}
          />
          <Select
            label="Loan Type"
            value={filters.loanType}
            onChange={(e) => setFilters({ ...filters, loanType: e.target.value })}
            options={[
              { value: "", label: "All Types" },
              { value: "personal", label: "Personal" },
              { value: "advance", label: "Advance" },
              { value: "emergency", label: "Emergency" },
              { value: "salary_advance", label: "Salary Advance" },
            ]}
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          rows={loans}
          tableLoading={loading}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page: number) => setPagination({ ...pagination, page })}
          totalItems={pagination.total}
          startIndex={(pagination.page - 1) * pagination.limit + 1}
          endIndex={Math.min(pagination.page * pagination.limit, pagination.total)}
          showCheckboxes={false}
        />
      </div>

      {/* Loan Form Modal */}
      {showForm && (
        <LoanForm
          loan={editingLoan || undefined}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
}

