import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import type { Payroll } from "../../types/payroll";

const PayslipViewer: React.FC = () => {
  const { payrollId } = useParams<{ payrollId: string }>();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (payrollId) {
      fetchPayroll();
    }
  }, [payrollId]);

  const fetchPayroll = async () => {
    if (!payrollId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/payrolls/${payrollId}`);
      setPayroll(response.data.payroll);
    } catch (error: any) {
      console.error("Failed to fetch payroll:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    if (!payrollId) return;
    try {
      setIsGenerating(true);
      const response = await api.post(
        `/payslips/payrolls/${payrollId}/generate-payslip`,
        {},
        {
          responseType: "blob",
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${payrollId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to generate payslip:", error);
      alert("Failed to generate payslip");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payslip...</div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Payslip not found</p>
        <Button onClick={() => navigate("/payroll/periods")} variant="outline" className="mt-4">
          Back to Periods
        </Button>
      </div>
    );
  }

  const employee = payroll.employee;
  const period = payroll.payrollPeriod;
  const earnings = payroll.items?.filter((item) => item.type === "earning") || [];
  const deductions = payroll.items?.filter((item) => item.type === "deduction") || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            leftIcon={<FiArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payslip</h1>
            <p className="mt-2 text-sm text-gray-600">
              {employee?.firstName} {employee?.lastName} - {period?.name}
            </p>
          </div>
        </div>
        <Button
          onClick={handleGeneratePayslip}
          variant="primary"
          isLoading={isGenerating}
          leftIcon={<FiDownload className="w-4 h-4" />}
        >
          Download PDF
        </Button>
      </div>

      {/* Payslip Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <h2 className="text-2xl font-bold">PAYSLIP</h2>
          <p className="mt-2 text-primary-100">
            {period?.name} - {period && new Date(period.startDate).toLocaleDateString()} to{" "}
            {period && new Date(period.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Employee Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Employee Information</h3>
              <div className="space-y-1">
                <p className="text-gray-900 font-medium">
                  {employee?.firstName} {employee?.lastName}
                </p>
                <p className="text-sm text-gray-600">Employee #: {employee?.employeeNumber}</p>
                {employee?.jobTitle && (
                  <p className="text-sm text-gray-600">Position: {employee.jobTitle}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Pay Date: {period && new Date(period.payDate).toLocaleDateString()}
                </p>
                {payroll.paymentMethod && (
                  <p className="text-sm text-gray-600">
                    Payment Method: {payroll.paymentMethod}
                  </p>
                )}
                {payroll.status && (
                  <p className="text-sm text-gray-600">Status: {payroll.status}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            EARNINGS
          </h3>
          <div className="space-y-2">
            {earnings.length > 0 ? (
              earnings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(item.amount.toString()))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No earnings</p>
            )}
            <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-gray-200">
              <span className="font-semibold text-gray-900">Total Earnings</span>
              <span className="font-bold text-lg text-gray-900">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(payroll.totalEarnings)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingDown className="w-5 h-5 text-red-600" />
            DEDUCTIONS
          </h3>
          <div className="space-y-2">
            {deductions.length > 0 &&
              deductions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-red-600">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(item.amount.toString()))}
                  </span>
                </div>
              ))}
            {payroll.payeAmount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">PAYE</span>
                <span className="font-medium text-red-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(parseFloat(payroll.payeAmount.toString()))}
                </span>
              </div>
            )}
            {payroll.nssfAmount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">NSSF</span>
                <span className="font-medium text-red-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(parseFloat(payroll.nssfAmount.toString()))}
                </span>
              </div>
            )}
            {payroll.nhifAmount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">NHIF</span>
                <span className="font-medium text-red-600">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(parseFloat(payroll.nhifAmount.toString()))}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-gray-200">
              <span className="font-semibold text-gray-900">Total Deductions</span>
              <span className="font-bold text-lg text-red-600">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(payroll.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="p-6 bg-primary-50">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">NET PAY</span>
            <span className="text-3xl font-bold text-primary-600">
              {new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
              }).format(payroll.netPay)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;

