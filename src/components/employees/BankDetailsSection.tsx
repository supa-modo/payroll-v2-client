import React, { useState, useEffect } from "react";
import { FiPlus, FiCheck } from "react-icons/fi";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import api from "../../services/api";
import type {
  EmployeeBankDetails,
  CreateBankDetailsInput,
} from "../../types/employeeExtension";
import ToggleSwitch from "../ui/ToggleSwitch";
import { TbAlertTriangle, TbEdit, TbTrash } from "react-icons/tb";

interface BankDetailsSectionProps {
  employeeId: string;
}

/** Form state always has explicit boolean primary flag (API type has optional isPrimary). */
type BankDetailsFormState = CreateBankDetailsInput & { isPrimary: boolean };

const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({ employeeId }) => {
  const [bankDetails, setBankDetails] = useState<EmployeeBankDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBankDetails, setEditingBankDetails] = useState<EmployeeBankDetails | null>(null);
  const [formData, setFormData] = useState<BankDetailsFormState>({
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
        <p className="text-sm text-slate-400">Payment methods for payroll processing</p>
        <Button
          onClick={handleCreate}
          size="sm"
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Add Payment Method
        </Button>
      </div>

      {bankDetails.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-2xl mb-2 border border-gray-200">
          <TbAlertTriangle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-[0.9rem]">No bank details added yet</p>
          <button className="mt-6 hover:cursor-pointer text-primary-600 hover:text-primary-700 text-sm underline underline-offset-4" onClick={handleCreate} title="Add payment method">
            Click here to add payment method
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-2">
          {bankDetails.map((details) => (
            <div
              key={details.id}
              className="p-4 font-source bg-white rounded-2xl border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-[0.95rem] font-bold text-gray-900 capitalize">
                      {details.paymentMethod} {details.paymentMethod === "bank" ? "Account" : "Payment"}
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
                      className="flex items-center gap-1 px-2 py-1 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <FiCheck className="w-4 h-4" /> <span className="text-xs">Set Primary</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(details)}
                    className="flex items-center gap-1 px-2 py-1 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <TbEdit className="w-4 h-4" /> <span className="text-xs">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(details.id)}
                    className="flex items-center gap-1 px-2 py-1 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TbTrash className="w-4 h-4" /> <span className="text-xs">Delete</span>
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
          title={editingBankDetails ? "Edit Payment Method" : "Add Payment Method"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-end gap-4">
              <Select
                label="Payment Method"
                labelClassName="text-sm"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value as any })
                }
                options={paymentMethodOptions}
                required
                className="text-sm"
              />

              <div className="flex items-center gap-2 mb-2">
                <ToggleSwitch
                  title="Primary"
                  checked={formData.isPrimary ?? false}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      isPrimary: !(formData.isPrimary ?? false),
                    })
                  }
                />

                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Primary
                </label>
              </div>
            </div>



            {formData.paymentMethod === "bank" && (
              <>
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  className="text-sm"
                />

                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  className="text-sm"
                />
                <Input
                  label="Account Name"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-3.5">
                  <Input
                    label="Bank Branch"
                    value={formData.bankBranch}
                    onChange={(e) =>
                      setFormData({ ...formData, bankBranch: e.target.value })
                    }
                    className="text-sm"
                  />
                  <Input
                    label="SWIFT Code"
                    value={formData.swiftCode}
                    onChange={(e) =>
                      setFormData({ ...formData, swiftCode: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
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
                  className="text-sm"
                />
                <Input
                  label="M-Pesa Name"
                  value={formData.mpesaName}
                  onChange={(e) =>
                    setFormData({ ...formData, mpesaName: e.target.value })
                  }
                  className="text-sm"
                />
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="text-sm w-full"
              >
                Cancel
              </Button> */}
              <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-sm w-full">
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

