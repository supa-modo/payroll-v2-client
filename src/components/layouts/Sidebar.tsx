import { Link, useLocation } from "react-router-dom";
import {
  FiTrendingUp, FiChevronLeft, FiChevronRight,
  FiX
} from "react-icons/fi";
import { clsx } from "clsx";
import { useAuthStore } from "../../store/authStore";
import { TbBriefcase, TbCalendarDot, TbCoins, TbDatabaseCog, TbMoneybag, TbPresentationAnalyticsFilled, TbSettings, TbShieldHalfFilled, TbShieldLockFilled, TbTags, TbTagsFilled } from "react-icons/tb";
import { PiHandCoinsDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { MdSpaceDashboard } from "react-icons/md";

interface SidebarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleSidebar, isMobile }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isSystemAdmin = user?.isSystemAdmin || false;

  const menuItems = isSystemAdmin
    ? [
      { path: "/system-admin/stats", label: "System Stats", icon: FiTrendingUp },
      { path: "/system-admin/tenants", label: "Tenants", icon: TbDatabaseCog },
      { path: "/system-admin/settings", label: "Settings", icon: TbSettings },
    ]
    : [
      { path: "/dashboard", label: "Dashboard", icon: MdSpaceDashboard },
      { path: "/departments", label: "Departments", icon: TbBriefcase },
      { path: "/employees", label: "Employees", icon: PiUsersThreeDuotone },
      { path: "/salary/components", label: "Salary Components", icon: TbMoneybag },
      { path: "/payroll/periods", label: "Payroll Periods", icon: TbCalendarDot },
      { path: "/expenses", label: "Expenses", icon: TbCoins },
      { path: "/my-expenses", label: "My Expenses", icon: TbTags },
      { path: "/loans", label: "Loans", icon: PiHandCoinsDuotone },
      { path: "/reports", label: "Reports", icon: TbPresentationAnalyticsFilled },
    ];

  const adminMenuItems = [
    { path: "/expenses/categories", label: "Expense Categories", icon: TbTagsFilled },
    { path: "/admin/roles", label: "Roles", icon: TbShieldHalfFilled },
    { path: "/admin/permissions", label: "Permissions", icon: TbShieldLockFilled },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: TbDatabaseCog },
    { path: "/admin/settings", label: "Settings", icon: TbSettings },
    { path: "/admin/statutory-rates", label: "Statutory Rates", icon: TbMoneybag },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ item }: { item: { path: string; label: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={() => isMobile && onToggleSidebar()}
        title={collapsed && !isMobile ? item.label : undefined}
        className={clsx(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-r-xl transition-all duration-200",
          active
            ? "bg-secondary-600 text-white"
            : "text-slate-300 hover:bg-white/35 hover:text-slate-200"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full bg-white" />
        )}
        <span className={clsx(
          "shrink-0 transition-colors",
          active ? "text-white" : "text-slate-300 group-hover:text-slate-200"
        )}>
          <Icon className="w-[1.3rem] h-[1.3rem]" />
        </span>
        {(!collapsed || isMobile) && (
          <span className={clsx(
            "text-[0.93rem] font-medium tracking-tight whitespace-nowrap transition-colors",
            active ? "text-white" : "text-slate-300 group-hover:text-slate-100"
          )}>
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div className="fixed inset-0 bg-primary-600/60 backdrop-blur-sm z-40 lg:hidden" onClick={onToggleSidebar} />
      )}

      <aside
        style={{ background: "linear-gradient(160deg,#1d4ed8 0%,#1e40af 45%,#1e3a8a 100%)" }}
        className={clsx(
          "relative border-r border-primary-600 transition-all duration-300 ease-in-out z-50 shrink-0 flex flex-col",
          collapsed && !isMobile ? "w-[68px]" : "w-[256px]",
          isMobile && (collapsed
            ? "fixed -translate-x-full inset-y-0 left-0 w-[256px]"
            : "fixed translate-x-0 inset-y-0 left-0 w-[256px]"
          )
        )}
      >
        {/* dot texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='7' cy='7' r='1.2'/%3E%3Ccircle cx='27' cy='7' r='1.2'/%3E%3Ccircle cx='47' cy='7' r='1.2'/%3E%3Ccircle cx='7' cy='27' r='1.2'/%3E%3Ccircle cx='27' cy='27' r='1.2'/%3E%3Ccircle cx='47' cy='27' r='1.2'/%3E%3Ccircle cx='7' cy='47' r='1.2'/%3E%3Ccircle cx='27' cy='47' r='1.2'/%3E%3Ccircle cx='47' cy='47' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* decorative rings */}
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full border-40 border-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-30 h-30 rounded-full border-24 border-white/6 pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border-32 border-white/5 pointer-events-none" />


        {/* Logo */}
        <div className={clsx(
          "flex items-center h-18 px-4 border-b border-white/30 shrink-0",
          collapsed && !isMobile ? "justify-center" : "justify-between"
        )}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 shrink-0">
                <span className="text-white font-extrabold text-sm">P</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">PayrollHQ</p>
                <p className="text-slate-300 text-[0.9rem] mt-0.5 font-semibold">
                  {isSystemAdmin ? "System" : "Admin"}
                </p>
              </div>
            </div>
          )}
          {collapsed && !isMobile && (
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <span className="text-white font-extrabold text-sm">P</span>
            </div>
          )}
          {isMobile && (
            <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors ml-auto">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-0.5">

          {menuItems.map(item => <NavItem key={item.path} item={item} />)}

          {!isSystemAdmin && (
            <>
              <div className="pt-3 pb-0.5">
                {(!collapsed || isMobile) ? (
                  <p className="text-[0.8rem] font-bold text-slate-400 uppercase tracking-[0.13em] px-3 pt-2 pb-1">
                    Administration
                  </p>
                ) : <div className="mx-2 my-2 h-px bg-white/40" />}
              </div>
              {adminMenuItems.map(item => <NavItem key={item.path} item={item} />)}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        {!isMobile && (
          <div className="z-100 border-t border-white/30 p-2.5 shrink-0">
            <button
              onClick={onToggleSidebar}
              className={clsx(
                "w-full flex items-center py-2 px-3 rounded-xl text-slate-300 bg-white/5 hover:bg-white/15 hover:text-slate-200 transition-all duration-200",
                collapsed ? "justify-center" : "justify-between"
              )}
            >
              {!collapsed && <span className="text-[0.9rem] font-medium">Collapse</span>}
              {collapsed
                ? <FiChevronRight className="w-4  h-4 text-slate-200 " />
                : <FiChevronLeft className="w-4 h-4" />
              }
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;