import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const PortalPayslips: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/payrolls")
      .then((response) => setRows(response.data.payrolls || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Payslips</h2>
      <div className="space-y-2">
        {rows.map((payroll) => (
          <button
            key={payroll.id}
            className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50"
            onClick={() => navigate(`/payroll/payslips/${payroll.id}`)}
          >
            <p className="font-semibold text-slate-800">
              {payroll.payrollPeriod?.name || "Payroll"}
            </p>
            <p className="text-xs text-slate-500">
              Net: KES {Number(payroll.netPay || 0).toLocaleString()}
            </p>
          </button>
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No payslips found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalPayslips;
