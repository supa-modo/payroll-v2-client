/**
 * Reports Page - Main Dashboard
 */

import { useNavigate } from "react-router-dom";
import { FiDollarSign, FiTrendingUp, FiFileText } from "react-icons/fi";
import Button from "../../components/ui/Button";

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and export comprehensive payroll and expense reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payroll Reports Card */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Payroll Reports</h2>
                <p className="text-sm text-gray-600">View payroll analytics and summaries</p>
              </div>
            </div>
          </div>
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li>• Monthly payroll summary</li>
            <li>• Departmental breakdown</li>
            <li>• Tax summaries (PAYE, NSSF, NHIF)</li>
            <li>• Employee payroll history</li>
            <li>• Payroll trends</li>
          </ul>
          <Button onClick={() => navigate("/reports/payroll")} className="w-full">
            View Payroll Reports
          </Button>
        </div>

        {/* Expense Reports Card */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Expense Reports</h2>
                <p className="text-sm text-gray-600">Analyze expense data and trends</p>
              </div>
            </div>
          </div>
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li>• Expenses by category</li>
            <li>• Expenses by department</li>
            <li>• Monthly expense trends</li>
            <li>• Top spenders</li>
          </ul>
          <Button onClick={() => navigate("/reports/expenses")} className="w-full">
            View Expense Reports
          </Button>
        </div>

        {/* Tax Remittances Card */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tax Remittances</h2>
                <p className="text-sm text-gray-600">Track and manage tax remittances</p>
              </div>
            </div>
          </div>
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li>• View pending tax remittances</li>
            <li>• Mark remittances as paid</li>
            <li>• Track PAYE, NSSF, and NHIF</li>
            <li>• Monitor due dates and overdue items</li>
            <li>• View remittance history</li>
          </ul>
          <Button onClick={() => navigate("/reports/tax-remittances")} className="w-full">
            View Tax Remittances
          </Button>
        </div>
      </div>
    </div>
  );
}

