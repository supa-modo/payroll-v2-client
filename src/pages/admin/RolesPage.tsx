import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiKey } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import PermissionAssignment from "../../components/admin/PermissionAssignment";
import api from "../../services/api";
import type { Role, CreateRoleInput } from "../../types/role";

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: "",
    displayName: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/roles");
      setRoles(response.data.roles || []);
    } catch (error: any) {
      console.error("Failed to fetch roles:", error);
      setError(error.response?.data?.error || "Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData);
      } else {
        await api.post("/roles", formData);
      }
      setIsFormOpen(false);
      fetchRoles();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await api.delete(`/roles/${id}`);
      fetchRoles();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus className="w-4 h-4" />}>
          Add Role
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            {
              header: "Role",
              cell: (role: Role) => (
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-primary-600" />
                    {role.displayName}
                    {role.isSystemRole && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        System
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{role.name}</div>
                </div>
              ),
            },
            {
              header: "Description",
              cell: (role: Role) => (
                <span className="text-gray-600">
                  {role.description || "No description"}
                </span>
              ),
            },
            {
              header: "Permissions",
              cell: (role: Role) => (
                <span className="text-sm text-gray-600">
                  {role.permissions?.length || 0} permissions
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (role: Role) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setPermissionModalOpen(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Manage permissions"
                  >
                    <FiKey className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit role"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  {!role.isSystemRole && (
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete role"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={roles}
          totalItems={roles.length}
          startIndex={1}
          endIndex={roles.length}
          currentPage={1}
          totalPages={1}
          tableLoading={isLoading}
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingRole ? "Edit Role" : "New Role"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Role Name (Code)"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={!!editingRole}
              helperText="Unique identifier for the role (e.g., 'hr_manager')"
            />

            <Input
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {permissionModalOpen && selectedRole && (
        <PermissionAssignment
          role={selectedRole}
          onClose={() => {
            setPermissionModalOpen(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            fetchRoles();
          }}
        />
      )}
    </div>
  );
};

export default RolesPage;

