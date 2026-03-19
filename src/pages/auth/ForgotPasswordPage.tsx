import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbShieldHalfFilled, TbClock, TbTrendingUp, TbMailFilled, TbArrowBack } from "react-icons/tb";
import api from "../../services/api";
import { PiUsersThreeDuotone } from "react-icons/pi";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MdLockReset } from "react-icons/md";
import AuthLeftPanel from "@/components/ui/AuthLeftPanel";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .auth-animate { animation: authFadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
  `}</style>
);


/* ══════════════════════════════════════════════
   FORGOT PASSWORD PAGE
   ══════════════════════════════════════════════ */
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
    if (apiError) setApiError(null);
  };

  const validate = () => {
    if (!email) { setErrors({ email: "Email is required" }); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: "Enter a valid email address" }); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
    } catch (err: any) {
      setApiError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftPanel = (
    <AuthLeftPanel
      heading={<>Account Password<br /><span className="text-sky-300">recovery.</span></>}
      sub="We'll send a secure password reset link straight to your inbox. Check your email and follow the instructions."
      features={[
        { icon: <TbShieldHalfFilled size={22} />, text: "Secure reset link via email" },
        { icon: <TbClock size={22} />, text: "Link expires after 30 minutes" },
        { icon: <PiUsersThreeDuotone size={22} />, text: "Your account data stays protected" },
        { icon: <TbTrendingUp size={22} />, text: "Instant access once reset" },
      ]}
    />
  );

  /* ── Success state ── */
  if (isSuccess) {
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

          {leftPanel}
   
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
              <div className="pb-3 text-center">
                <h2 className="text-xl lg:text-[1.35rem] font-extrabold font-google text-slate-900 mb-1">Check your inbox</h2>
                <p className="text-sm lg:text-[0.9rem] text-slate-500">If an account with <strong className="text-slate-700">{email}</strong> exists, we've sent a reset link. Check your inbox and follow the instructions.</p>
              </div>
                <div className="mb-6 w-full bg-blue-50 text-center border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                  Didn't receive the email? Check your spam folder or wait a minute before trying again.
                </div>

                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={isSubmitting}
                  className="w-full">
                   <div className="flex items-center justify-center gap-2">
                    <MdLockReset className="w-6 h-6" />
                    <span>Back to Sign In</span>
                  </div>
                </Button>

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
  }

  /* ── Main form ── */
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


        {leftPanel}

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
              <div className="pb-3 text-center">
                <h2 className="text-xl lg:text-[1.35rem] font-extrabold font-google text-slate-900 mb-1">Forgot Your Account password?</h2>
                <p className="text-sm lg:text-[0.9rem] text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
              </div>

              {apiError && (
                <div className="pt-2 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm mb-6">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="pt-3 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">

                  <Input
                    label="Email address"
                    labelClassName="text-gray-600"
                    type="email"
                    leftIcon={<TbMailFilled className="w-5 h-5" />}
                    value={email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    error={errors.email}
                    required={true}
                    wrapperClassName="mb-2"
                  />

                  {errors.email && <p className="text-xs text-rose-500 pl-1">{errors.email}</p>}
                  <p className="text-[0.8rem] font-source text-gray-600 pl-1">We'll only send a reset link if this email is registered.</p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">


                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                      <span>Sending ...</span></div>
                  ) : <div className="flex items-center justify-center gap-2">
                    <MdLockReset className="w-6 h-6" />
                    <span>Send Reset Link</span>
                  </div>}
                </Button>

              </form>

              <div className="pt-6  flex justify-center">
                <Link to="/login" className="flex items-center gap-1.5 text-sm font-semibold text-secondary-700 hover:text-secondary-800 transition-colors">
                  <TbArrowBack className="text-base" /> Back to Sign In
                </Link>
              </div>
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

export default ForgotPasswordPage;