import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbLockFilled } from "react-icons/tb";
import { FiMail } from "react-icons/fi";
import { LoginHeroSection } from "../../components/landing/LoginHeroSection";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    login,
    isLoading,
    error: loginError,
    isAuthenticated,
    user,
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isSystemAdmin) {
        navigate("/system-admin/stats");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData);
    if (result.success && result.user) {
      if (result.user.isSystemAdmin) {
        navigate("/system-admin/stats");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="font-source min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* 
        ============================================
        HERO SECTION
        ============================================
      */}
      <LoginHeroSection variant="default" patternId="topographic" />

      {/* 
        ============================================
        FORM SECTION
        ============================================
        - Mobile: Remaining viewport height (60vh), full width
        - Desktop: 35vw width, full height, positioned on right
        - Contains: Login form with clean white background
      */}
      <div className="login-form-section flex-1 bg-white flex items-center justify-center px-6 pb-2 lg:mb-6 lg:px-2 lg:pt-12 -mt-10 lg:mt-0 lg:pb-0 overflow-y-auto">
        <div className="w-full max-w-md lg:-ml-16 flex flex-col min-h-full lg:h-full">
          {/* Main Content Area - Takes up available space */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Sign In Header */}
            <div className="-ml-4 mb-4 lg:mb-6">
              <img
                src="/logo.webp"
                alt="Payroll System Logo"
                className="w-auto h-16 lg:h-20 mb-3 md:mb-4 lg:mb-6 "
              />
              <p className="pl-4 text-xl lg:text-2xl font-bold text-gray-900">
                Sign in to your payroll account.
              </p>
            </div>

            {/* Error Message Display */}
            {loginError && (
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
                  <p className="text-sm font-medium">{loginError}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="pl-2 block text-[0.83rem] md:text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  {/* Icon */}
                  <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 flex items-center pointer-events-none">
                    <FiMail className="h-5 lg:h-6 w-5 lg:w-6 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 lg:pl-14 pr-4 py-3 lg:py-3.5 border rounded-xl text-gray-900 placeholder:text-gray-400 
                      focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all  
                      duration-200 text-sm lg:text-base
                      ${
                        errors.email
                          ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
                          : "border-gray-300"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs pl-1.5 lg:text-sm mt-1.5">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="pl-2 block text-[0.83rem] md:text-sm font-medium text-gray-700"
                  >
                    Your Password
                  </label>
                  {/* Forgot Password Link */}
                  <Link
                    to="/forgot-password"
                    className="text-[0.83rem] lg:text-sm text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  {/* Icon */}
                  <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 flex items-center pointer-events-none">
                    <TbLockFilled className="h-5 lg:h-6 w-5 lg:w-6 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 lg:pl-14 pr-12 py-3 lg:py-3.5 border rounded-xl text-gray-900 placeholder:text-gray-400 
                      focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all  
                      duration-200 text-sm lg:text-base
                      ${
                        errors.password
                          ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
                          : "border-gray-300"
                      }`}
                  />
                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs pl-1.5 lg:text-sm mt-1.5">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold 
                  py-3.5 px-4 rounded-xl transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
                  shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40
                  active:scale-[0.98] text-sm lg:text-base"
              >
                {isLoading ? (
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
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Copyright Footer */}
          <div className="font-source mt-auto pt-3 lg:pt-6 border-t border-gray-200">
            <div className="flex lg:flex-col items-center justify-between lg:gap-3">
              {/* Copyright Text */}
              <p className="text-xs lg:text-[0.85rem] text-gray-400 text-center">
                © {new Date().getFullYear()} Innovasure Limited Payroll System.
                All rights reserved.
              </p>

              <p className="text-xs lg:text-[0.83rem] font-medium text-gray-500 text-center">
                Powered by APIHub Solutions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
