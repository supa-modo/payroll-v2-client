/**
 * Add Salary Component Modal
 * Simple modal for adding new salary components to an employee
 */

import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import api from "../../services/api";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import type { SalaryComponent, AssignSalaryComponentsInput } from "../../types/salary";

interface AddSalaryComponentModalProps {
  isOpen: boolean;
  employeeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSalaryComponentModal: React.FC<AddSalaryComponentModalProps> = ({
  isOpen,
  employeeId,
  onClose,
  onSuccess,
}) => {
  const [availableComponents, setAvailableComponents] = useState<
    SalaryComponent[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<AssignSalaryComponentsInput>({
    components: [],
    effectiveFrom: new Date().toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchAvailableComponents();
      // Reset form
      setFormData({
        components: [],
        effectiveFrom: new Date().toISOString().split("T")[0],
        reason: "",
      });
      setError("");
    }
  }, [isOpen]);

  const fetchAvailableComponents = async () => {
    try {
      const response = await api.get("/salary-components");
      setAvailableComponents(response.data.components || []);
    } catch (error: any) {
      console.error("Failed to fetch salary components:", error);
    }
  };

  const handleAddComponent = () => {
    setFormData({
      ...formData,
      components: [
        ...formData.components,
        {
          salaryComponentId: "",
          amount: 0,
          effectiveTo: null,
        },
      ],
    });
  };

  const handleRemoveComponent = (index: number) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const updated = [...formData.components];
    if (field === "amount") {
      updated[index] = {
        ...updated[index],
        [field]: parseFloat(value?.toString() || "0") || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormData({ ...formData, components: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.components.length === 0) {
      setError("At least one salary component is required");
      return;
    }

    // Validate all components
    const invalidComponents = formData.components.filter(
      (comp) => !comp.salaryComponentId || comp.amount < 0
    );
    if (invalidComponents.length > 0) {
      setError(
        "Please ensure all components have a valid component selected and amount"
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(`/employees/${employeeId}/salary`, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to assign salary components:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to assign salary components"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Add Salary Components
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <DateInput
            label="Effective From"
            name="effectiveFrom"
            value={formData.effectiveFrom}
            onChange={(e) =>
              setFormData({ ...formData, effectiveFrom: e.target.value })
            }
            required
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Salary Components
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddComponent}
              >
                Add Component
              </Button>
            </div>

            {formData.components.map((comp, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Component {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <Select
                  label="Component"
                  value={comp.salaryComponentId}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "salaryComponentId",
                      e.target.value
                    )
                  }
                  options={[
                    { value: "", label: "Select component" },
                    ...availableComponents
                      .filter((c) => c.isActive)
                      .map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.type})`,
                      })),
                  ]}
                  required
                />

                <Input
                  label="Amount"
                  name={`amount-${index}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={comp.amount.toString()}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                />

                <DateInput
                  label="Effective To (Optional)"
                  name={`effectiveTo-${index}`}
                  value={comp.effectiveTo || ""}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "effectiveTo",
                      e.target.value || null
                    )
                  }
                />
              </div>
            ))}
          </div>

          <Textarea
            label="Reason (Optional)"
            name="reason"
            value={formData.reason || ""}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            rows={3}
          />
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} onClick={handleSubmit}>
            Add Components
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddSalaryComponentModal;

