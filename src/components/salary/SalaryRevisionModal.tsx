/**
 * Premium Salary Revision Modal
 * Slide-in modal for editing employee salary components with full CRUD operations
 */

import React, { useState, useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import {
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { TbReceipt } from "react-icons/tb";
import api from "../../services/api";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import type {
  EmployeeSalary,
  SalaryComponent,
  EmployeeSalaryComponent,
} from "../../types/salary";

interface SalaryRevisionModalProps {
  isOpen: boolean;
  employeeId: string;
  employee: { firstName: string; lastName: string; employeeNumber: string };
  currentSalary: EmployeeSalary;
  onClose: () => void;
  onSuccess: () => void;
}

const SalaryRevisionModal: React.FC<SalaryRevisionModalProps> = ({
  isOpen,
  employeeId,
  employee,
  currentSalary,
  onClose,
  onSuccess,
}) => {
  const [availableComponents, setAvailableComponents] = useState<
    SalaryComponent[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Revision form data
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");

  // Component management
  const [components, setComponents] = useState<
    Array<{
      id?: string;
      salaryComponentId: string;
      amount: number;
      effectiveTo: string | null;
      isNew: boolean;
      isDeleted: boolean;
      componentName?: string;
      componentType?: string;
    }>
  >([]);

  // Store original values for comparison
  const [originalComponents, setOriginalComponents] = useState<
    Array<{ id: string; amount: number; effectiveTo: string | null }>
  >([]);
  const [previousGross, setPreviousGross] = useState<number>(0);

  // Fetch available salary components
  useEffect(() => {
    if (isOpen) {
      fetchAvailableComponents();
      initializeForm();
    }
  }, [isOpen, currentSalary]);

  const fetchAvailableComponents = async () => {
    try {
      const response = await api.get("/salary-components");
      setAvailableComponents(response.data.components || []);
    } catch (error: any) {
      console.error("Failed to fetch salary components:", error);
    }
  };

  const initializeForm = () => {
    if (!currentSalary) return;

    // Initialize with current components - ensure amounts are numbers and salaryComponentId is set
    const currentComps = currentSalary.salaryComponents.map((esc) => {
      const amount = parseFloat(esc.amount.toString()) || 0;
      // CRITICAL: Ensure salaryComponentId is always set - this was causing the filter to exclude all components
      if (!esc.salaryComponentId) {
        console.error("Missing salaryComponentId for component:", esc);
      }
      return {
        id: esc.id,
        salaryComponentId: esc.salaryComponentId || "", // Ensure it's always a string
        amount: amount, // Ensure it's a number
        effectiveTo: esc.effectiveTo || null,
        isNew: false,
        isDeleted: false,
        componentName: esc.salaryComponent?.name || "Unknown Component",
        componentType: esc.salaryComponent?.type || "earning",
      };
    });

    setComponents(currentComps);

    // Store original values - ensure amounts are numbers for reliable comparison
    const originals = currentSalary.salaryComponents.map((esc) => {
      const amount = parseFloat(esc.amount.toString()) || 0;
      return {
        id: esc.id,
        amount: amount, // Store as number
        effectiveTo: esc.effectiveTo || null,
      };
    });
    setOriginalComponents(originals);
    setPreviousGross(currentSalary.totals.grossPay);

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log("Form initialized with components:", {
        componentCount: currentComps.length,
        originalCount: originals.length,
        components: currentComps.map((c) => ({
          id: c.id,
          amount: c.amount,
          type: typeof c.amount,
        })),
        originals: originals.map((o) => ({
          id: o.id,
          amount: o.amount,
          type: typeof o.amount,
        })),
      });
    }
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        salaryComponentId: "",
        amount: 0,
        effectiveTo: null,
        isNew: true,
        isDeleted: false,
      },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    const updated = [...components];
    const component = updated[index];

    if (component.id && !component.isNew) {
      // Mark as deleted
      updated[index] = { ...component, isDeleted: true };
    } else {
      // Remove new component
      updated.splice(index, 1);
    }

    setComponents(updated);
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const updated = [...components];
    if (field === "amount") {
      // Ensure amount is always stored as a number
      const numValue = parseFloat(value?.toString() || "0") || 0;
      updated[index] = {
        ...updated[index],
        [field]: numValue,
      };
    } else if (field === "effectiveTo") {
      updated[index] = {
        ...updated[index],
        [field]: value || null,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setComponents(updated);
  };

  // Calculate current gross from non-deleted earning components
  const calculateCurrentGross = (): number => {
    return components
      .filter((comp) => !comp.isDeleted)
      .reduce((sum, comp) => {
        const component = availableComponents.find(
          (c) => c.id === comp.salaryComponentId
        );
        if (component && component.type === "earning") {
          return sum + (comp.amount || 0);
        }
        return sum;
      }, 0);
  };

  // Calculate change percentage
  const calculateChangePercentage = (): number | null => {
    const currentGross = calculateCurrentGross();
    if (previousGross > 0) {
      return ((currentGross - previousGross) / previousGross) * 100;
    }
    return currentGross > 0 ? 100 : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }

    // SIMPLE CRUD: Categorize changes by comparing current state with original
    // 1. Find deleted components (marked as deleted and have an id)
    const deletedComponentIds = components
      .filter((comp) => comp.isDeleted && comp.id)
      .map((comp) => comp.id!);

    // 2. Find new components (isNew flag and not deleted)
    const newComponents = components.filter(
      (comp) => comp.isNew && !comp.isDeleted
    );

    // 3. Find modified components (existing components that changed)
    const modifiedComponents = components.filter((comp) => {
      // Skip new or deleted components
      if (comp.isNew || comp.isDeleted || !comp.id) return false;

      // Find original component
      const original = originalComponents.find((orig) => orig.id === comp.id);
      if (!original) return false;

      // Simple comparison: check if amount or effectiveTo changed
      const amountChanged = Number(original.amount) !== Number(comp.amount);
      const effectiveToChanged =
        (original.effectiveTo || null) !== (comp.effectiveTo || null);

      return amountChanged || effectiveToChanged;
    });

    // Filter active components for validation (must have salaryComponentId and valid amount)
    const activeComponents = components.filter(
      (comp) =>
        !comp.isDeleted &&
        comp.salaryComponentId &&
        comp.salaryComponentId.trim() !== "" &&
        comp.amount >= 0
    );

    // Check if there are any changes
    const hasChanges =
      deletedComponentIds.length > 0 ||
      newComponents.length > 0 ||
      modifiedComponents.length > 0;

    if (!hasChanges) {
      setError(
        "Please make at least one change: add a new component, modify an amount, or remove a component."
      );
      return;
    }

    // Validate
    const invalidComponents = activeComponents.filter(
      (comp) => !comp.salaryComponentId || comp.amount < 0
    );
    if (invalidComponents.length > 0) {
      setError(
        "Please ensure all components have a valid component selected and amount"
      );
      return;
    }

    // Prepare submission data
    const submissionData = {
      effectiveFrom,
      reason,
      modifiedComponents: modifiedComponents.map((comp) => ({
        id: comp.id!,
        amount: Number(comp.amount),
        effectiveTo: comp.effectiveTo || null,
      })),
      newComponents: newComponents.map((comp) => ({
        salaryComponentId: comp.salaryComponentId,
        amount: Number(comp.amount),
        effectiveTo: comp.effectiveTo || null,
      })),
      deletedComponentIds,
    };

    setLoading(true);
    try {
      await api.post(
        `/employees/${employeeId}/salary/revision`,
        submissionData
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to create salary revision:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to create salary revision"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentGross = calculateCurrentGross();
  const changePercentage = calculateChangePercentage();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-end z-50 p-3 font-lexend"
      onClick={handleBackdropClick}
    >
      <div
        className="w-[900px] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 md:px-6 pt-4 relative border-b border-gray-200">
          <div className="relative flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center z-10 pb-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-linear-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg shrink-0">
                <TbReceipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-5">
                <h2 className="text-gray-900 font-semibold text-base sm:text-xl">
                  Salary Revision
                </h2>
                <div className="h-4 w-px bg-gray-400 rounded-full" />
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-red-500 hover:text-red-600 transition-colors rounded-full p-1 hover:bg-red-100 shrink-0"
              title="Close"
              disabled={loading}
            >
              <FaXmark size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-4 md:px-6 py-5 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Employee Info Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-3">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm font-semibold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Employee Number</p>
                <p className="text-sm font-mono font-semibold text-slate-900">
                  {employee.employeeNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Current Salary Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-3">
              Current Salary Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Gross Pay</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(currentSalary.totals.grossPay)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Net Pay</p>
                <p className="text-lg font-semibold text-primary-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(currentSalary.totals.netPay)}
                </p>
              </div>
            </div>
          </div>

          {/* Revision Form */}
          <div className="space-y-4">
            <DateInput
              label="Effective From"
              name="effectiveFrom"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
            />

            <Textarea
              label="Reason for Revision"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Components Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Salary Components
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Edit amounts, add new components, or remove existing ones
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddComponent}
                leftIcon={<FiPlus className="w-4 h-4" />}
              >
                Add Component
              </Button>
            </div>

            {/* Components List */}
            {components
              .filter((comp) => !comp.isDeleted)
              .map((comp, index) => {
                const actualIndex = components.findIndex((c) => c === comp);
                const component = availableComponents.find(
                  (c) => c.id === comp.salaryComponentId
                );
                const isExisting = comp.id && !comp.isNew;
                // Simple visual indicator: check if component values changed from original
                const original = originalComponents.find(
                  (o) => o.id === comp.id
                );
                const isModified =
                  isExisting &&
                  original &&
                  (Number(original.amount) !== Number(comp.amount) ||
                    (original.effectiveTo || null) !==
                      (comp.effectiveTo || null));

                return (
                  <div
                    key={comp.id || `new-${index}`}
                    className={`p-4 border-2 rounded-lg space-y-3 ${
                      isModified
                        ? "border-blue-400 bg-blue-50"
                        : comp.isNew
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {isExisting ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-base font-semibold text-gray-900">
                                {component?.name || comp.componentName}
                              </h4>
                              {isModified && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  Modified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                Existing
                              </span>
                              {component && (
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${
                                    component.type === "earning"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {component.type === "earning"
                                    ? "Earning"
                                    : "Deduction"}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-base font-semibold text-blue-900 mb-2">
                              New Component
                            </h4>
                            <Select
                              label="Select Component"
                              value={comp.salaryComponentId || ""}
                              onChange={(e) =>
                                handleComponentChange(
                                  actualIndex,
                                  "salaryComponentId",
                                  e.target.value
                                )
                              }
                              options={[
                                { value: "", label: "Choose a component..." },
                                ...availableComponents
                                  .filter((c) => c.isActive)
                                  .map((c) => ({
                                    value: c.id,
                                    label: `${c.name} (${c.type})`,
                                  })),
                              ]}
                              required
                            />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(actualIndex)}
                        className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        label="Amount"
                        name={`amount-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={comp.amount.toString()}
                        onChange={(e) =>
                          handleComponentChange(
                            actualIndex,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                        className="text-lg"
                      />

                      <DateInput
                        label="Effective To (Optional)"
                        name={`effectiveTo-${index}`}
                        value={comp.effectiveTo || ""}
                        onChange={(e) =>
                          handleComponentChange(
                            actualIndex,
                            "effectiveTo",
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Revision Summary */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">
              Revision Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Previous Gross</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(previousGross)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">New Gross</p>
                <p className="text-lg font-semibold text-primary-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(currentGross)}
                </p>
              </div>
            </div>
            {changePercentage !== null && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Change:</span>
                <span
                  className={`ml-2 text-sm font-medium ${
                    changePercentage >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {changePercentage >= 0 ? "+" : ""}
                  {changePercentage.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            onClick={handleSubmit}
          >
            Create Revision
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SalaryRevisionModal;
