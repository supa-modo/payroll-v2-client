/**
 * Mark Remittance as Remitted Modal
 */

import { useState } from "react";
import { FiX } from "react-icons/fi";
import Button from "../ui/Button";

interface MarkRemittedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remittanceReference: string, notes?: string) => Promise<void>;
  remittance: {
    id: string;
    taxType: string;
    amount: number;
    periodName?: string;
  } | null;
  isLoading?: boolean;
}

export default function MarkRemittedModal({
  isOpen,
  onClose,
  onConfirm,
  remittance,
  isLoading = false,
}: MarkRemittedModalProps) {
  const [remittanceReference, setRemittanceReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !remittance) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!remittanceReference.trim()) {
      setError("Remittance reference is required");
      return;
    }

    try {
      await onConfirm(remittanceReference.trim(), notes.trim() || undefined);
      setRemittanceReference("");
      setNotes("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to mark as remitted");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Mark as Remitted
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Tax Type:</span> {remittance.taxType}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Amount:</span>{" "}
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(remittance.amount)}
                </p>
                {remittance.periodName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Period:</span>{" "}
                    {remittance.periodName}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="reference"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Remittance Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reference"
                  value={remittanceReference}
                  onChange={(e) => setRemittanceReference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter payment reference number"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the reference number from the payment receipt
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Add any additional notes..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                disabled={isLoading || !remittanceReference.trim()}
                className="w-full sm:w-auto sm:ml-3"
              >
                {isLoading ? "Processing..." : "Mark as Remitted"}
              </Button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 w-full sm:mt-0 sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
