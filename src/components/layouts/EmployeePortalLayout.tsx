import React, { createContext, useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import {
  FiGrid,
  FiFileText,
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiUser,
  FiLogOut,
  FiBell,
  FiSettings,
  FiMenu,
} from "react-icons/fi";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { dummyExpenses, dummyLoans, dummyPayslips } from "../../pages/portal/portalDummyData";

type ToastTone = "info" | "success" | "warning" | "error";

export type PortalToast = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

type PortalToastContextValue = {
  pushToast: (t: Omit<PortalToast, "id">) => void;
};

export const PortalToastContext = createContext<PortalToastContextValue | null>(null);

export const usePortalToast = () => {
  const ctx = React.useContext(PortalToastContext);
  if (!ctx) throw new Error("usePortalToast must be used within EmployeePortalLayout");
  return ctx.pushToast;
};

const formatInitials = (firstName?: string, lastName?: string) => {
  const a = firstName?.trim()?.[0] || "";
  const b = lastName?.trim()?.[0] || "";
  return `${a}${b}`.toUpperCase() || "?";
};

const getGreeting = () => {
  const hr = new Date().getHours();
  return hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
};

const SidebarContent: React.FC<{
  user: any;
  onLogout: () => void;
  onNav: () => void;
}> = ({ user, onLogout, onNav }) => {
  const location = useLocation();

  const payslipCount = dummyPayslips.length;
  const activeLoans = dummyLoans.filter((l) => l.status === "active").length;
  const pendingExpenses = dummyExpenses.filter((e) => e.status === "pending").length;

  const initials = formatInitials(user?.firstName, user?.lastName);
  const roleLabel = user?.role ? String(user.role) : user?.roles?.includes("employee") ? "Employee" : "Employee";

  const NavItem: React.FC<{
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
  }> = ({ to, icon: Icon, label, badge }) => (
    <NavLink
      to={to}
      onClick={onNav}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 relative",
          isActive
            ? "bg-primary-50 text-primary-800 border border-primary-100 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
        )
      }
    >
      <Icon
        className={clsx(
          "w-4 h-4 transition-colors flex-shrink-0",
          location.pathname === to || location.pathname.startsWith(to + "/")
            ? "text-primary-700"
            : "text-gray-400 group-hover:text-primary-700"
        )}
      />
      <span className="text-[13px] font-semibold tracking-tight truncate">{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span
          className={clsx(
            "ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
            label === "Payslips" ? "bg-primary-100 text-primary-800" : "bg-secondary-100 text-secondary-800"
          )}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-7 pb-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-sm flex items-center justify-center shrink-0">
            <span className="text-white font-black text-[14px]">P</span>
          </div>
          <div>
            <p className="text-[14px] font-black text-gray-900 leading-tight tracking-tight">PayrollHQ</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] leading-tight">Employee Portal</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-3 border border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-[13px]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">{user?.firstName || "Employee"} {user?.lastName || ""}</p>
            <p className="text-[11px] text-gray-500 font-semibold truncate capitalize">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.14em] px-3 pb-3">Overview</div>
          <div className="space-y-2">
            <NavItem to="/portal/dashboard" icon={FiGrid} label="Dashboard" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.14em] px-3 pb-3">Compensation</div>
          <div className="space-y-2">
            <NavItem to="/portal/salary-history" icon={FiTrendingUp} label="Salary History" />
            <NavItem to="/portal/payslips" icon={FiFileText} label="Payslips" badge={payslipCount} />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.14em] px-3 pb-3">Finance</div>
          <div className="space-y-2">
            <NavItem to="/portal/loans" icon={FiCreditCard} label="Loans" badge={activeLoans} />
            <NavItem to="/portal/expenses" icon={FiDollarSign} label="Expenses" badge={pendingExpenses} />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.14em] px-3 pb-3">Account</div>
          <div className="space-y-2">
            <NavItem to="/portal/profile" icon={FiUser} label="My Profile" />
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="text-[13px] font-semibold">Sign out</span>
        </button>
      </div>
    </div>
  );
};

const ToastViewport: React.FC<{ toasts: PortalToast[] }> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            "max-w-[360px] bg-white border rounded-2xl shadow-sm px-4 py-3 backdrop-blur-sm",
            t.tone === "success" && "border-secondary-100",
            t.tone === "warning" && "border-primary-100",
            t.tone === "error" && "border-red-100",
            t.tone === "info" && "border-gray-100"
          )}
        >
          <div className="text-[13px] font-black text-gray-900">{t.title}</div>
          {t.message && <div className="text-[12px] text-gray-500 font-semibold mt-0.5">{t.message}</div>}
        </div>
      ))}
    </div>
  );
};

const EmployeePortalLayout: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<PortalToast[]>([]);

  useEffect(() => {
    let alive = true;

    const refresh = async () => {
      try {
        const r = await api.get("/auth/me");
        if (alive && r.data?.user) setUser(r.data.user);
      } catch {
        // ignore: auth-only refresh
      }
    };

    refresh();

    const onVis = () => document.visibilityState === "visible" && refresh();
    const onFocus = () => refresh();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [setUser]);

  const pushToast = (t: Omit<PortalToast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: PortalToast = { ...t, id };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const greeting = getGreeting();

  const topbar = useMemo(() => {
    const first = user?.firstName || "Employee";
    const last = user?.lastName || "";
    const name = `${first} ${last}`.trim();

    if (location.pathname === "/portal/dashboard") {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-black text-primary-700 uppercase tracking-wider">Good {greeting}</span>
          <span className="text-[16px] font-black text-gray-900 tracking-tight">{name.split(" ")[0]}</span>
        </div>
      );
    }

    if (location.pathname === "/portal/salary-history") return <>Salary <span className="text-primary-700">History</span></>;
    if (location.pathname === "/portal/payslips") return <>My <span className="text-primary-700">Payslips</span></>;
    if (location.pathname === "/portal/loans") return <>My <span className="text-primary-700">Loans</span></>;
    if (location.pathname === "/portal/expenses") return <>My <span className="text-primary-700">Expenses</span></>;
    if (location.pathname === "/portal/profile") return <>My <span className="text-primary-700">Profile</span></>;
    return <>Employee <span className="text-primary-700">Portal</span></>;
  }, [greeting, location.pathname, user?.firstName, user?.lastName]);

  return (
    <PortalToastContext.Provider value={{ pushToast }}>
      <div className="min-h-screen bg-white">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="lg:flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-[280px] bg-white border-r border-gray-100 h-screen sticky top-0 z-10">
            <SidebarContent user={user} onLogout={handleLogout} onNav={() => {}} />
          </aside>

          {/* Mobile sidebar */}
          <aside
            className={clsx(
              "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 transform transition-transform duration-300 lg:hidden",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarContent user={user} onLogout={handleLogout} onNav={() => setIsSidebarOpen(false)} />
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 bg-white/85 backdrop-blur border-b border-gray-100 flex items-center px-4 md:px-6 gap-3 flex-shrink-0 sticky top-0 z-30">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <FiMenu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-gray-500 font-semibold uppercase tracking-wider">
                  Employee Portal
                </div>
                <div className="text-[22px] lg:text-[24px] font-black text-gray-900 tracking-tight leading-tight truncate">
                  {topbar}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    pushToast({
                      tone: "info",
                      title: "No new notifications",
                      message: "All caught up (dummy).",
                    })
                  }
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors relative"
                >
                  <FiBell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button
                  onClick={() =>
                    pushToast({
                      tone: "info",
                      title: "Settings",
                      message: "Opening account settings (dummy).",
                    })
                  }
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors"
                >
                  <FiSettings className="w-5 h-5 text-gray-600" />
                </button>

                {/* Desktop user quick chip (optional) */}
                <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-2 bg-white">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                    <span className="text-white font-black text-[12px]">{formatInitials(user?.firstName, user?.lastName)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-gray-900 truncate leading-tight">
                      {user?.firstName || "Employee"} {user?.lastName || ""}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.12em] truncate">
                      {user?.role || "Employee"}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        <ToastViewport toasts={toasts} />
      </div>
    </PortalToastContext.Provider>
  );
};

export default EmployeePortalLayout;

