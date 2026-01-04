/**
 * Loan Summary Card Component
 */

import { FiDollarSign, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { EmployeeLoan } from "../../types/loan";

interface LoanSummaryCardProps {
  loan: EmployeeLoan;
}

export default function LoanSummaryCard({ loan }: LoanSummaryCardProps) {
  const progressPercentage =
    loan.totalAmount > 0
      ? (parseFloat(loan.totalPaid.toString()) / parseFloat(loan.totalAmount.toString())) * 100
      : 0;

  const remainingMonths =
    loan.monthlyDeduction > 0
      ? Math.ceil(parseFloat(loan.remainingBalance.toString()) / parseFloat(loan.monthlyDeduction.toString()))
      : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-blue-600" />
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            KES {parseFloat(loan.totalAmount.toString()).toLocaleString()}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-green-600" />
            <h3 className="text-sm font-medium text-gray-500">Remaining Balance</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            KES {parseFloat(loan.remainingBalance.toString()).toLocaleString()}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiCalendar className="text-purple-600" />
            <h3 className="text-sm font-medium text-gray-500">Progress</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {loan.status === "active" && (
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly Deduction</p>
            <p className="text-lg font-semibold text-gray-900">
              KES {parseFloat(loan.monthlyDeduction.toString()).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Remaining Months</p>
            <p className="text-lg font-semibold text-gray-900">{remainingMonths} months</p>
          </div>
        </div>
      )}
    </div>
  );
}

