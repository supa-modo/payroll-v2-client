export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
  
  // Relations
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    jobTitle: string;
    photoUrl?: string;
  };
  parentDepartment?: {
    id: string;
    name: string;
    code?: string;
  };
  employees?: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentInput {
  name: string;
  code?: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {}

