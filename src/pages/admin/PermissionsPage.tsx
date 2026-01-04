import React, { useState, useEffect } from "react";
import { FiShield, FiCheck } from "react-icons/fi";
import api from "../../services/api";
import type { Permission } from "../../types/role";

const PermissionsPage: React.FC = () => {
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/permissions");
      setGroupedPermissions(response.data.grouped || {});
    } catch (error: any) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    employees: "Employee Management",
    payroll: "Payroll",
    salary: "Salary Structure",
    expenses: "Expenses",
    reports: "Reports",
    settings: "Settings",
    audit: "Audit & Compliance",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all available system permissions
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div
            key={category}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiShield className="w-5 h-5 text-primary-600" />
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perms.map((permission) => (
                <div
                  key={permission.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FiCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {permission.displayName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {permission.name}
                      </div>
                      {permission.description && (
                        <div className="text-sm text-gray-600 mt-2">
                          {permission.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsPage;

