import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import api from "../../services/api";
import SalaryRevisionModal from "../../components/salary/SalaryRevisionModal";
import AddSalaryComponentModal from "../../components/salary/AddSalaryComponentModal";
import type { EmployeeSalary, SalaryRevisionHistory } from "../../types/salary";

const EmployeeSalaryPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [salary, setSalary] = useState<EmployeeSalary | null>(null);
  const [revisions, setRevisions] = useState<SalaryRevisionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRevisionFormOpen, setIsRevisionFormOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeSalary();
    }
  }, [employeeId]);

  const fetchEmployeeSalary = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${employeeId}/salary`);

      if (response.data) {
        setSalary(response.data);

        // Validate that totals match displayed components
        const displayedComponents = response.data.salaryComponents || [];
        const calculatedEarnings = displayedComponents
          .filter((esc: any) => esc.salaryComponent?.type === "earning")
          .reduce(
            (sum: number, esc: any) => sum + parseFloat(esc.amount || 0),
            0
          );
        const calculatedDeductions = displayedComponents
          .filter((esc: any) => esc.salaryComponent?.type === "deduction")
          .reduce(
            (sum: number, esc: any) => sum + parseFloat(esc.amount || 0),
            0
          );

        const totals = response.data.totals || {};
        const earningsMatch =
          Math.abs(calculatedEarnings - (totals.earnings || 0)) < 0.01;
        const deductionsMatch =
          Math.abs(calculatedDeductions - (totals.deductions || 0)) < 0.01;

        if (!earningsMatch || !deductionsMatch) {
          console.warn("Salary totals mismatch detected:", {
            calculatedEarnings,
            serverEarnings: totals.earnings,
            calculatedDeductions,
            serverDeductions: totals.deductions,
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch employee salary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmployeeSalary();
    fetchRevisionHistory();
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
    setIsFormOpen(true);
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
      {employeeId && (
        <AddSalaryComponentModal
          isOpen={isFormOpen}
          employeeId={employeeId}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleRefresh}
        />
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
                      {revision.changePercentage != null && (
                        <span
                          className={`text-sm font-medium ${
                            Number(revision.changePercentage) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Number(revision.changePercentage) >= 0 ? "+" : ""}
                          {Number(revision.changePercentage).toFixed(2)}%
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
                          }).format(Number(revision.previousGross) || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">New:</span>{" "}
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: "KES",
                          }).format(Number(revision.newGross) || 0)}
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

      {/* Salary Revision Modal */}
      {employeeId && salary && (
        <SalaryRevisionModal
          isOpen={isRevisionFormOpen}
          employeeId={employeeId}
          employee={salary.employee}
          currentSalary={salary}
          onClose={() => setIsRevisionFormOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default EmployeeSalaryPage;
