import React, { useState, useEffect } from "react";
import { FiDownload, FiEye } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import DateInput from "../../components/ui/DateInput";
import Select from "../../components/ui/Select";
import api from "../../services/api";
import { exportToCSV } from "../../utils/export";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userId: "",
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/audit-logs?${params.toString()}`);
      setAuditLogs(response.data.auditLogs || []);
      setPagination(response.data.pagination || pagination);
    } catch (error: any) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    const csvData = auditLogs.map((log) => ({
      Date: new Date(log.createdAt).toLocaleString(),
      User: log.user
        ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})`
        : "System",
      Action: log.action,
      "Entity Type": log.entityType,
      "Entity ID": log.entityId,
      "IP Address": log.ipAddress || "N/A",
    }));

    exportToCSV(csvData, `audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const columns = [
    {
      header: "Date",
      cell: (row: AuditLog) => (
        <span className="text-sm text-gray-900">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: "User",
      cell: (row: AuditLog) => (
        <div>
          {row.user ? (
            <div>
              <div className="text-sm font-medium text-gray-900">
                {row.user.firstName} {row.user.lastName}
              </div>
              <div className="text-xs text-gray-500">{row.user.email}</div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">System</span>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      cell: (row: AuditLog) => {
        const actionColors: Record<string, string> = {
          CREATE: "bg-green-100 text-green-800",
          UPDATE: "bg-blue-100 text-blue-800",
          DELETE: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              actionColors[row.action] || "bg-gray-100 text-gray-800"
            }`}
          >
            {row.action}
          </span>
        );
      },
    },
    {
      header: "Entity Type",
      cell: (row: AuditLog) => (
        <span className="text-sm text-gray-900">{row.entityType}</span>
      ),
    },
    {
      header: "Entity ID",
      cell: (row: AuditLog) => (
        <span className="text-sm text-gray-500 font-mono">
          {row.entityId.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: "IP Address",
      cell: (row: AuditLog) => (
        <span className="text-sm text-gray-500">{row.ipAddress || "N/A"}</span>
      ),
    },
    {
      header: "Actions",
      cell: (row: AuditLog) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-green-600 hover:text-green-800 p-2"
          title="View details"
        >
          <FiEye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all system activities and changes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          leftIcon={<FiDownload className="w-4 h-4" />}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Action"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
            options={[
              { value: "", label: "All Actions" },
              { value: "CREATE", label: "Create" },
              { value: "UPDATE", label: "Update" },
              { value: "DELETE", label: "Delete" },
            ]}
          />
          <Input
            label="Entity Type"
            value={filters.entityType}
            onChange={(e) => handleFilterChange("entityType", e.target.value)}
            placeholder="e.g., Employee, Payroll"
          />
          <DateInput
            label="Start Date"
            value={filters.startDate}
            onChange={(e) =>
              handleFilterChange("startDate", e.target.value)
            }
          />
          <DateInput
            label="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                page: 1,
                limit: 50,
                userId: "",
                action: "",
                entityType: "",
                startDate: "",
                endDate: "",
              });
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          rows={auditLogs}
          totalItems={pagination.total}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          pageSize={pagination.limit}
          tableLoading={isLoading}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Date
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Action
                </label>
                <p className="text-sm text-gray-900">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Entity Type
                </label>
                <p className="text-sm text-gray-900">
                  {selectedLog.entityType}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Entity ID
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedLog.entityId}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  User
                </label>
                <p className="text-sm text-gray-900">
                  {selectedLog.user
                    ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.email})`
                    : "System"}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  IP Address
                </label>
                <p className="text-sm text-gray-900">
                  {selectedLog.ipAddress || "N/A"}
                </p>
              </div>
            </div>

            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Changes
                </label>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.previousData && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Previous Data
                </label>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedLog.previousData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.newData && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  New Data
                </label>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedLog.userAgent && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  User Agent
                </label>
                <p className="text-sm text-gray-900">{selectedLog.userAgent}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;

