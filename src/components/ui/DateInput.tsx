import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { FiCalendar } from "react-icons/fi";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, helperText, className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={clsx("w-full mb-5", wrapperClassName)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={clsx(
              "w-full px-4 py-3 rounded-lg border transition-all duration-200",
              "focus:outline-none focus:ring-1",
              "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
              "pr-12",
              error
                ? "border-red-500 focus:ring-red-500/30 bg-red-50 text-red-900 placeholder:text-red-300"
                : "border-gray-300 focus:border-primary-600 focus:ring-primary-600 bg-gray-100",
              className
            )}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
            <FiCalendar className="w-5 h-5" />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;

