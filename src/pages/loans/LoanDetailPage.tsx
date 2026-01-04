/**
 * Loan Detail Page
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import api from "../../services/api";
import { EmployeeLoan } from "../../types/loan";
import Button from "../../components/ui/Button";
import RepaymentHistory from "../../components/loans/RepaymentHistory";
import LoanSummaryCard from "../../components/loans/LoanSummaryCard";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<EmployeeLoan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLoan();
    }
  }, [id]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ loan: EmployeeLoan }>(`/loans/${id}`);
      setLoan(response.data.loan);
    } catch (error: any) {
      console.error("Error fetching loan:", error);
      alert(error.response?.data?.error || "Failed to load loan");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!loan || loan.status !== "pending") return;

    try {
      await api.post(`/loans/${loan.id}/approve`);
      fetchLoan();
    } catch (error: any) {
      console.error("Error approving loan:", error);
      alert(error.response?.data?.error || "Failed to approve loan");
    }
  };

  const handleComplete = async () => {
    if (!loan || loan.status !== "active") return;

    try {
      await api.post(`/loans/${loan.id}/complete`);
      fetchLoan();
    } catch (error: any) {
      console.error("Error completing loan:", error);
      alert(error.response?.data?.error || "Failed to complete loan");
    }
  };

  const handleWriteOff = async () => {
    if (!loan || loan.status !== "active") return;

    const reason = prompt("Enter write-off reason:");
    if (!reason) return;

    try {
      await api.post(`/loans/${loan.id}/write-off`, { reason });
      fetchLoan();
    } catch (error: any) {
      console.error("Error writing off loan:", error);
      alert(error.response?.data?.error || "Failed to write off loan");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loan not found</p>
        <Button onClick={() => navigate("/loans")} className="mt-4">
          Back to Loans
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      written_off: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const progressPercentage =
    loan.totalAmount > 0
      ? ((parseFloat(loan.totalPaid.toString()) / parseFloat(loan.totalAmount.toString())) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate("/loans")} leftIcon={<FiArrowLeft />}>
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
      </div>

      {/* Loan Summary Card */}
      <LoanSummaryCard loan={loan} />

      {/* Loan Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Loan Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{loan.loanNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Employee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.employee
                    ? `${loan.employee.firstName} ${loan.employee.lastName} (${loan.employee.employeeNumber})`
                    : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{loan.loanType.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}
                  >
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1).replace("_", " ")}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Principal Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  KES {parseFloat(loan.principalAmount.toString()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">{loan.interestRate}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  KES {parseFloat(loan.totalAmount.toString()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Monthly Deduction</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  KES {parseFloat(loan.monthlyDeduction.toString()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Remaining Balance</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  KES {parseFloat(loan.remainingBalance.toString()).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  KES {parseFloat(loan.totalPaid.toString()).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {loan.reason && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Reason/Purpose</h3>
            <p className="text-sm text-gray-900">{loan.reason}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Repayment Progress</span>
            <span className="text-sm text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="flex gap-3">
          {loan.status === "pending" && (
            <Button onClick={handleApprove} leftIcon={<FiCheck />} variant="primary">
              Approve Loan
            </Button>
          )}
          {loan.status === "active" && parseFloat(loan.remainingBalance.toString()) <= 0 && (
            <Button onClick={handleComplete} leftIcon={<FiCheck />} variant="primary">
              Mark as Completed
            </Button>
          )}
          {loan.status === "active" && parseFloat(loan.remainingBalance.toString()) > 0 && (
            <Button onClick={handleWriteOff} leftIcon={<FiX />} variant="danger">
              Write Off Loan
            </Button>
          )}
        </div>
      </div>

      {/* Repayment History */}
      <RepaymentHistory loanId={loan.id} />
    </div>
  );
}

