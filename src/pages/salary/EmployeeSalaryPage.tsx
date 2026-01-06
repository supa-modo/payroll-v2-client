import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import Textarea from "../../components/ui/Textarea";
import api from "../../services/api";
import type {
  EmployeeSalary,
  SalaryComponent,
  AssignSalaryComponentsInput,
  CreateSalaryRevisionInput,
  SalaryRevisionHistory,
} from "../../types/salary";

const EmployeeSalaryPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [salary, setSalary] = useState<EmployeeSalary | null>(null);
  const [revisions, setRevisions] = useState<SalaryRevisionHistory[]>([]);
  const [availableComponents, setAvailableComponents] = useState<
    SalaryComponent[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRevisionFormOpen, setIsRevisionFormOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState<AssignSalaryComponentsInput>({
    components: [],
    effectiveFrom: new Date().toISOString().split("T")[0],
  });
  const [revisionData, setRevisionData] = useState<CreateSalaryRevisionInput>({
    effectiveFrom: new Date().toISOString().split("T")[0],
    reason: "",
    components: [],
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeSalary();
      fetchAvailableComponents();
    }
  }, [employeeId]);

  const fetchEmployeeSalary = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${employeeId}/salary`);
      setSalary(response.data);
    } catch (error: any) {
      console.error("Failed to fetch employee salary:", error);
      setError(
        error.response?.data?.error || "Failed to fetch employee salary"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableComponents = async () => {
    try {
      const response = await api.get("/salary-components");
      setAvailableComponents(response.data.components || []);
    } catch (error: any) {
      console.error("Failed to fetch salary components:", error);
    }
  };

  const fetchRevisionHistory = async () => {
    if (!employeeId) return;
    try {
      const response = await api.get(`/employees/${employeeId}/salary/history`);
      setRevisions(response.data.revisions || []);
      setShowHistory(true);
    } catch (error: any) {
      console.error("Failed to fetch revision history:", error);
    }
  };

  const handleAddComponent = () => {
    setFormData({
      components: [
        ...formData.components,
        {
          salaryComponentId: "",
          amount: 0,
          effectiveTo: null,
        },
      ],
      effectiveFrom: formData.effectiveFrom,
      reason: formData.reason,
    });
    setIsFormOpen(true);
  };

  const handleRemoveComponent = (index: number) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const updated = [...formData.components];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, components: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    if (formData.components.length === 0) {
      setError("At least one salary component is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post(`/employees/${employeeId}/salary`, formData);
      setIsFormOpen(false);
      fetchEmployeeSalary();
      setFormData({
        components: [],
        effectiveFrom: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to assign salary components"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisionComponentChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...(revisionData.components || [])];
    updated[index] = { ...updated[index], [field]: value };
    setRevisionData({ ...revisionData, components: updated });
  };

  const handleAddRevisionComponent = () => {
    setRevisionData({
      ...revisionData,
      components: [
        ...(revisionData.components || []),
        {
          salaryComponentId: "",
          amount: 0,
          effectiveTo: null,
        },
      ],
    });
  };

  const handleRemoveRevisionComponent = (index: number) => {
    setRevisionData({
      ...revisionData,
      components: (revisionData.components || []).filter((_, i) => i !== index),
    });
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    if (!revisionData.reason.trim()) {
      setError("Reason is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post(`/employees/${employeeId}/salary/revision`, revisionData);
      setIsRevisionFormOpen(false);
      fetchEmployeeSalary();
      fetchRevisionHistory();
      setRevisionData({
        effectiveFrom: new Date().toISOString().split("T")[0],
        reason: "",
        components: [],
      });
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to create salary revision"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading salary information...</div>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Employee salary information not found</p>
        <Button
          onClick={() => navigate("/employees")}
          variant="outline"
          className="mt-4"
        >
          Back to Employees
        </Button>
      </div>
    );
  }

  const earnings = salary.salaryComponents.filter(
    (esc) => esc.salaryComponent?.type === "earning"
  );
  const deductions = salary.salaryComponents.filter(
    (esc) => esc.salaryComponent?.type === "deduction"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/employees")}
            variant="outline"
            leftIcon={<FiArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {salary.employee.firstName} {salary.employee.lastName}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Employee Number: {salary.employee.employeeNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchRevisionHistory}
            variant="outline"
            leftIcon={<FiClock className="w-4 h-4" />}
          >
            View History
          </Button>
          <Button
            onClick={() => setIsRevisionFormOpen(true)}
            variant="outline"
            leftIcon={<FiEdit2 className="w-4 h-4" />}
          >
            Create Revision
          </Button>
          <Button
            onClick={handleAddComponent}
            leftIcon={<FiPlus className="w-4 h-4" />}
          >
            Add Component
          </Button>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Total Earnings
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(salary.totals.earnings)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-medium text-gray-600">
              Total Deductions
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(salary.totals.deductions)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Gross Pay</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(salary.totals.grossPay)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-medium text-gray-600">Net Pay</h3>
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(salary.totals.netPay)}
          </p>
        </div>
      </div>

      {/* Earnings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            Earnings
          </h2>
        </div>
        <div className="p-6">
          {earnings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No earnings configured
            </p>
          ) : (
            <div className="space-y-3">
              {earnings.map((esc) => (
                <div
                  key={esc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {esc.salaryComponent?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Effective:{" "}
                      {new Date(esc.effectiveFrom).toLocaleDateString()}
                      {esc.effectiveTo &&
                        ` - ${new Date(esc.effectiveTo).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(esc.amount.toString()))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deductions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiTrendingDown className="w-5 h-5 text-red-600" />
            Deductions
          </h2>
        </div>
        <div className="p-6">
          {deductions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No deductions configured
            </p>
          ) : (
            <div className="space-y-3">
              {deductions.map((esc) => (
                <div
                  key={esc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {esc.salaryComponent?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Effective:{" "}
                      {new Date(esc.effectiveFrom).toLocaleDateString()}
                      {esc.effectiveTo &&
                        ` - ${new Date(esc.effectiveTo).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(esc.amount.toString()))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Component Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="Assign Salary Components"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() =>
                    setFormData({
                      ...formData,
                      components: [
                        ...formData.components,
                        { salaryComponentId: "", amount: 0, effectiveTo: null },
                      ],
                    })
                  }
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
                      <FiTrash2 className="w-4 h-4" />
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
                Assign Components
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Revision History Modal */}
      {showHistory && (
        <Modal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title="Salary Revision History"
          size="lg"
        >
          <div className="space-y-4">
            {revisions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No revision history
              </p>
            ) : (
              <div className="space-y-3">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {new Date(revision.revisionDate).toLocaleDateString()}
                      </div>
                      {revision.changePercentage && (
                        <span
                          className={`text-sm font-medium ${
                            revision.changePercentage >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {revision.changePercentage >= 0 ? "+" : ""}
                          {revision.changePercentage.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Previous:</span>{" "}
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: "KES",
                          }).format(revision.previousGross || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">New:</span>{" "}
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: "KES",
                          }).format(revision.newGross)}
                        </span>
                      </div>
                    </div>
                    {revision.reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        {revision.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Revision Modal */}
      {isRevisionFormOpen && (
        <Modal
          isOpen={isRevisionFormOpen}
          onClose={() => setIsRevisionFormOpen(false)}
          title="Create Salary Revision"
          size="md"
        >
          <form onSubmit={handleCreateRevision} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <DateInput
              label="Effective From"
              name="effectiveFrom"
              value={revisionData.effectiveFrom}
              onChange={(e) =>
                setRevisionData({
                  ...revisionData,
                  effectiveFrom: e.target.value,
                })
              }
              required
            />

            <Textarea
              label="Reason"
              name="reason"
              value={revisionData.reason}
              onChange={(e) =>
                setRevisionData({ ...revisionData, reason: e.target.value })
              }
              rows={4}
              required
            />

            {/* Salary Components Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Salary Components (Optional)
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddRevisionComponent}
                >
                  Add Component
                </Button>
              </div>

              {(revisionData.components || []).map((comp, index) => (
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
                      onClick={() => handleRemoveRevisionComponent(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Select
                    label="Component"
                    value={comp.salaryComponentId}
                    onChange={(e) =>
                      handleRevisionComponentChange(
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
                  />

                  <Input
                    label="Amount"
                    name={`revision-amount-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={comp.amount.toString()}
                    onChange={(e) =>
                      handleRevisionComponentChange(
                        index,
                        "amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />

                  <DateInput
                    label="Effective To (Optional)"
                    name={`revision-effectiveTo-${index}`}
                    value={comp.effectiveTo || ""}
                    onChange={(e) =>
                      handleRevisionComponentChange(
                        index,
                        "effectiveTo",
                        e.target.value || null
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRevisionFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Revision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeSalaryPage;
