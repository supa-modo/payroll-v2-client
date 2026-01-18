import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import api from "../../services/api";
import { LoginHeroSection } from "../../components/landing/LoginHeroSection";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "An error occurred. Please try again later.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State View
  if (isSuccess) {
    return (
      <div className="font-source min-h-screen lg:max-h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Hero Section */}
        <LoginHeroSection variant="default" patternId="topographic-forgot" />

        {/* Form Section */}
        <div className="login-form-section flex-1 lg:max-h-screen bg-white flex items-center justify-center px-6 pb-2 lg:mb-6 lg:px-2 lg:pt-12 lg:pb-0 overflow-y-auto">
          <div className="w-full max-w-md lg:-ml-16 flex flex-col min-h-full lg:h-full">
            <div className="flex-1 flex flex-col justify-center">
              <div className="-ml-4 mb-4 lg:mb-6">
                <img
                  src="/logo.webp"
                  alt="Payroll System Logo"
                  className="w-auto h-16 lg:h-20 mb-1 md:mb-4 lg:mb-6"
                />
              </div>

              {/* Success Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 mb-8 lg:mb-2 py-4 px-6 lg:p-8">
                <div className="text-center mb-5">
                  <div className="mx-auto h-13 lg:h-14 w-13 lg:w-14 rounded-full bg-green-600 flex items-center justify-center mb-4">
                    <FaCheck className="h-6 lg:h-7 w-6 lg:w-7 text-white" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                    Check your email
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base">
                    If an account with that email exists, we've sent you a
                    password reset link. Please check your inbox and follow the
                    instructions.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 active:scale-[0.98] text-sm lg:text-base flex justify-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>

            
            {/* Copyright Footer */}
          <div className="font-source mt-auto pt-3 lg:pt-6 border-t border-gray-200">
            <div className="flex lg:flex-col items-center justify-between lg:gap-3">
              {/* Copyright Text */}
              <p className="text-xs lg:text-[0.85rem] text-gray-400 text-center">
                © {new Date().getFullYear()} Innovasure Limited Payroll System. All rights
                reserved.
              </p>

                <p className="text-xs lg:text-[0.83rem] font-medium text-gray-500 text-center">Powered by APIHub Solutions</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form View
  return (
    <div className="font-source min-h-screen lg:max-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* 
        ============================================
        HERO SECTION
        ============================================
      */}
      <LoginHeroSection variant="default" patternId="topographic-forgot" />

      {/* 
        ============================================
        FORM SECTION
        ============================================
      */}
      <div className="login-form-section flex-1 max-h-screen bg-white flex items-center justify-center px-6 pb-2 lg:mb-6 lg:px-2 lg:pt-12 lg:pb-0 overflow-y-auto">
        <div className="w-full max-w-md lg:-ml-16 flex flex-col min-h-full lg:h-full">
          {/* Main Content Area - Takes up available space */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Sign In Header */}
            <div className="-ml-4 mb-4 lg:mb-6">
              <img
                src="/logo.webp"
                alt="Payroll System Logo"
                className="w-auto h-16 lg:h-20 mb-3 md:mb-4 lg:mb-6"
              />
              <p className="pl-4 text-xl lg:text-2xl font-bold text-gray-900">
                Forgot Your Password?
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-6">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[0.83rem] md:text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 flex items-center pointer-events-none">
                    <FiMail className="h-5 lg:h-6 w-5 lg:w-6 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 lg:pl-14 pr-4 py-3 lg:py-3.5 border rounded-xl text-gray-900 placeholder:text-gray-400 
                      focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all  
                      duration-200 text-sm lg:text-base ${
                        errors.email
                          ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
                          : "border-gray-300"
                      }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs pl-1.5 lg:text-sm mt-1.5">
                    {errors.email}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  We'll send a password reset link to your email address
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold 
                  py-3.5 px-4 rounded-xl transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
                  shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40
                  active:scale-[0.98] text-sm lg:text-base"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending Code...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 lg:mt-10 pb-16 lg:pb-0 text-center">
              <p className="text-gray-600 text-sm">
                Remember your account password?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 underline underline-offset-4 font-semibold transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="font-source mt-auto pt-3 lg:pt-6 border-t border-gray-200">
            <div className="flex lg:flex-col items-center justify-between lg:gap-3">
              {/* Copyright Text */}
              <p className="text-xs lg:text-[0.85rem] text-gray-400 text-center">
                © {new Date().getFullYear()} Innovasure Limited Payroll System. All rights
                reserved.
              </p>

                <p className="text-xs lg:text-[0.83rem] font-medium text-gray-500 text-center">Powered by APIHub Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
