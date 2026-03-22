import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbMailFilled, TbShieldHalfFilled, TbTrendingUp } from "react-icons/tb";
import { FiCheckCircle } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PiPasswordDuotone, PiSignInDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import AuthLeftPanel from "@/components/ui/AuthLeftPanel";

/* ══════════════════════════════════════════════
   LOGIN PAGE
   ══════════════════════════════════════════════ */
const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading, error: loginError, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const isEmployeePortalUser = (u: any) => {
    if (!u) return false;
    const role = String(u.role || "").toLowerCase();
    const roles = (u.roles || []).map((r: string) => String(r).toLowerCase());
    return role === "employee" || roles.includes("employee");
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        user?.isSystemAdmin
          ? "/system-admin/stats"
          : isEmployeePortalUser(user)
            ? "/portal/dashboard"
            : "/dashboard"
      );
    }
  }, [isAuthenticated, user, navigate]);


  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await login(formData);
    if (result.success && result.user) {
      navigate(
        result.user.isSystemAdmin
          ? "/system-admin/stats"
          : isEmployeePortalUser(result.user)
            ? "/portal/dashboard"
            : "/dashboard"
      );
    }
  };

  const FontStyle = () => (
    <style>{`
      @keyframes authFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .auth-animate { animation: authFadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
    `}</style>
  );

  return (
    <>
      <FontStyle />
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#f0f5ff]"
        style={{
          backgroundImage: `url("/loginbg.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b lg:bg-linear-to-br from-white via-white/80 to-blue-500/0 backdrop-blur-[2px]" />
        <AuthLeftPanel
          heading={<>The smarter way to<br /><span className="text-sky-300">run payroll.</span></>}
          sub="Manage your entire payroll workflow — from employees to statutory deductions — in one place."
          features={[
            { icon: <TbShieldHalfFilled size={22} />, text: "Secure, role-based access control" },
            { icon: <PiUsersThreeDuotone size={22} />, text: "Multi-department employee management" },
            { icon: <TbTrendingUp size={22} />, text: "Automated PAYE, NSSF & SHIF" },
            { icon: <FiCheckCircle size={21} />, text: "Payslip generation in seconds" },
          ]}
        />

        {/* Right — form */}
        <div className="-mx-2 lg:mx-0 font-source relative z-10 flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-lg auth-animate">

            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">P</div>
              <span className="font-bold text-slate-900 text-lg">PayrollHQ</span>
            </div>

            <div className="bg-white rounded-4xl shadow-[0_8px_40px_rgba(37,99,235,0.10),0_0_0_1px_rgba(37,99,235,0.07)] px-6 lg:px-8 py-7 lg:py-9">
              {/* Header */}
              <div className="hidden items-center gap-2.5 mb-5 lg:flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">P</div>
                <span className="font-bold text-slate-900 text-lg">PayrollHQ</span>
              </div>
              <div className="pb-3 border-b border-gray-200 text-center">
                <h2 className="text-xl lg:text-[1.35rem] font-extrabold font-google text-slate-900 mb-1">Login to Continue</h2>
                <p className="text-sm lg:text-[0.9rem] text-slate-500">Welcome back — enter your credentials below.</p>
              </div>

              {/* API error */}
              {loginError && (
                <div className="pt-2 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm mb-6">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="pt-3 flex flex-col gap-4">
                {/* Email */}
                <Input
                  label="Email address"
                  labelClassName="text-gray-600"
                  type="email"
                  leftIcon={<TbMailFilled className="w-5 h-5" />}
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  error={errors.email}
                  required={true}
                />


                {/* Password */}
                <Input
                  label="Password"
                  rightLabelButtonText={{
                    text: "Forgot Your Password?",
                    href: "/forgot-password",
                  }}
                  labelClassName="text-gray-600"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  rightIcon={showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  leftIcon={<PiPasswordDuotone className="w-4 h-4 text-gray-600" />}
                  OnClickRightIcon={() => setShowPassword(v => !v)}
                  error={errors.password}
                  required={true}
                  wrapperClassName="mb-2"
                />


                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full"
                  loadingText="Verifying ..."
                >
                  <div className="flex items-center justify-center gap-2">
                    <PiSignInDuotone className="w-5 h-5" />
                    <span>Sign In to Your Account</span>
                  </div>
                </Button>

              </form>
            </div>

            {/* Footer */}
            <p className="text-center text-[0.8rem] font-source font-medium text-gray-700 mt-6 leading-relaxed">
              © {new Date().getFullYear()} For Innovasure Limited.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;