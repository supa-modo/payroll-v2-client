import React, { useState, useEffect } from "react";
import { FiClock, FiUser, FiFileText } from "react-icons/fi";
import api from "../../services/api";
import { exportToCSV } from "../../utils/export";

interface DataChangeHistoryItem {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  changeReason?: string | null;
  changedAt: string;
  changedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface DataChangeHistoryProps {
  entityType: string;
  entityId: string;
  showExport?: boolean;
}

const DataChangeHistory: React.FC<DataChangeHistoryProps> = ({
  entityType,
  entityId,
  showExport = true,
}) => {
  const [history, setHistory] = useState<DataChangeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterField, setFilterField] = useState("");

  useEffect(() => {
    fetchHistory();
  }, [entityType, entityId]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/data-change-history?entityType=${entityType}&entityId=${entityId}`
      );
      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Failed to fetch change history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvData = history.map((item) => ({
      Date: new Date(item.changedAt).toLocaleString(),
      Field: item.fieldName,
      "Old Value": item.oldValue || "N/A",
      "New Value": item.newValue || "N/A",
      "Changed By": item.changedByUser
        ? `${item.changedByUser.firstName} ${item.changedByUser.lastName}`
        : "System",
      Reason: item.changeReason || "N/A",
    }));

    exportToCSV(
      csvData,
      `${entityType}-${entityId}-change-history-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const filteredHistory = filterField
    ? history.filter((item) =>
        item.fieldName.toLowerCase().includes(filterField.toLowerCase())
      )
    : history;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading change history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiFileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No change history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiClock className="w-5 h-5" />
          Change History
        </h3>
        {showExport && (
          <button
            onClick={handleExport}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Export CSV
          </button>
        )}
      </div>

      {history.length > 5 && (
        <div>
          <input
            type="text"
            placeholder="Filter by field name..."
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {item.fieldName}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.changedAt).toLocaleString()}
                </span>
              </div>
              {item.changedByUser && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiUser className="w-3 h-3" />
                  {item.changedByUser.firstName} {item.changedByUser.lastName}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="text-xs font-medium text-gray-600">Old Value:</span>
                <p className="text-sm text-gray-900 mt-1 break-words">
                  {item.oldValue || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">New Value:</span>
                <p className="text-sm text-gray-900 mt-1 break-words">
                  {item.newValue || "N/A"}
                </p>
              </div>
            </div>
            {item.changeReason && (
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-600">Reason:</span>
                <p className="text-sm text-gray-700 mt-1">{item.changeReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataChangeHistory;

