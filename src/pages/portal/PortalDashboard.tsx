import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const PortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Welcome</h2>
      <p className="text-sm text-slate-600">
        Access payslips, salary history, expenses and loan updates from one place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button onClick={() => navigate("/portal/payslips")}>View Payslips</Button>
        <Button variant="outline" onClick={() => navigate("/portal/salary-history")}>
          Salary History
        </Button>
        <Button variant="outline" onClick={() => navigate("/portal/expenses")}>
          My Expenses
        </Button>
        <Button variant="outline" onClick={() => navigate("/portal/loans")}>
          My Loans
        </Button>
      </div>
    </div>
  );
};

export default PortalDashboard;
