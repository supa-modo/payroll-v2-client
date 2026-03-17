import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiCheck, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";
import AuthLeftPanel from "@/components/ui/AuthLeftPanel";
import { TbArrowBack, TbClock, TbLockFilled, TbShieldHalfFilled, TbTrendingUp } from "react-icons/tb";
import { PiPasswordDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { MdLockReset } from "react-icons/md";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

/* ── password strength helper ── */
const getStrength = (pw: string) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-rose-400", width: "w-1/4" };
  if (score <= 2) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
  if (score <= 3) return { label: "Good", color: "bg-sky-400", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

/* ══════════════════════════════════════════════
   RESET PASSWORD PAGE
   ══════════════════════════════════════════════ */
const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token");
    setToken(t);
  }, [searchParams]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData(p => ({ ...p, [name]: value }));
  //   if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  // };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8) e.password = "Must be at least 8 characters";
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;
    setIsSubmitting(true);
    try {
      const r = await api.post("/auth/reset-password", { token, password: formData.password });
      if (r.status === 200) {
        setIsSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err: any) {
      setErrors({ password: err.response?.data?.error || "Failed to reset password. The link may have expired." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getStrength(formData.password);

  /* ── invalid token ── */
  if (token === null && searchParams.has("token") === false) {
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
            heading={<>Account Password<br /><span className="text-sky-300">recovery.</span></>}
            sub="We'll send a secure password reset link straight to your inbox. Check your email and follow the instructions."
            features={[
              { icon: <TbShieldHalfFilled size={22} />, text: "Secure reset link via email" },
              { icon: <TbClock size={22} />, text: "Link expires after 30 minutes" },
              { icon: <PiUsersThreeDuotone size={22} />, text: "Your account data stays protected" },
              { icon: <TbTrendingUp size={22} />, text: "Instant access once reset" },
            ]}
          />
          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-md auth-animate">
              <div className="bg-white rounded-4xl shadow-[0_8px_40px_rgba(37,99,235,0.10),0_0_0_1px_rgba(37,99,235,0.07)] lg:p-8 p-6 text-center flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-500 text-2xl">
                  <TbLockFilled className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold font-google text-red-600 mb-2">Invalid reset link</h2>
                  <p className="text-sm font-source text-gray-600 leading-relaxed">This password reset link is invalid or has already been used. Request a new one.</p>
                </div>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full">
                  <div className="flex items-center justify-center gap-2">
                    <MdLockReset className="w-5 h-5" />
                    <span>Request New Link</span></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── success ── */
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
          <AuthLeftPanel
            heading={<>Reset Your Account<br /><span className="text-sky-300">Password.</span></>}
            sub="Choose a strong password. You'll use it every time you sign in."
            features={[
              { icon: <TbShieldHalfFilled size={22} />, text: "Strong password" },
              { icon: <TbClock size={22} />, text: "Your account data stays protected" },
              { icon: <PiUsersThreeDuotone size={22} />, text: "Instant access once reset" },
              { icon: <TbTrendingUp size={22} />, text: "Instant access once reset" },
            ]}
          />
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md auth-animate">
              <div className="bg-white rounded-4xl shadow-[0_8px_40px_rgba(37,99,235,0.10),0_0_0_1px_rgba(37,99,235,0.07)] px-8 py-10 flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-secondary-600 border border-secondary-800 flex items-center justify-center text-secondary-600 text-2xl">
                  <FiCheckCircle className="text-white w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold font-google text-gray-700 mb-2">Password updated!</h2>
                  <p className="text-sm font-source text-gray-600 leading-relaxed">
                    Your password has been reset successfully. Redirecting you to sign in…
                  </p>
                </div>

                <div className="w-[80%] h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-700 rounded-full animate-[grow_3s_linear_both]" style={{ animation: "grow 3s linear both" }} />
                </div>
                <style>{`@keyframes grow { from{width:0%} to{width:100%} }`}</style>
                <Link to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-secondary-700 hover:bg-secondary-800 text-white font-semibold py-3 rounded-full text-sm shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all duration-200">
                  Go to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── main form ── */
  return (
    <>
      <FontStyle />
      <div className="pjs min-h-screen flex flex-col lg:flex-row bg-[#f0f5ff]"
        style={{
          backgroundImage: `url("/loginbg.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}>
        <div className="absolute inset-0 bg-linear-to-b lg:bg-linear-to-br from-white via-white/80 to-blue-500/0 backdrop-blur-[2px]" />
        <AuthLeftPanel
          heading={<>Reset Your Account<br /><span className="text-sky-300">Password.</span></>}
          sub="Choose a strong password. You'll use it every time you sign in."
          features={[
            { icon: <TbShieldHalfFilled size={22} />, text: "Strong password to protect your account" },
            { icon: <TbClock size={22} />, text: "Link expires after 30 minutes" },
            { icon: <TbTrendingUp size={22} />, text: "Instant access once password is reset" },
          ]}
        />

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
                <h2 className="text-xl lg:text-2xl font-extrabold font-google text-slate-900 mb-1">Set a new password</h2>
                <p className="text-sm lg:text-base text-slate-500">Choose a strong password. You'll use it every time you sign in.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* New password */}
                <Input
                  label="Password"

                  labelClassName="text-gray-600"
                  type={showPw ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  rightIcon={showPw ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  leftIcon={<PiPasswordDuotone className="w-4 h-4 text-gray-600" />}
                  OnClickRightIcon={() => setShowPw(v => !v)}
                  error={errors.password}
                  required={true}
                  className="text-sm"
                />

                {/* Strength meter */}
                {formData.password && strength && (
                  <div className="-mt-2 mx-2  flex flex-col gap-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-xs font-semibold pl-0.5 ${strength.label === "Strong" ? "text-emerald-600" :
                      strength.label === "Good" ? "text-sky-600" :
                        strength.label === "Fair" ? "text-amber-600" : "text-rose-500"
                      }`}>
                      {strength.label} password
                    </p>
                  </div>
                )}

                {/* Confirm password */}
                <Input
                  label="Confirm password"
                  labelClassName="text-gray-600"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter your password"
                  rightIcon={showConfirm ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  leftIcon={<PiPasswordDuotone className="w-4 h-4 text-gray-600" />}
                  OnClickRightIcon={() => setShowConfirm(v => !v)}
                  error={errors.confirmPassword}
                  required={true}
                  className="text-sm"
                />
                {/* Match indicator */}
                {formData.confirmPassword && formData.password && (
                  <p className={`-mt-4 pl-2 text-xs font-semibold flex items-center gap-1 ${formData.password === formData.confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                    {formData.password === formData.confirmPassword
                      ? <><FiCheck className="text-xs" /> Passwords match</>
                      : "Passwords do not match"}
                  </p>
                )}


                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdLockReset className="w-5 h-5" />
                      <span>Reset Password</span>
                    </div>
                  )}
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

export default ResetPasswordPage;