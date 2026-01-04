import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiLock,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
} from "react-icons/fi";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import api from "../../services/api";
import type { PayrollSummary } from "../../types/payroll";

const ReviewPayrollPage: React.FC = () => {
  const { periodId } = useParams<{ periodId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (periodId) {
      fetchSummary();
    }
  }, [periodId]);

  const fetchSummary = async () => {
    if (!periodId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/payroll-periods/${periodId}/summary`);
      setSummary(response.data);
    } catch (error: any) {
      console.error("Failed to fetch payroll summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!periodId) return;
    if (!window.confirm("Are you sure you want to approve this payroll period?")) {
      return;
    }

    try {
      setIsProcessing(true);
      await api.post(`/payroll-periods/${periodId}/approve`);
      fetchSummary();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to approve payroll period");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLock = async () => {
    if (!periodId) return;
    if (!window.confirm("Are you sure you want to lock this payroll period? This action cannot be undone.")) {
      return;
    }

    try {
      setIsProcessing(true);
      await api.post(`/payroll-periods/${periodId}/lock`);
      fetchSummary();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to lock payroll period");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!periodId) return;
    if (!window.confirm("Are you sure you want to process this payroll period?")) {
      return;
    }

    try {
      setIsProcessing(true);
      await api.post(`/payroll-periods/${periodId}/process`);
      fetchSummary();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to process payroll period");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payroll summary...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Payroll period not found</p>
        <Button onClick={() => navigate("/payroll/periods")} variant="outline" className="mt-4">
          Back to Periods
        </Button>
      </div>
    );
  }

  const { period, summary: periodSummary } = summary;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/payroll/periods")}
            variant="outline"
            leftIcon={<FiArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{period.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {new Date(period.startDate).toLocaleDateString()} -{" "}
              {new Date(period.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {period.status === "draft" && (
            <Button
              onClick={handleProcess}
              variant="primary"
              isLoading={isProcessing}
              leftIcon={<FiFileText className="w-4 h-4" />}
            >
              Process Payroll
            </Button>
          )}
          {period.status === "pending_approval" && (
            <Button
              onClick={handleApprove}
              variant="primary"
              isLoading={isProcessing}
              leftIcon={<FiCheck className="w-4 h-4" />}
            >
              Approve Period
            </Button>
          )}
          {period.status === "approved" && (
            <Button
              onClick={handleLock}
              variant="outline"
              isLoading={isProcessing}
              leftIcon={<FiLock className="w-4 h-4" />}
            >
              Lock Period
            </Button>
          )}
        </div>
      </div>

      {/* Period Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Period Information</h2>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeClass(period.status)}`}
          >
            {period.status.replace("_", " ")}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Period Type</div>
            <div className="font-medium text-gray-900 capitalize">{period.periodType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pay Date</div>
            <div className="font-medium text-gray-900">
              {new Date(period.payDate).toLocaleDateString()}
            </div>
          </div>
          {period.processedAt && (
            <div>
              <div className="text-sm text-gray-500">Processed At</div>
              <div className="font-medium text-gray-900">
                {new Date(period.processedAt).toLocaleDateString()}
              </div>
            </div>
          )}
          {period.approvedAt && (
            <div>
              <div className="text-sm text-gray-500">Approved At</div>
              <div className="font-medium text-gray-900">
                {new Date(period.approvedAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{periodSummary.totalEmployees}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Gross</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(periodSummary.totalGross)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Deductions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(periodSummary.totalDeductions)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Net Pay</h3>
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(periodSummary.totalNet)}
          </p>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employee Payrolls</h2>
        </div>
        <DataTable
          columns={[
            {
              header: "Employee",
              cell: (payroll: any) => (
                <div>
                  <div className="font-medium text-gray-900">
                    {payroll.employee.firstName} {payroll.employee.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{payroll.employee.employeeNumber}</div>
                </div>
              ),
            },
            {
              header: "Gross Pay",
              cell: (payroll: any) => (
                <span className="text-gray-900">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(payroll.grossPay)}
                </span>
              ),
            },
            {
              header: "Deductions",
              cell: (payroll: any) => (
                <span className="text-red-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(payroll.totalDeductions)}
                </span>
              ),
            },
            {
              header: "Net Pay",
              cell: (payroll: any) => (
                <span className="font-semibold text-primary-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(payroll.netPay)}
                </span>
              ),
            },
            {
              header: "Status",
              cell: (payroll: any) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    payroll.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : payroll.status === "approved"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {payroll.status}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: (payroll: any) => (
                <button
                  onClick={() => navigate(`/payroll/payslips/${payroll.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Payslip"
                >
                  <FiFileText className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          rows={periodSummary.payrolls}
          totalItems={periodSummary.payrolls.length}
          startIndex={1}
          endIndex={periodSummary.payrolls.length}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          pageSize={periodSummary.payrolls.length}
          tableLoading={false}
          hasSearched={false}
          showCheckboxes={false}
        />
      </div>
    </div>
  );
};

export default ReviewPayrollPage;

