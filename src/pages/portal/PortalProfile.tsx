import React from "react";
import { useAuthStore } from "../../store/authStore";

const PortalProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Profile</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Name:</span> {user?.firstName || ""}{" "}
          {user?.lastName || ""}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Email:</span> {user?.email || "—"}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Role:</span> {user?.role || "employee"}
        </p>
      </div>
    </div>
  );
};

export default PortalProfile;
