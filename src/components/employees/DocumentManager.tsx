import React, { useState, useEffect } from "react";
import {
  FiFile,
  FiUpload,
  FiDownload,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import DateInput from "../ui/DateInput";
import Select from "../ui/Select";
import FileUpload from "../ui/FileUpload";
import Button from "../ui/Button";
import api from "../../services/api";
import type { EmployeeDocument, CreateDocumentInput } from "../../types/employeeExtension";

interface DocumentManagerProps {
  employeeId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ employeeId }) => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDocumentInput>({
    documentType: "other",
    documentName: "",
    expiryDate: "",
    file: null as File | null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${employeeId}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = () => {
    setFormData({
      documentType: "other",
      documentName: "",
      expiryDate: "",
      file: null,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.file) {
      setError("Please select a file to upload");
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("document", formData.file);
      uploadData.append("documentType", formData.documentType || "other");
      if (formData.documentName) {
        uploadData.append("documentName", formData.documentName);
      }
      if (formData.expiryDate) {
        uploadData.append("expiryDate", formData.expiryDate);
      }

      await api.post(`/employees/${employeeId}/documents`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsFormOpen(false);
      fetchDocuments();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const response = await api.get(
        `/employees/${employeeId}/documents/${doc.id}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.documentName);
      window.document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to download document");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}/documents/${id}`);
      fetchDocuments();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete document");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.post(`/employees/${employeeId}/documents/${id}/verify`);
      fetchDocuments();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to verify document");
    }
  };

  const documentTypeOptions = [
    { value: "contract", label: "Employment Contract" },
    { value: "id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "certificate", label: "Certificate" },
    { value: "other", label: "Other" },
  ];

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiFile className="w-5 h-5 text-primary-600" />
          Documents
        </h3>
        <Button
          onClick={handleUpload}
          size="sm"
          leftIcon={<FiUpload className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No documents uploaded yet</p>
          <Button onClick={handleUpload} variant="outline" className="mt-4">
            Upload Document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFile className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {document.documentName}
                    </span>
                    {document.isVerified ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <FiCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      <span className="capitalize">{document.documentType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {formatFileSize(document.fileSize)}
                    </div>
                    {document.expiryDate && (
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(document.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Uploaded:</span>{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  {!document.isVerified && (
                    <button
                      onClick={() => handleVerify(document.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Verify"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="Upload Document"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <FileUpload
              label="Document File"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
              value={formData.file}
              onChange={(file) => setFormData({ ...formData, file: file as File | null })}
              required
            />

            <Select
              label="Document Type"
              value={formData.documentType}
              onChange={(e) =>
                setFormData({ ...formData, documentType: e.target.value })
              }
              options={documentTypeOptions}
            />

            <Input
              label="Document Name"
              value={formData.documentName}
              onChange={(e) =>
                setFormData({ ...formData, documentName: e.target.value })
              }
              helperText="Leave empty to use file name"
            />

            <DateInput
              label="Expiry Date (Optional)"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
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
                Upload Document
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DocumentManager;

