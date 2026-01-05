import React, { useState, useEffect } from "react";
import { FiBell, FiMail, FiSmartphone } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import api from "../../services/api";

interface NotificationPreferences {
  emailPayslip: boolean;
  emailExpenseStatus: boolean;
  emailApprovalRequired: boolean;
  inappPayslip: boolean;
  inappExpenseStatus: boolean;
  inappApprovalRequired: boolean;
}

const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailPayslip: true,
    emailExpenseStatus: true,
    emailApprovalRequired: true,
    inappPayslip: true,
    inappExpenseStatus: true,
    inappApprovalRequired: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/notifications/preferences");
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put("/notifications/preferences", preferences);
      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save preferences:", error);
      alert(error.response?.data?.error || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notification Preferences
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-md px-4 py-3">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        {/* Payslip Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Payslip Notifications
            </h2>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Email notifications</span>
              </div>
              <Checkbox
                checked={preferences.emailPayslip}
                onChange={() => handleToggle("emailPayslip")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSmartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">In-app notifications</span>
              </div>
              <Checkbox
                checked={preferences.inappPayslip}
                onChange={() => handleToggle("inappPayslip")}
              />
            </div>
          </div>
        </div>

        {/* Expense Status Notifications */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Expense Status Notifications
            </h2>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Email notifications</span>
              </div>
              <Checkbox
                checked={preferences.emailExpenseStatus}
                onChange={() => handleToggle("emailExpenseStatus")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSmartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">In-app notifications</span>
              </div>
              <Checkbox
                checked={preferences.inappExpenseStatus}
                onChange={() => handleToggle("inappExpenseStatus")}
              />
            </div>
          </div>
        </div>

        {/* Approval Required Notifications */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Approval Required Notifications
            </h2>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Email notifications</span>
              </div>
              <Checkbox
                checked={preferences.emailApprovalRequired}
                onChange={() => handleToggle("emailApprovalRequired")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSmartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">In-app notifications</span>
              </div>
              <Checkbox
                checked={preferences.inappApprovalRequired}
                onChange={() => handleToggle("inappApprovalRequired")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;

