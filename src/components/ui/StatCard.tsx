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

interface StatCardProps {
  icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  iconColor?: string;
  title?: string;
  label?: string;
  value?: string | number;
  sub?: string;
  badge?: { label: string; positive?: boolean | null };
  onClick?: () => void;
  className?: string;
  gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor = "#101828",
  title,
  label = "Metric",
  value = "—",
  sub,
  badge,
  onClick,
  className = "",
}) => {


  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white border border-gray-600 rounded-[1.2rem]
        px-4 py-3.5 flex items-center gap-4
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >


      {/* Icon block */}
      <div
        className="w-11 h-11 flex items-center justify-center shrink-0"
        style={{ color: iconColor }}

      >
        {Icon &&
          (typeof Icon === "function" ? (
            <Icon size={40} />
          ) : (
            <span className="inline-flex items-center justify-center text-[28px] leading-none">{Icon}</span>
          ))}
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate mb-0.5">
          {title ?? label}
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