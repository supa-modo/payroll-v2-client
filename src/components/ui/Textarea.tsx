import React, { forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full mb-5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
            "placeholder:text-gray-400 resize-y min-h-[100px]",
            error
              ? "border-red-500 focus:ring-red-500/30 bg-red-50 text-red-900 placeholder:text-red-300"
              : "border-gray-300 focus:border-green-500 focus:ring-green-500/30 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export default Textarea;

