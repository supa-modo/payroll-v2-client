import React, { useState } from "react";
import { FiSearch, FiFileText } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import DataChangeHistory from "../../components/admin/DataChangeHistory";
import api from "../../services/api";

const DataChangeHistoryPage: React.FC = () => {
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const entityTypeOptions = [
    { value: "", label: "Select entity type" },
    { value: "Employee", label: "Employee" },
    { value: "Payroll", label: "Payroll" },
    { value: "Expense", label: "Expense" },
    { value: "User", label: "User" },
    { value: "Department", label: "Department" },
  ];

  const handleSearch = async () => {
    if (!entityType || !entityId) {
      setError("Please select entity type and enter entity ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Validate entity exists by fetching it
      const endpoint = `/${entityType.toLowerCase()}s/${entityId}`;
      await api.get(endpoint);
      // If successful, entity exists - history will be shown by DataChangeHistory component
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError("Entity not found. Please check the entity ID.");
      } else {
        setError("Failed to verify entity. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Change History</h1>
        <p className="text-sm text-gray-600 mt-1">
          View detailed change history for any entity
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Entity Type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            options={entityTypeOptions}
          />
          <Input
            label="Entity ID"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Enter entity UUID"
          />
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleSearch}
              isLoading={isLoading}
              leftIcon={<FiSearch className="w-4 h-4" />}
              className="w-full"
            >
              Search
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {entityType && entityId && !error && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <DataChangeHistory
            entityType={entityType}
            entityId={entityId}
            showExport={true}
          />
        </div>
      )}

      {!entityType && !entityId && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Select an entity type and enter an entity ID to view change history
          </p>
        </div>
      )}
    </div>
  );
};

export default DataChangeHistoryPage;

