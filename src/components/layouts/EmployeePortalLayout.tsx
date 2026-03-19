import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { to: "/portal/dashboard", label: "Dashboard" },
  { to: "/portal/payslips", label: "Payslips" },
  { to: "/portal/salary-history", label: "Salary" },
  { to: "/portal/expenses", label: "Expenses" },
  { to: "/portal/loans", label: "Loans" },
  { to: "/portal/profile", label: "Profile" },
];

const EmployeePortalLayout: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Employee Portal</p>
            <h1 className="text-base font-semibold text-slate-900">
              {user?.firstName || "Employee"} {user?.lastName || ""}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:static lg:border-t-0 lg:bg-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-3 lg:flex lg:flex-wrap gap-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-xs lg:text-sm px-3 py-2 rounded-lg text-center ${
                  isActive
                    ? "bg-primary-100 text-primary-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default EmployeePortalLayout;
