import React, { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full mb-5", wrapperClassName)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full px-4 py-3 rounded-lg border transition-all duration-200",
              "focus:outline-none focus:ring-1",
              "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
              "placeholder:text-gray-400",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error
                ? "border-red-500 focus:ring-red-500/30 bg-red-50 text-red-900 placeholder:text-red-300"
                : "border-gray-300 focus:border-primary-600 focus:ring-primary-600 bg-gray-100",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";

export default Input;
