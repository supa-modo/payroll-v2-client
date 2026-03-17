import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { Link } from "react-router-dom";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  rightLabelButtonText?: {
      text: string;
    href: string;
  };
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  OnClickRightIcon?: () => void;
  helperText?: string;
  description?: string;
  wrapperClassName?: string;
  type?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      rightLabelButtonText,
      labelClassName,
      error,
      leftIcon,
      rightIcon,
      OnClickRightIcon,
      helperText,
      description,
      className,
      wrapperClassName,
      type,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full mb-2", wrapperClassName)}>
        {label && (
          <div className="flex items-center justify-between">
          <label className={clsx("block text-sm text-gray-700 mb-1 pl-1.5 font-source", labelClassName)}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>

        
          {rightLabelButtonText && (
            <Link to={rightLabelButtonText.href} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {rightLabelButtonText.text}
            </Link>
          )}
          </div>
        )} 
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type || "text"}
            className={clsx(
              "w-full px-4 py-2.5 rounded-[0.7rem] border transition-all duration-200",
              "focus:outline-none focus:ring-1",
              "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
              "placeholder:text-gray-400",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error
                ? "border-red-500 focus:ring-red-500/30 bg-red-50 text-red-900 placeholder:text-red-300"
                : "border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-gray-100",
              className
            )}
            {...props}
          />
          {rightIcon && (

            <button type="button" onClick={OnClickRightIcon} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 cursor-pointer" >
              {rightIcon}
            </button>
          )}
        </div>
        {
          error && (
            <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
          )
        }
        {
          helperText && !error && (
            <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
          )
        }
        {
          description && !error && !helperText && (
            <p className="mt-1.5 text-sm text-gray-500">{description}</p>
          )
        }
      </div >
    );
  }
);

Input.displayName = "Input";

export default Input;
