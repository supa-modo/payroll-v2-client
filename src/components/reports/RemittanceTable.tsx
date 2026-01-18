/**
 * Remittance Table Component
 */

import { formatCurrency } from "../../utils/format";
import RemittanceStatusBadge from "./RemittanceStatusBadge";
import { TaxRemittance } from "../../types/report";
import { FiCheckCircle } from "react-icons/fi";

interface RemittanceTableProps {
  remittances: TaxRemittance[];
  onMarkAsRemitted?: (remittance: TaxRemittance) => void;
  isLoading?: boolean;
}

export default function RemittanceTable({
  remittances,
  onMarkAsRemitted,
  isLoading = false,
}: RemittanceTableProps) {
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (remittances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No remittances found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remitted Date
              </th>
              {onMarkAsRemitted && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {remittances.map((remittance) => {
              const overdue =
                remittance.status === "pending" &&
                isOverdue(remittance.dueDate);
              return (
                <tr key={remittance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {remittance.payrollPeriod?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {remittance.payrollPeriod?.startDate &&
                        formatDate(remittance.payrollPeriod.startDate)}{" "}
                      -{" "}
                      {remittance.payrollPeriod?.endDate &&
                        formatDate(remittance.payrollPeriod.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        remittance.taxType === "PAYE"
                          ? "bg-blue-100 text-blue-800"
                          : remittance.taxType === "NSSF"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {remittance.taxType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(remittance.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(remittance.dueDate)}
                    {overdue && (
                      <span className="ml-2 text-xs text-red-600">(Overdue)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RemittanceStatusBadge
                      status={remittance.status}
                      overdue={overdue}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {remittance.remittanceReference || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {remittance.remittedAt
                      ? formatDate(remittance.remittedAt)
                      : "-"}
                  </td>
                  {onMarkAsRemitted && remittance.status === "pending" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onMarkAsRemitted(remittance)}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center gap-1 ml-auto"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Mark as Remitted
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
