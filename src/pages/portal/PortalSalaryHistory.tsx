import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";

const PortalSalaryHistory: React.FC = () => {
  const [revisions, setRevisions] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/employees/${user.id}/salary/history`)
      .then((response) => setRevisions(response.data.revisions || []))
      .catch(() => setRevisions([]));
  }, [user?.id]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Salary History</h2>
      {revisions.map((revision) => (
        <div key={revision.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-800">
            {new Date(revision.revisionDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500">
            Previous: KES {Number(revision.previousGross || 0).toLocaleString()} | New: KES{" "}
            {Number(revision.newGross || 0).toLocaleString()}
          </p>
        </div>
      ))}
      {revisions.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No salary revisions available.
        </div>
      )}
    </div>
  );
};

export default PortalSalaryHistory;
