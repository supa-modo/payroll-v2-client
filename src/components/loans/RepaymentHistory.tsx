/**
 * Repayment History Component
 */

import { useState, useEffect } from "react";
import { FiDollarSign } from "react-icons/fi";
import api from "../../services/api";
import { LoanRepayment, LoanRepaymentsResponse } from "../../types/loan";
import DataTable from "../ui/DataTable";

interface RepaymentHistoryProps {
  loanId: string;
}

export default function RepaymentHistory({ loanId }: RepaymentHistoryProps) {
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepayments();
  }, [loanId]);

  const fetchRepayments = async () => {
    try {
      setLoading(true);
      const response = await api.get<LoanRepaymentsResponse>(`/loans/${loanId}/repayments`);
      setRepayments(response.data.repayments || []);
    } catch (error: any) {
      console.error("Error fetching repayments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    if (type === "payroll") {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      header: "Date",
      cell: (repayment: LoanRepayment) => {
        const date = new Date(repayment.repaymentDate);
        return date.toLocaleDateString();
      },
    },
    {
      header: "Amount",
      cell: (repayment: LoanRepayment) =>
        `KES ${parseFloat(repayment.amount.toString()).toLocaleString()}`,
    },
    {
      header: "Payment Type",
      cell: (repayment: LoanRepayment) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadge(
            repayment.paymentType
          )}`}
        >
          {repayment.paymentType.charAt(0).toUpperCase() + repayment.paymentType.slice(1)}
        </span>
      ),
    },
    {
      header: "Balance After",
      cell: (repayment: LoanRepayment) =>
        `KES ${parseFloat(repayment.balanceAfter.toString()).toLocaleString()}`,
    },
    {
      header: "Notes",
      cell: (repayment: LoanRepayment) => repayment.notes || "-",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">Loading repayment history...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment History</h3>
      {repayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiDollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No repayments recorded yet</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={repayments}
          tableLoading={false}
          showCheckboxes={false}
          totalItems={repayments.length}
          startIndex={1}
          endIndex={repayments.length}
        />
      )}
    </div>
  );
}

