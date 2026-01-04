export interface Role {
  id: string;
  tenantId?: string | null;
  name: string;
  displayName: string;
  description?: string | null;
  isSystemRole: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  category: string;
  createdAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  departmentId?: string | null;
  assignedAt: string;
  assignedBy?: string | null;
  role?: Role;
  department?: {
    id: string;
    name: string;
  };
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {}

export interface AssignPermissionsInput {
  permissionIds: string[];
}

export interface AssignRoleInput {
  roleId: string;
  departmentId?: string;
}

