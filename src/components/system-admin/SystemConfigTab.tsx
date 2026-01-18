import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import api from "../../services/api";

interface Setting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category?: string;
}

const SystemConfigTab: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/system-admin/settings");
      setSettings(response.data.settings || {});
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
      setErrorMessage(error.response?.data?.error || "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (category: string) => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const categorySettings = settings[category] || [];
      
      await Promise.all(
        categorySettings.map((setting) =>
          api.put(`/system-admin/settings/${setting.key}`, {
            value: setting.value,
            description: setting.description,
            category: setting.category,
          })
        )
      );

      setSuccessMessage(`${category} settings saved successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      setErrorMessage(error.response?.data?.error || "Failed to save settings");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-md px-4 py-3">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-3">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-600">
          Configure general system-wide settings. These settings apply to all tenants.
        </p>

        {/* General Settings */}
        {settings.general && settings.general.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-800">General Settings</h3>
            <div className="space-y-4">
              {settings.general.map((setting) => (
                <div key={setting.key}>
                  <Input
                    label={setting.key.replace(/:/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    value={
                      typeof setting.value === "object"
                        ? JSON.stringify(setting.value)
                        : String(setting.value || "")
                    }
                    onChange={(e) => {
                      let value: any = e.target.value;
                      try {
                        value = JSON.parse(value);
                      } catch {
                        // Keep as string
                      }
                      handleSettingChange("general", setting.key, value);
                    }}
                    description={setting.description}
                  />
                </div>
              ))}
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

        {Object.keys(settings).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No system settings configured yet. Settings will appear here once created.
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemConfigTab;
