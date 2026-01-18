import React from "react";
import { TbMailFilled } from "react-icons/tb";
import {
  TopographicPattern,
  HorizontalCurve,
  VerticalCurve,
} from "./LoginHeroComponents";

interface LoginHeroSectionProps {
  variant?: "default" | "admin";
  patternId?: string;
}

/**
 * LoginHeroSection - Reusable hero section component for login pages
 *
 * Uses a fixed 55%/45% split on desktop (lg+) screens.
 * This uses inline styles to ensure proper width in production builds,
 * as Tailwind's JIT compiler cannot handle dynamic class interpolation.
 *
 * @param variant - Content variant: "default" for payroll-focused content, "admin" for admin/manager content
 * @param patternId - Unique ID for the topographic pattern (default: "topographic")
 */
export const LoginHeroSection: React.FC<LoginHeroSectionProps> = ({
  variant = "default",
  patternId = "topographic",
}) => {
  // Content based on variant
  const content: Record<
    "default" | "admin",
    {
      headline1: string;
      headline2: string;
      headline2Accent: string;
      headline2Mobile?: string;
      subheadline: string;
      highlight1: string;
      highlight2: string;
      mobileSubheadline: string;
    }
  > = {
    default: {
      headline1: "Your Payroll & HR",
      headline2: "Management",
      headline2Accent: "Platform",
      subheadline:
        "Manage employees, run payroll, track expenses and loans. Secure access to",
      highlight1: "salary components, statutory compliance, and reporting",
      highlight2: ".",
      mobileSubheadline:
        "Payroll, expenses, loans, and HR in one place.",
    },
    admin: {
      headline1: "Admin & Manager",
      headline2: "System",
      headline2Accent: "Management Portal",
      headline2Mobile: "System Management Portal",
      subheadline:
        "Manage your organization's payroll, monitor system performance, and access comprehensive administrative tools. Secure access to",
      highlight1: "analytics, employee management, and reporting",
      highlight2: "features.",
      mobileSubheadline:
        "Secure access to administrative tools and system management",
    },
  };

  const currentContent = content[variant];

  return (
    <>
      {/* 
        Responsive width styles - using a style tag to ensure 55%/45% split on desktop.
        This approach avoids Tailwind's dynamic class limitation in production builds.
      */}
      <style>{`
        @media (min-width: 1024px) {
          .login-hero-section {
            width: 55% !important;
            min-width: 55% !important;
            max-width: 55% !important;
            flex-shrink: 0 !important;
          }
          .login-hero-section > .login-hero-section {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
          .login-form-section {
            width: 45% !important;
            min-width: 45% !important;
            max-width: 45% !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
      <div className="login-hero-section relative h-[38vh] lg:h-screen shrink-0 w-full">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        />

        {/* Primary Gradient Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-br from-primary-700/90 via-primary-600/85 to-primary-500/75" />

        {/* Secondary gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-600/60 to-transparent" />

        {/* Topographic Pattern Overlay */}
        <TopographicPattern patternId={patternId} />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-20 z-10 pointer-events-none">
          {/* Main Hero Content - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex flex-col max-w-2xl xl:max-w-3xl">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="/logo2.webp"
                alt="Payroll System Logo"
                className="w-auto h-16 lg:h-20"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-white mb-6">
              <span className="block text-4xl xl:text-5xl 2xl:text-6xl font-light tracking-tight leading-tight">
                {currentContent.headline1}
              </span>
              <span className="block text-4xl xl:text-5xl 2xl:text-6xl font-extrabold leading-tight">
                {variant === "default" ? (
                  <>
                    {currentContent.headline2}{" "}
                    <span className="text-secondary-400">
                      {currentContent.headline2Accent}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white">
                      {currentContent.headline2}
                    </span>{" "}
                    <span className="text-tertiary-300">
                      {currentContent.headline2Accent}
                    </span>
                  </>
                )}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-white/85 text-lg xl:text-xl font-light leading-relaxed mb-8 max-w-3xl">
              {currentContent.subheadline}{" "}
              <span className="font-semibold text-white px-2">
                {currentContent.highlight1}
              </span>
              {variant === "default" && (
                <span className="font-semibold text-white">
                  {" "}
                  {currentContent.highlight2}
                </span>
              )}
              {variant === "admin" && (
                <span className="font-semibold text-white">
                  {" "}
                  {currentContent.highlight2}
                </span>
              )}
            </p>

            {/* Support Contact */}
            <div className="bg-white/10 backdrop-blur-sm z-50 rounded-xl border border-white/20 p-6 max-w-lg pointer-events-auto">
              <p className="text-white/90 text-sm font-medium mb-4">
                Need help? Contact support
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <a
                  href="mailto:support@example.com"
                  className="flex items-center gap-2 text-white hover:text-secondary-300 hover:cursor-pointer transition-colors group"
                >
                  <TbMailFilled className="w-5 h-5 text-secondary-400 group-hover:text-secondary-300 transition-colors" />
                  <span className="text-sm font-medium">
                    support@example.com
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Hero Content - Simplified version */}
          <div className="lg:hidden flex flex-col items-center text-center">
            <div className="mb-2">
              <img
                src="/logo2.webp"
                alt="Payroll System Logo"
                className="w-auto h-14 lg:h-20"
              />
            </div>
            <h1 className="text-white mb-3">
              <span className="block text-2xl md:text-3xl font-light tracking-tight">
                {currentContent.headline1}
              </span>
              <span className="block text-2xl md:text-3xl font-bold ">
                {variant === "default" ? (
                  <>
                    {currentContent.headline2}{" "}
                    <span className="text-secondary-200">
                      {currentContent.headline2Accent}
                    </span>
                  </>
                ) : (
                  <span className="text-secondary-200">
                    {currentContent.headline2Mobile || "Portal"}
                  </span>
                )}
              </span>
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-xs leading-relaxed">
              {currentContent.mobileSubheadline}
            </p>
          </div>
        </div>

        {/* 
        Curved Separator:
        - Mobile: Horizontal curve at bottom (hidden on desktop)
        - Desktop: Vertical curve on right edge (hidden on mobile)
      */}
        <div className="lg:hidden">
          <HorizontalCurve />
        </div>
        <div className="hidden lg:block">
          <VerticalCurve />
        </div>
      </div>
    </>
  );
};
