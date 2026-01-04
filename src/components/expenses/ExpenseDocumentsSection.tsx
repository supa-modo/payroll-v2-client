import React, { useState } from "react";
import { FiDownload, FiTrash2, FiFile } from "react-icons/fi";
import FileUpload from "../ui/FileUpload";
import api from "../../services/api";
import type { ExpenseDocument } from "../../types/expense";

interface ExpenseDocumentsSectionProps {
  expenseId: string;
  documents: ExpenseDocument[];
  onDocumentsChange: () => void;
  canEdit?: boolean;
}

const ExpenseDocumentsSection: React.FC<ExpenseDocumentsSectionProps> = ({
  expenseId,
  documents,
  onDocumentsChange,
  canEdit = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (file: File | File[] | null) => {
    if (!file || Array.isArray(file) || !canEdit) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "receipt");

      await api.post(`/expenses/${expenseId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onDocumentsChange();
    } catch (error: any) {
      setUploadError(error.response?.data?.error || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await api.get(`/expenses/${expenseId}/documents/${documentId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert("Failed to download document");
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${expenseId}/documents/${documentId}`);
      onDocumentsChange();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete document");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Documents & Receipts</h3>
        {canEdit && (
          <FileUpload
            label=""
            accept="image/*,.pdf"
            multiple={false}
            onChange={handleUpload}
            disabled={isUploading}
          />
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <FiFile className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <FiFile className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {doc.fileSize
                      ? `${(doc.fileSize / 1024).toFixed(2)} KB`
                      : "Unknown size"} • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseDocumentsSection;

