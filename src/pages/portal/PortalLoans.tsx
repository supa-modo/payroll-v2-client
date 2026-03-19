import React, { useEffect, useState } from "react";
import api from "../../services/api";

const PortalLoans: React.FC = () => {
  const [loans, setLoans] = useState<any[]>([]);
  useEffect(() => {
    api
      .get("/loans")
      .then((response) => setLoans(response.data.loans || []))
      .catch(() => setLoans([]));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">My Loans</h2>
      {loans.map((loan) => (
        <div key={loan.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-semibold text-slate-800">{loan.loanType}</p>
          <p className="text-xs text-slate-500">
            Remaining: KES {Number(loan.remainingBalance || 0).toLocaleString()} • {loan.status}
          </p>
        </div>
      ))}
      {loans.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No loans found.
        </div>
      )}
    </div>
  );
};

export default PortalLoans;
