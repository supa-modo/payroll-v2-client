import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode | null;
  gradient: string;
  subtitle?: string;
  subtitleColor?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  subtitle,
  subtitleColor = "text-gray-500",
  onClick,
  clickable = false,
}) => {
  const cardClasses = `
    group relative overflow-hidden 
    bg-white 
    rounded-xl border border-gray-200 
    shadow-sm 
    hover:shadow-md hover:border-gray-300
    transition-all duration-300
    ${clickable ? "cursor-pointer" : ""}
  `;

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="relative p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs font-medium ${subtitleColor}`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="absolute top-6 right-6 text-gray-400">{icon}</div>
        )}
        {change && changeType && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold mt-2 ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

