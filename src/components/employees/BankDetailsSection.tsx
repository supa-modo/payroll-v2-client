import React, { useState, useEffect } from "react";
import { FiCreditCard, FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import api from "../../services/api";
import type {
  EmployeeBankDetails,
  CreateBankDetailsInput,
} from "../../types/employeeExtension";

interface BankDetailsSectionProps {
  employeeId: string;
}

const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({ employeeId }) => {
  const [bankDetails, setBankDetails] = useState<EmployeeBankDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBankDetails, setEditingBankDetails] = useState<EmployeeBankDetails | null>(null);
  const [formData, setFormData] = useState<CreateBankDetailsInput>({
    paymentMethod: "bank",
    isPrimary: false,
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
    mpesaPhone: "",
    mpesaName: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchBankDetails();
    }
  }, [employeeId]);

  const fetchBankDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${employeeId}/bank-details`);
      setBankDetails(response.data.bankDetails || []);
    } catch (error: any) {
      console.error("Failed to fetch bank details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBankDetails(null);
    setFormData({
      paymentMethod: "bank",
      isPrimary: false,
      bankName: "",
      bankBranch: "",
      accountNumber: "",
      accountName: "",
      swiftCode: "",
      mpesaPhone: "",
      mpesaName: "",
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleEdit = (details: EmployeeBankDetails) => {
    setEditingBankDetails(details);
    setFormData({
      paymentMethod: details.paymentMethod,
      isPrimary: details.isPrimary,
      bankName: details.bankName || "",
      bankBranch: details.bankBranch || "",
      accountNumber: details.accountNumber || "",
      accountName: details.accountName || "",
      swiftCode: details.swiftCode || "",
      mpesaPhone: details.mpesaPhone || "",
      mpesaName: details.mpesaName || "",
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingBankDetails) {
        await api.put(
          `/employees/${employeeId}/bank-details/${editingBankDetails.id}`,
          formData
        );
      } else {
        await api.post(`/employees/${employeeId}/bank-details`, formData);
      }
      setIsFormOpen(false);
      fetchBankDetails();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save bank details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete these bank details?")) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}/bank-details/${id}`);
      fetchBankDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete bank details");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.post(`/employees/${employeeId}/bank-details/${id}/set-primary`);
      fetchBankDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to set primary bank details");
    }
  };

  const paymentMethodOptions = [
    { value: "bank", label: "Bank Transfer" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "cash", label: "Cash" },
  ];

  if (isLoading) {
    return <div className="text-gray-500">Loading bank details...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiCreditCard className="w-5 h-5 text-primary-600" />
          Bank Details
        </h3>
        <Button
          onClick={handleCreate}
          size="sm"
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Add Bank Details
        </Button>
      </div>

      {bankDetails.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No bank details added yet</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4">
            Add Bank Details
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bankDetails.map((details) => (
            <div
              key={details.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {details.paymentMethod}
                    </span>
                    {details.isPrimary && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <FiCheck className="w-3 h-3" />
                        Primary
                      </span>
                    )}
                  </div>

                  {details.paymentMethod === "bank" && (
                    <div className="space-y-1 text-sm text-gray-600">
                      {details.bankName && (
                        <div>
                          <span className="font-medium">Bank:</span> {details.bankName}
                        </div>
                      )}
                      {details.accountName && (
                        <div>
                          <span className="font-medium">Account Name:</span> {details.accountName}
                        </div>
                      )}
                      {details.accountNumber && (
                        <div>
                          <span className="font-medium">Account Number:</span> {details.accountNumber}
                        </div>
                      )}
                    </div>
                  )}

                  {details.paymentMethod === "mpesa" && (
                    <div className="space-y-1 text-sm text-gray-600">
                      {details.mpesaPhone && (
                        <div>
                          <span className="font-medium">Phone:</span> {details.mpesaPhone}
                        </div>
                      )}
                      {details.mpesaName && (
                        <div>
                          <span className="font-medium">Name:</span> {details.mpesaName}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!details.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(details.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(details)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(details.id)}
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
          title={editingBankDetails ? "Edit Bank Details" : "Add Bank Details"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value as any })
              }
              options={paymentMethodOptions}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) =>
                  setFormData({ ...formData, isPrimary: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isPrimary" className="text-sm text-gray-700">
                Set as primary payment method
              </label>
            </div>

            {formData.paymentMethod === "bank" && (
              <>
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
                <Input
                  label="Bank Branch"
                  value={formData.bankBranch}
                  onChange={(e) =>
                    setFormData({ ...formData, bankBranch: e.target.value })
                  }
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
                <Input
                  label="Account Name"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                />
                <Input
                  label="SWIFT Code"
                  value={formData.swiftCode}
                  onChange={(e) =>
                    setFormData({ ...formData, swiftCode: e.target.value })
                  }
                />
              </>
            )}

            {formData.paymentMethod === "mpesa" && (
              <>
                <Input
                  label="M-Pesa Phone Number"
                  value={formData.mpesaPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, mpesaPhone: e.target.value })
                  }
                  type="tel"
                />
                <Input
                  label="M-Pesa Name"
                  value={formData.mpesaName}
                  onChange={(e) =>
                    setFormData({ ...formData, mpesaName: e.target.value })
                  }
                />
              </>
            )}

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
                {editingBankDetails ? "Update" : "Add"} Bank Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BankDetailsSection;

