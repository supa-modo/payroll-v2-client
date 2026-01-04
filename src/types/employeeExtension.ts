export interface EmployeeBankDetails {
  id: string;
  employeeId: string;
  paymentMethod: "bank" | "mpesa" | "cash";
  isPrimary: boolean;
  bankName?: string | null;
  bankBranch?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  swiftCode?: string | null;
  mpesaPhone?: string | null;
  mpesaName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: string;
  documentName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
  expiryDate?: string | null;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface CreateBankDetailsInput {
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

export interface CreateDocumentInput {
  documentType?: string;
  documentName?: string;
  expiryDate?: string;
  file: File | null;
}

