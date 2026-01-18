/**
 * Remittance Summary Cards Component
 */

import { formatCurrency } from "../../utils/format";
import { FiDollarSign, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface RemittanceSummaryCardsProps {
  pendingPAYE: number;
  pendingNSSF: number;
  pendingNHIF: number;
  remittedPAYE: number;
  remittedNSSF: number;
  remittedNHIF: number;
  overdueCount?: number;
}

export default function RemittanceSummaryCards({
  pendingPAYE,
  pendingNSSF,
  pendingNHIF,
  remittedPAYE,
  remittedNSSF,
  remittedNHIF,
  overdueCount = 0,
}: RemittanceSummaryCardsProps) {
  const totalPending = pendingPAYE + pendingNSSF + pendingNHIF;
  const totalRemitted = remittedPAYE + remittedNSSF + remittedNHIF;
  const totalStatutory = totalPending + totalRemitted;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Pending */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-800">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {formatCurrency(totalPending)}
            </p>
          </div>
          <FiAlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="mt-3 text-xs text-yellow-700">
          <div>PAYE: {formatCurrency(pendingPAYE)}</div>
          <div>NSSF: {formatCurrency(pendingNSSF)}</div>
          <div>NHIF: {formatCurrency(pendingNHIF)}</div>
        </div>
      </div>

      {/* Total Remitted */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Total Remitted</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {formatCurrency(totalRemitted)}
            </p>
          </div>
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="mt-3 text-xs text-green-700">
          <div>PAYE: {formatCurrency(remittedPAYE)}</div>
          <div>NSSF: {formatCurrency(remittedNSSF)}</div>
          <div>NHIF: {formatCurrency(remittedNHIF)}</div>
        </div>
      </div>

      {/* Total Statutory */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">Total Statutory</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(totalStatutory)}
            </p>
          </div>
          <FiDollarSign className="w-8 h-8 text-blue-600" />
        </div>
        <div className="mt-3 text-xs text-blue-700">
          <div>Pending: {formatCurrency(totalPending)}</div>
          <div>Remitted: {formatCurrency(totalRemitted)}</div>
        </div>
      </div>

      {/* Overdue Count */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Overdue</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {overdueCount}
              </p>
              <p className="text-xs text-red-700 mt-1">Remittances</p>
            </div>
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      )}
    </div>
  );
}
