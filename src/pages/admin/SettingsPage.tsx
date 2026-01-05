import React, { useState, useEffect } from "react";
import { FiSettings, FiDollarSign, FiTag, FiImage } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import api from "../../services/api";

interface Setting {
  id: string;
  key: string;
  value: Record<string, any>;
  description?: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/settings");
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (category: string) => {
    try {
      setIsSaving(true);
      const categorySettings = settings[category] || [];
      
      // Save each setting in the category
      await Promise.all(
        categorySettings.map((setting) =>
          api.put(`/settings/${setting.key}`, { value: setting.value })
        )
      );

      setSuccessMessage(`${category} settings saved successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      alert(error.response?.data?.error || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings((prev) => {
      const updated = { ...prev };
      if (!updated[category]) {
        updated[category] = [];
      }
      const settingIndex = updated[category].findIndex((s) => s.key === key);
      if (settingIndex >= 0) {
        updated[category][settingIndex] = {
          ...updated[category][settingIndex],
          value,
        };
      } else {
        updated[category].push({ id: "", key, value, description: "" });
      }
      return updated;
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "payroll", label: "Payroll", icon: FiDollarSign },
    { id: "expense", label: "Expenses", icon: FiTag },
    { id: "branding", label: "Company Branding", icon: FiImage },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-md px-4 py-3">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                General Settings
              </h2>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={
                    settings.general?.find((s) => s.key === "company:name")
                      ?.value?.name || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("general", "company:name", {
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  label="Company Email"
                  type="email"
                  value={
                    settings.general?.find((s) => s.key === "company:email")
                      ?.value?.email || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("general", "company:email", {
                      email: e.target.value,
                    })
                  }
                />
                <Input
                  label="Company Phone"
                  value={
                    settings.general?.find((s) => s.key === "company:phone")
                      ?.value?.phone || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("general", "company:phone", {
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => handleSave("general")}
                  isLoading={isSaving}
                >
                  Save General Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Payroll Settings
              </h2>
              <div className="space-y-4">
                <Input
                  label="Pay Day (Day of Month)"
                  type="number"
                  min="1"
                  max="31"
                  value={
                    settings.payroll?.find((s) => s.key === "payroll:payDay")
                      ?.value?.payDay || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("payroll", "payroll:payDay", {
                      payDay: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Require Approval Before Processing
                  </label>
                  <select
                    value={
                      settings.payroll?.find(
                        (s) => s.key === "payroll:requireApproval"
                      )?.value?.requireApproval || "true"
                    }
                    onChange={(e) =>
                      handleSettingChange(
                        "payroll",
                        "payroll:requireApproval",
                        { requireApproval: e.target.value === "true" }
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => handleSave("payroll")}
                  isLoading={isSaving}
                >
                  Save Payroll Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === "expense" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Expense Settings
              </h2>
              <div className="space-y-4">
                <Input
                  label="Default Approval Limit (KES)"
                  type="number"
                  value={
                    settings.expense?.find(
                      (s) => s.key === "expense:defaultLimit"
                    )?.value?.limit || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("expense", "expense:defaultLimit", {
                      limit: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Textarea
                  label="Expense Policy"
                  value={
                    settings.expense?.find(
                      (s) => s.key === "expense:policy"
                    )?.value?.policy || ""
                  }
                  onChange={(e) =>
                    handleSettingChange("expense", "expense:policy", {
                      policy: e.target.value,
                    })
                  }
                  rows={5}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => handleSave("expense")}
                  isLoading={isSaving}
                >
                  Save Expense Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Company Branding
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Logo URL
                  </label>
                  <Input
                    value={
                      settings.branding?.find((s) => s.key === "branding:logo")
                        ?.value?.logoUrl || ""
                    }
                    onChange={(e) =>
                      handleSettingChange("branding", "branding:logo", {
                        logoUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.branding?.find((s) => s.key === "branding:logo")
                    ?.value?.logoUrl && (
                    <div className="mt-2">
                      <img
                        src={
                          settings.branding.find((s) => s.key === "branding:logo")
                            ?.value?.logoUrl
                        }
                        alt="Logo preview"
                        className="h-20 w-auto"
                      />
                    </div>
                  )}
                </div>
                <Input
                  label="Primary Color"
                  type="color"
                  value={
                    settings.branding?.find(
                      (s) => s.key === "branding:primaryColor"
                    )?.value?.color || "#10b981"
                  }
                  onChange={(e) =>
                    handleSettingChange("branding", "branding:primaryColor", {
                      color: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => handleSave("branding")}
                  isLoading={isSaving}
                >
                  Save Branding Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

