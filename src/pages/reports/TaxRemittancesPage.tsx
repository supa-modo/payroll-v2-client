/**
 * Tax Remittances Page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import RemittanceTable from "../../components/reports/RemittanceTable";
import RemittanceSummaryCards from "../../components/reports/RemittanceSummaryCards";
import MarkRemittedModal from "../../components/reports/MarkRemittedModal";
import { getRemittances, markAsRemitted, RemittanceFilters } from "../../api/taxRemittances";
import { TaxRemittance } from "../../types/report";
import Button from "../../components/ui/Button";

export default function TaxRemittancesPage() {
  const navigate = useNavigate();
  const [remittances, setRemittances] = useState<TaxRemittance[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMarkingRemitted, setIsMarkingRemitted] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<TaxRemittance | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<RemittanceFilters>({
    status: "pending",
    includeOverdue: true,
  });

  const [dateFilters, setDateFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadRemittances();
  }, [filters, dateFilters]);

  const loadRemittances = async () => {
    setLoading(true);
    try {
      const response = await getRemittances({
        ...filters,
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate,
      });
      setRemittances(response.remittances);
    } catch (error: any) {
      console.error("Failed to load remittances:", error);
      alert(error.response?.data?.error || "Failed to load remittances");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRemitted = async (
    remittanceReference: string,
    notes?: string
  ) => {
    if (!selectedRemittance) return;

    setIsMarkingRemitted(true);
    try {
      await markAsRemitted(selectedRemittance.id, remittanceReference, notes);
      await loadRemittances();
      setShowMarkModal(false);
      setSelectedRemittance(null);
    } catch (error: any) {
      console.error("Failed to mark as remitted:", error);
      throw error;
    } finally {
      setIsMarkingRemitted(false);
    }
  };

  const calculateSummary = () => {
    const pending = remittances.filter((r) => r.status === "pending");
    const remitted = remittances.filter((r) => r.status === "remitted");

    return {
      pendingPAYE: pending
        .filter((r) => r.taxType === "PAYE")
        .reduce((sum, r) => sum + r.amount, 0),
      pendingNSSF: pending
        .filter((r) => r.taxType === "NSSF")
        .reduce((sum, r) => sum + r.amount, 0),
      pendingNHIF: pending
        .filter((r) => r.taxType === "NHIF")
        .reduce((sum, r) => sum + r.amount, 0),
      remittedPAYE: remitted
        .filter((r) => r.taxType === "PAYE")
        .reduce((sum, r) => sum + r.amount, 0),
      remittedNSSF: remitted
        .filter((r) => r.taxType === "NSSF")
        .reduce((sum, r) => sum + r.amount, 0),
      remittedNHIF: remitted
        .filter((r) => r.taxType === "NHIF")
        .reduce((sum, r) => sum + r.amount, 0),
      overdueCount: pending.filter(
        (r) => new Date(r.dueDate) < new Date()
      ).length,
    };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Remittances</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage tax remittances (PAYE, NSSF, NHIF) for payroll periods
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/reports/payroll")}
          >
            View Tax Summary
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={loadRemittances} disabled={loading}>
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <RemittanceSummaryCards
        pendingPAYE={summary.pendingPAYE}
        pendingNSSF={summary.pendingNSSF}
        pendingNHIF={summary.pendingNHIF}
        remittedPAYE={summary.remittedPAYE}
        remittedNSSF={summary.remittedNSSF}
        remittedNHIF={summary.remittedNHIF}
        overdueCount={summary.overdueCount}
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as "pending" | "remitted" | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="remitted">Remitted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Type
              </label>
              <select
                value={filters.taxType || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    taxType: e.target.value as "PAYE" | "NSSF" | "NHIF" | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="PAYE">PAYE</option>
                <option value="NSSF">NSSF</option>
                <option value="NHIF">NHIF</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) =>
                  setDateFilters({ ...dateFilters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) =>
                  setDateFilters({ ...dateFilters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Remittances Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <p className="text-gray-500">Loading remittances...</p>
        </div>
      ) : (
        <RemittanceTable
          remittances={remittances}
          onMarkAsRemitted={(remittance) => {
            setSelectedRemittance(remittance);
            setShowMarkModal(true);
          }}
          isLoading={isMarkingRemitted}
        />
      )}

      {/* Mark as Remitted Modal */}
      <MarkRemittedModal
        isOpen={showMarkModal}
        onClose={() => {
          setShowMarkModal(false);
          setSelectedRemittance(null);
        }}
        onConfirm={handleMarkAsRemitted}
        remittance={selectedRemittance}
        isLoading={isMarkingRemitted}
      />
    </div>
  );
}
