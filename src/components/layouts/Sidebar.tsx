import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiBriefcase, FiX, FiShield, FiSettings, FiDollarSign, FiCalendar, FiFileText, FiTag, FiCreditCard, FiBarChart2, FiDatabase, FiTrendingUp } from "react-icons/fi";
import { clsx } from "clsx";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleSidebar,
  isMobile,
}) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isSystemAdmin = user?.isSystemAdmin || false;

  const menuItems = isSystemAdmin
    ? [
        { path: "/system-admin/stats", label: "System Stats", icon: FiTrendingUp },
        { path: "/system-admin/tenants", label: "Tenants", icon: FiDatabase },
        { path: "/system-admin/settings", label: "Settings", icon: FiSettings },
      ]
    : [
        { path: "/dashboard", label: "Dashboard", icon: FiHome },
        { path: "/departments", label: "Departments", icon: FiBriefcase },
        { path: "/employees", label: "Employees", icon: FiUsers },
        { path: "/salary/components", label: "Salary Components", icon: FiDollarSign },
        { path: "/payroll/periods", label: "Payroll Periods", icon: FiCalendar },
        { path: "/expenses", label: "Expenses", icon: FiFileText },
        { path: "/my-expenses", label: "My Expenses", icon: FiFileText },
        { path: "/loans", label: "Loans", icon: FiCreditCard },
        { path: "/reports", label: "Reports", icon: FiBarChart2 },
      ];

  const adminMenuItems = [
    { path: "/expenses/categories", label: "Expense Categories", icon: FiTag },
    { path: "/admin/roles", label: "Roles", icon: FiShield },
    { path: "/admin/permissions", label: "Permissions", icon: FiSettings },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: FiDatabase },
    { path: "/admin/settings", label: "Settings", icon: FiSettings },
    { path: "/admin/statutory-rates", label: "Statutory Rates", icon: FiDollarSign },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-white border-r border-gray-200 transition-all duration-300 z-50",
          collapsed && !isMobile
            ? "w-20"
            : collapsed && isMobile
              ? "-translate-x-full"
              : "w-64",
          isMobile && "fixed inset-y-0 left-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {!collapsed && (
              <h2 className="text-lg font-bold text-gray-900">Payroll</h2>
            )}
            {isMobile && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && onToggleSidebar()}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {/* Admin Section - Only show for tenant users */}
            {!isSystemAdmin && !collapsed && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="px-4 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </span>
                </div>
              </div>
            )}

            {!isSystemAdmin && adminMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && onToggleSidebar()}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

