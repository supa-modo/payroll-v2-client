/**
 * Payroll Reports Page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportChart from "../../components/reports/ReportChart";
import ReportTable from "../../components/reports/ReportTable";
import ExportButton from "../../components/reports/ExportButton";
import RemittanceSummaryCards from "../../components/reports/RemittanceSummaryCards";
import { getPayrollReports, exportReport } from "../../api/reports";
import {
  PayrollReportType,
  ReportFilters as ReportFiltersType,
  TaxSummary,
} from "../../types/report";
import { formatCurrency } from "../../utils/format";
import Button from "../../components/ui/Button";

const REPORT_TYPES: Array<{ value: PayrollReportType; label: string }> = [
  { value: "summary", label: "Monthly Summary" },
  { value: "department", label: "Department Breakdown" },
  { value: "tax", label: "Tax Summary" },
  { value: "trends", label: "Trends" },
];

export default function PayrollReportsPage() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<PayrollReportType>("summary");
  const [filters, setFilters] = useState<ReportFiltersType>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [taxTab, setTaxTab] = useState<"overview" | "periods" | "departments" | "employees">("overview");

  useEffect(() => {
    loadReport();
  }, [reportType, filters, taxTab]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const includeEmployeeBreakdown = reportType === "tax" && taxTab === "employees";
      const response = await getPayrollReports(reportType, filters, includeEmployeeBreakdown);
      setReportData(response.report);
    } catch (error) {
      console.error("Failed to load report:", error);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      const blob = await exportReport(`payroll:${reportType}`, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-${reportType}-${filters.startDate}-to-${filters.endDate}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report");
    }
  };

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading report...</p>
        </div>
      );
    }

    // Ensure reportData is always an array for table/chart components
    const safeReportData = Array.isArray(reportData) ? reportData : [];

    if (!reportData || safeReportData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for the selected period</p>
        </div>
      );
    }

    switch (reportType) {
      case "summary":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="bar"
              dataKey="month"
              valueKey="totalNet"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Month", accessor: "month" },
                { header: "Employees", accessor: "employeeCount" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Deductions",
                  accessor: "totalDeductions",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
                {
                  header: "PAYE",
                  accessor: "totalPAYE",
                  format: formatCurrency,
                },
                {
                  header: "NSSF",
                  accessor: "totalNSSF",
                  format: formatCurrency,
                },
                {
                  header: "NHIF",
                  accessor: "totalNHIF",
                  format: formatCurrency,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "department":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="bar"
              dataKey="departmentName"
              valueKey="totalGross"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Department", accessor: "departmentName" },
                { header: "Employees", accessor: "employeeCount" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
              ]}
              onExport={handleExport}
            />
          </>
        );

      case "tax":
        const taxSummary = reportData as TaxSummary;
        const taxData = taxSummary?.breakdown || [];
        const periodBreakdown = taxSummary?.periodBreakdown || [];
        const departmentBreakdown = taxSummary?.departmentBreakdown || [];
        const employeeBreakdown = taxSummary?.employeeBreakdown || [];
        const remittanceStatus = taxSummary?.remittanceStatus || {
          pendingPAYE: 0,
          pendingNSSF: 0,
          pendingNHIF: 0,
          remittedPAYE: 0,
          remittedNSSF: 0,
          remittedNHIF: 0,
        };

        return (
          <>
            {/* Summary Cards */}
            <div className="mb-6">
              <RemittanceSummaryCards
                pendingPAYE={remittanceStatus.pendingPAYE}
                pendingNSSF={remittanceStatus.pendingNSSF}
                pendingNHIF={remittanceStatus.pendingNHIF}
                remittedPAYE={remittanceStatus.remittedPAYE}
                remittedNSSF={remittanceStatus.remittedNSSF}
                remittedNHIF={remittanceStatus.remittedNHIF}
              />
            </div>

            {/* Link to Tax Remittances Page */}
            <div className="mb-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate("/reports/tax-remittances")}
              >
                View All Remittances →
              </Button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "periods", label: "Period Breakdown" },
                  { id: "departments", label: "Department Breakdown" },
                  { id: "employees", label: "Employee Breakdown" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTaxTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      taxTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {taxTab === "overview" && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Total PAYE</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(taxSummary?.totalPAYE || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Total NSSF</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(taxSummary?.totalNSSF || 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total NHIF</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(taxSummary?.totalNHIF || 0)}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Monthly Breakdown
                  </h3>
                  <ReportChart
                    data={taxData}
                    type="line"
                    dataKey="month"
                    valueKey="paye"
                    height={300}
                  />
                </div>
                <ReportTable
                  data={taxData}
                  columns={[
                    { header: "Month", accessor: "month" },
                    { header: "PAYE", accessor: "paye", format: formatCurrency },
                    { header: "NSSF", accessor: "nssf", format: formatCurrency },
                    { header: "NHIF", accessor: "nhif", format: formatCurrency },
                  ]}
                  onExport={handleExport}
                />
              </>
            )}

            {taxTab === "periods" && (
              <>
                <ReportTable
                  data={periodBreakdown}
                  columns={[
                    { header: "Period", accessor: "periodName" },
                    { header: "Start Date", accessor: "startDate" },
                    { header: "End Date", accessor: "endDate" },
                    { header: "Status", accessor: "status" },
                    { header: "PAYE", accessor: "paye", format: formatCurrency },
                    { header: "NSSF", accessor: "nssf", format: formatCurrency },
                    { header: "NHIF", accessor: "nhif", format: formatCurrency },
                  ]}
                  onExport={handleExport}
                />
              </>
            )}

            {taxTab === "departments" && (
              <>
                <ReportTable
                  data={departmentBreakdown}
                  columns={[
                    { header: "Department", accessor: "departmentName" },
                    { header: "PAYE", accessor: "paye", format: formatCurrency },
                    { header: "NSSF", accessor: "nssf", format: formatCurrency },
                    { header: "NHIF", accessor: "nhif", format: formatCurrency },
                  ]}
                  onExport={handleExport}
                />
              </>
            )}

            {taxTab === "employees" && (
              <>
                {employeeBreakdown && employeeBreakdown.length > 0 ? (
                  <ReportTable
                    data={employeeBreakdown}
                    columns={[
                      { header: "Employee Number", accessor: "employeeNumber" },
                      { header: "Employee Name", accessor: "employeeName" },
                      { header: "PAYE", accessor: "paye", format: formatCurrency },
                      { header: "NSSF", accessor: "nssf", format: formatCurrency },
                      { header: "NHIF", accessor: "nhif", format: formatCurrency },
                    ]}
                    onExport={handleExport}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Employee breakdown not available for this report.</p>
                    <p className="text-sm mt-2">
                      Enable employee breakdown in report filters to see this data.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        );

      case "trends":
        return (
          <>
            <ReportChart
              data={safeReportData}
              type="line"
              dataKey="month"
              valueKey="totalGross"
              height={300}
            />
            <ReportTable
              data={safeReportData}
              columns={[
                { header: "Month", accessor: "month" },
                {
                  header: "Total Gross",
                  accessor: "totalGross",
                  format: formatCurrency,
                },
                {
                  header: "Total Net",
                  accessor: "totalNet",
                  format: formatCurrency,
                },
                { header: "Employees", accessor: "employeeCount" },
              ]}
              onExport={handleExport}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze payroll data and generate insights
          </p>
        </div>
        <ExportButton onExport={handleExport} disabled={!reportData} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 mb-4">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reportType === type.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          showDepartment={reportType === "department"}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">{renderReport()}</div>
    </div>
  );
}

