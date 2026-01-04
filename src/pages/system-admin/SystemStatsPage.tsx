import { useState, useEffect } from "react";
import { FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp, FiDatabase } from "react-icons/fi";
import api from "../../services/api";

interface SystemStats {
  tenantCount: number;
  userCount: number;
  employeeCount: number;
  activeEmployeeCount: number;
  totalPayrollAmount: number;
  totalExpenseAmount: number;
}

const SystemStatsPage = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/system-admin/stats");
      setSystemStats(response.data.stats);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch system statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!systemStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Statistics</h1>
        <p className="text-gray-600 mt-1">Overview of system-wide metrics</p>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{systemStats.tenantCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiDatabase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{systemStats.userCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiUsers className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{systemStats.employeeCount}</p>
              <p className="text-sm text-gray-500 mt-1">
                {systemStats.activeEmployeeCount} active
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBriefcase className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(systemStats.totalPayrollAmount)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiDollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(systemStats.totalExpenseAmount)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Employees per Tenant</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {systemStats.tenantCount > 0
                ? Math.round(systemStats.employeeCount / systemStats.tenantCount)
                : 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Users per Tenant</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {systemStats.tenantCount > 0
                ? Math.round(systemStats.userCount / systemStats.tenantCount)
                : 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total System Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(
                systemStats.totalPayrollAmount + systemStats.totalExpenseAmount
              )}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Employee Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {systemStats.employeeCount > 0
                ? Math.round(
                    (systemStats.activeEmployeeCount / systemStats.employeeCount) * 100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatsPage;

