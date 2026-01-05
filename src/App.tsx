import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import ErrorBoundary from "./components/ErrorBoundary";
import api from "./services/api";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";

// Public Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Onboarding
import OnboardingWizard from "./pages/onboarding/OnboardingWizard";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import DepartmentsPage from "./pages/departments/DepartmentsPage";
import EmployeesPage from "./pages/employees/EmployeesPage";

// Admin Pages
import RolesPage from "./pages/admin/RolesPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

// Salary Pages
import ComponentsPage from "./pages/salary/ComponentsPage";
import EmployeeSalaryPage from "./pages/salary/EmployeeSalaryPage";

// Payroll Pages
import PeriodsPage from "./pages/payroll/PeriodsPage";
import ReviewPayrollPage from "./pages/payroll/ReviewPayrollPage";
import PayslipViewer from "./pages/payroll/PayslipViewer";

// Expense Pages
import CategoriesPage from "./pages/expenses/CategoriesPage";
import SubmitExpensePage from "./pages/expenses/SubmitExpensePage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ExpenseDetailPage from "./pages/expenses/ExpenseDetailPage";
import MyExpensesPage from "./pages/expenses/MyExpensesPage";

// Loan Pages
import LoansPage from "./pages/loans/LoansPage";
import LoanDetailPage from "./pages/loans/LoanDetailPage";

// Report Pages
import ReportsPage from "./pages/reports/ReportsPage";
import PayrollReportsPage from "./pages/reports/PayrollReportsPage";
import ExpenseReportsPage from "./pages/reports/ExpenseReportsPage";

// System Admin Pages
import TenantsPage from "./pages/system-admin/TenantsPage";
import SystemStatsPage from "./pages/system-admin/SystemStatsPage";

// Settings Pages
import NotificationPreferencesPage from "./pages/settings/NotificationPreferences";

// Admin Pages (continued)
import DataChangeHistoryPage from "./pages/admin/DataChangeHistoryPage";
import SettingsPage from "./pages/admin/SettingsPage";
import StatutoryRatesPage from "./pages/admin/StatutoryRatesPage";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = React.useState<
    boolean | null
  >(null);

  React.useEffect(() => {
    // Check onboarding status for tenant users (non-blocking)
    if (isAuthenticated && user && !user.isSystemAdmin && user.tenantId) {
      api
        .get("/auth/me")
        .then((response) => {
          const tenant = response.data.user?.tenant;
          const isComplete = tenant?.settings?.onboardingComplete === true;
          setOnboardingComplete(isComplete);
        })
        .catch(() => {
          // If we can't check, assume complete to not block navigation
          setOnboardingComplete(true);
        });
    } else {
      setOnboardingComplete(true); // System admins or no tenant don't need onboarding
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect system admins away from tenant routes
  if (
    user?.isSystemAdmin &&
    location.pathname !== "/system-admin" &&
    !location.pathname.startsWith("/system-admin")
  ) {
    return <Navigate to="/system-admin/stats" replace />;
  }

  // Redirect tenant users away from system admin routes
  if (!user?.isSystemAdmin && location.pathname.startsWith("/system-admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Only redirect away from onboarding if it's already complete
  // Don't block navigation if onboarding is incomplete - it's optional
  if (
    !user?.isSystemAdmin &&
    onboardingComplete === true &&
    location.pathname === "/onboarding"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// System Admin Route Component
function SystemAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isSystemAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route
            path="employees/:employeeId/salary"
            element={<EmployeeSalaryPage />}
          />
          <Route path="salary/components" element={<ComponentsPage />} />
          <Route path="payroll/periods" element={<PeriodsPage />} />
          <Route
            path="payroll/periods/:periodId/review"
            element={<ReviewPayrollPage />}
          />
          <Route
            path="payroll/payslips/:payrollId"
            element={<PayslipViewer />}
          />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="expenses/submit" element={<SubmitExpensePage />} />
          <Route path="expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="expenses/categories" element={<CategoriesPage />} />
          <Route path="my-expenses" element={<MyExpensesPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:id" element={<LoanDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/payroll" element={<PayrollReportsPage />} />
          <Route path="reports/expenses" element={<ExpenseReportsPage />} />
          <Route path="admin/roles" element={<RolesPage />} />
          <Route path="admin/permissions" element={<PermissionsPage />} />
          <Route path="admin/audit-logs" element={<AuditLogsPage />} />
          <Route
            path="admin/data-change-history"
            element={<DataChangeHistoryPage />}
          />
          <Route path="admin/settings" element={<SettingsPage />} />
          <Route
            path="admin/statutory-rates"
            element={<StatutoryRatesPage />}
          />
          <Route
            path="settings/notifications"
            element={<NotificationPreferencesPage />}
          />
        </Route>

        {/* System Admin Routes */}
        <Route
          path="/system-admin"
          element={
            <SystemAdminRoute>
              <DashboardLayout />
            </SystemAdminRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/system-admin/stats" replace />}
          />
          <Route path="stats" element={<SystemStatsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
