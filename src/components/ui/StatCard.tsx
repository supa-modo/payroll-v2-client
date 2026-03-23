/**
 * StatCard — Reusable KPI / Stat Card Component
 * 
 * Usage:
 *   import StatCard from "@/components/ui/StatCard";
 * 
 *   <StatCard
 *     icon={FiUsers}
 *     iconColor="#2563eb"
 *     label="Total Employees"
 *     value="247"
 *     sub="Active headcount"
 *     badge={{ label: "+3 this month", positive: true }}
 *   />
 *
 * Props:
 *   icon        — React icon component
 *   iconColor   — hex color string (used for icon tint + accent)
 *   label       — small uppercase label text
 *   value       — main bold value / number
 *   sub         — small descriptive text below value
 *   badge       — { label: string, positive?: boolean } — optional pill badge
 *   onClick     — optional click handler
 *   className   — optional extra Tailwind classes
 */

import React from "react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

const StatCard = ({
  icon: Icon,
  iconColor = "#2563eb",
  label = "Metric",
  value = "—",
  sub,
  badge,
  onClick,
  className = "",
}) => {
  /* Derive a very light tint from iconColor for the icon bg */
  const iconBg = iconColor + "14"; // 8% opacity hex

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white border border-gray-600 rounded-2xl
        px-4 py-4 flex items-center gap-4
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]
        hover:border-slate-200
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: iconColor }}
      />

      {/* Icon block */}
      <div
        className="w-11 h-11 flex items-center justify-center shrink-0"
        
      >
        {Icon && <Icon size={40} />}
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-extrabold font-google text-slate-900 leading-tight tracking-tight truncate">
          {value}
        </p>
        {sub && (
          <p className="text-[0.8rem] text-tertiary-600 truncate mt-0.5">
            {sub}
          </p>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <div className="shrink-0">
          <span
            className={`
              inline-flex items-center gap-0.5 text-[10.5px] font-bold
              px-2 py-1 rounded-lg whitespace-nowrap
              ${badge.positive === false
                ? "bg-red-50 text-red-500"
                : badge.positive === true
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"}
            `}
          >
            {badge.positive === true && <FiArrowUpRight size={11} />}
            {badge.positive === false && <FiArrowDownRight size={11} />}
            {badge.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;