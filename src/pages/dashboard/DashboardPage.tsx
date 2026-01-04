import React from "react";
import { FiUsers, FiBriefcase, FiDollarSign } from "react-icons/fi";
import StatCard from "../../components/ui/StatCard";

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your payroll management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Employees"
          value="0"
          subtitle="Active employees"
          icon={<FiUsers className="w-8 h-8" />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Departments"
          value="0"
          subtitle="Active departments"
          icon={<FiBriefcase className="w-8 h-8" />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Payroll"
          value="KES 0"
          subtitle="This month"
          icon={<FiDollarSign className="w-8 h-8" />}
          gradient="from-purple-500 to-purple-600"
        />
      </div>
    </div>
  );
};

export default DashboardPage;

