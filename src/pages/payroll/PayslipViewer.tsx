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
      if (response.data && response.data.payroll) {
        setPayroll(response.data.payroll);
      } else {
        console.error("Invalid payroll data structure:", response.data);
        setPayroll(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch payroll:", error);
      setPayroll(null);
      if (error.response?.status === 404) {
        alert("Payslip not found. The payroll may not exist or you may not have access to it.");
      } else if (error.response?.status === 403) {
        alert("You do not have permission to view this payslip.");
      } else {
        alert("Failed to load payslip. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    if (!payrollId) return;
    try {
      setIsGenerating(true);
      const response = await api.post(
        `/me/payrolls/${payrollId}/generate-payslip`,
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

  const employee = payroll?.employee;
  const period = payroll?.payrollPeriod;
  const earnings = payroll?.items?.filter((item) => item.type === "earning") || [];
  // PayrollItem records already include PAYE/NSSF/SHIF/Housing Levy statutory deductions.
  // Rendering them only once avoids duplicate deductions on the payslip UI.
  const deductions =
    payroll?.items?.filter((item) => item.type === "deduction" && item.amount > 0) || [];
  const employerContributions =
    payroll?.items?.filter((item) => item.type === "employer_contrib" && item.amount > 0) || [];

  const payeItem =
    payroll?.items?.find((item) => item.type === "deduction" && item.name === "PAYE") || null;
  const taxDetails = (payeItem?.calculationDetails || {}) as Record<string, any>;
  const taxableIncomeAfterNssf = (payroll as any)?.taxableIncome ?? 0;
  const personalRelief = (payroll as any)?.personalRelief ?? taxDetails?.personalRelief ?? 0;
  const insuranceRelief =
    (payroll as any)?.insuranceRelief ?? taxDetails?.insuranceRelief ?? 0;
  const grossPaye = taxDetails?.grossTax ?? 0;
  const netPaye = payeItem?.amount ?? (payroll as any)?.payeAmount ?? 0;
  
  // Safety check - if critical data is missing, show error
  if (!employee || !period) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Unable to display payslip. Missing employee or period information.</p>
        <Button onClick={() => navigate("/payroll/periods")} variant="outline">
          Back to Periods
        </Button>
      </div>
    );
  }

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
                {payroll?.paymentMethod && (
                  <p className="text-sm text-gray-600">
                    Payment Method: {payroll.paymentMethod}
                  </p>
                )}
                {payroll?.status && (
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
                }).format(payroll?.totalEarnings || payroll?.grossPay || 0)}
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
            <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-gray-200">
              <span className="font-semibold text-gray-900">Total Deductions</span>
              <span className="font-bold text-lg text-red-600">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(payroll?.totalDeductions || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Employer Contributions */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-blue-100 text-blue-700">
              $
            </span>
            EMPLOYER CONTRIBUTIONS
          </h3>
          <div className="space-y-2">
            {employerContributions.length > 0 ? (
              employerContributions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-blue-700">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(item.amount.toString()))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No employer contributions</p>
            )}
          </div>
        </div>

        {/* Tax Calculation Breakdown */}
        <div className="p-6 bg-primary-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Calculation Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Taxable Income (after NSSF)</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(parseFloat(taxableIncomeAfterNssf.toString()))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">NSSF</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(
                  parseFloat(
                    (payroll as any)?.nssfAmount?.toString?.() ?? "0"
                  )
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Personal Relief</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(parseFloat(personalRelief.toString()))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Insurance Relief</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("en-KE", {
                  style: "currency",
                  currency: "KES",
                }).format(parseFloat(insuranceRelief.toString()))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:col-span-2">
              <div className="text-sm text-gray-500">PAYE (Gross vs Net)</div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gross PAYE (before relief)</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(grossPaye.toString()))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Net PAYE (after relief)</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(parseFloat(netPaye.toString()))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary-50">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">NET PAY</span>
            <span className="text-3xl font-bold text-primary-600">
              {new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
              }).format(payroll?.netPay || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;

