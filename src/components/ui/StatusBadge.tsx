import React from "react";
import { FiCheckCircle, FiClock, FiRefreshCw } from "react-icons/fi";
import { TbBuildingBank, TbLock, TbProgress } from "react-icons/tb";

export const STATUS_CONFIG = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", icon: TbProgress },
  processing: { label: "Processing", bg: "bg-primary-50", text: "text-primary-700", dot: "bg-primary-500", icon: FiRefreshCw },
  pending_approval: { label: "Pending Approval", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: FiClock },
  approved: { label: "Approved", bg: "bg-secondary-50", text: "text-secondary-700", dot: "bg-secondary-500", icon: FiCheckCircle },
  paid: { label: "Paid", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", icon: TbBuildingBank },
  locked: { label: "Locked", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", icon: TbLock },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status as StatusKey] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.72rem] font-semibold pl-1 pr-2.5 py-0.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.bg.replace("bg-", "border-").replace("-50", "-100").replace("-100", "-200")}`}>
      <span className={`w-1 h-2.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
