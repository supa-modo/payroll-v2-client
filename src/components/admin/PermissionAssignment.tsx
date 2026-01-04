import React, { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import api from "../../services/api";
import type { Permission, Role } from "../../types/role";

interface PermissionAssignmentProps {
  role: Role;
  onClose: () => void;
  onSuccess?: () => void;
}

const PermissionAssignment: React.FC<PermissionAssignmentProps> = ({
  role,
  onClose,
  onSuccess,
}) => {
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPermissions();
    if (role.permissions) {
      setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/permissions");
      setGroupedPermissions(response.data.grouped || {});
    } catch (error: any) {
      console.error("Failed to fetch permissions:", error);
      setError("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await api.post(`/roles/${role.id}/permissions`, {
        permissionIds: Array.from(selectedPermissions),
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to assign permissions");
    } finally {
      setIsSubmitting(false);
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assign Permissions - ${role.displayName}`}
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading permissions...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-2">
                  {perms.map((permission) => {
                    const isSelected = selectedPermissions.has(permission.id);
                    return (
                      <label
                        key={permission.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePermission(permission.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {permission.displayName}
                          </div>
                          <div className="text-xs text-gray-500">{permission.name}</div>
                        </div>
                        {isSelected && (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Save Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionAssignment;

