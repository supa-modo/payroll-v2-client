export type EmploymentType = "permanent" | "contract" | "casual" | "intern";
export type EmployeeStatus = "active" | "probation" | "suspended" | "terminated" | "resigned";

export interface Employee {
  id: string;
  tenantId: string;
  userId?: string;
  departmentId?: string;
  employeeNumber: string;
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  photoUrl?: string;
  
  // Contact Information
  personalEmail?: string;
  workEmail?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  country?: string;
  
  // Identification
  nationalId?: string;
  passportNumber?: string;
  kraPin?: string;
  nssfNumber?: string;
  nhifNumber?: string;
  
  // Employment Details
  employmentType: EmploymentType;
  jobTitle: string;
  jobGrade?: string;
  hireDate: string;
  probationEndDate?: string;
  contractEndDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  status: EmployeeStatus;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Relations
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  employeeNumber?: string; // Optional - will be auto-generated if not provided
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  photoUrl?: string;
  personalEmail?: string;
  workEmail?: string;
  email?: string; // Backward compatibility - maps to workEmail
  phonePrimary?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  country?: string;
  nationalId?: string;
  passportNumber?: string;
  kraPin?: string;
  nssfNumber?: string;
  nhifNumber?: string;
  departmentId?: string;
  jobTitle: string;
  jobGrade?: string;
  employmentType: EmploymentType;
  hireDate: string;
  probationEndDate?: string;
  contractEndDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // User account creation fields (always required now)
  roleId: string;
  userPassword: string;
  // Bank details (optional array)
  bankDetails?: BankDetailInput[];
  // Documents metadata (optional array, files sent separately)
  documentsMetadata?: DocumentMetadataInput[];
  // Photo file (sent separately in multipart/form-data)
  photoFile?: File;
  // Document files (sent separately in multipart/form-data)
  documentFiles?: File[];
}

export interface BankDetailInput {
  paymentMethod: "bank" | "mpesa" | "cash";
  isPrimary?: boolean;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountName?: string;
  swiftCode?: string;
  mpesaPhone?: string;
  mpesaName?: string;
}

export interface DocumentMetadataInput {
  documentType: string;
  documentName: string;
  expiryDate?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  status?: EmployeeStatus;
  terminationDate?: string;
  terminationReason?: string;
}

