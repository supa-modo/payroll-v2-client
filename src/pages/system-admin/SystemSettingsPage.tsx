import React, { useState } from "react";
import { FiBell, FiServer, FiShield, FiCpu } from "react-icons/fi";
import NotificationConfigTab from "../../components/system-admin/NotificationConfigTab";
import SystemConfigTab from "../../components/system-admin/SystemConfigTab";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  const tabs: Tab[] = [
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "system", label: "System", icon: FiServer },
    { id: "security", label: "Security", icon: FiShield },
    { id: "integrations", label: "Integrations", icon: FiCpu },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure system-wide settings and notification preferences
        </p>
      </div>

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
          {activeTab === "notifications" && <NotificationConfigTab />}
          {activeTab === "system" && <SystemConfigTab />}
          {activeTab === "security" && (
            <div className="text-center py-12 text-gray-500">
              Security settings coming soon
            </div>
          )}
          {activeTab === "integrations" && (
            <div className="text-center py-12 text-gray-500">
              Integration settings coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
