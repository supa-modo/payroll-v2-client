import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import api from "../../services/api";

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

interface NotificationPreferences {
  expiryDays: number;
  maxRetries: number;
  cleanupInterval: number;
}

interface BullMQConfig {
  concurrency: {
    email: number;
    push: number;
    sms: number;
  };
  limiter: {
    email: { max: number; duration: number };
    push: { max: number; duration: number };
    sms: { max: number; duration: number };
  };
}

interface NotificationConfig {
  redis: RedisConfig;
  smtp: SMTPConfig;
  preferences: NotificationPreferences;
  bullmq: BullMQConfig;
}

const NotificationConfigTab: React.FC = () => {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [testingRedis, setTestingRedis] = useState(false);
  const [testingSMTP, setTestingSMTP] = useState(false);
  const [redisTestResult, setRedisTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/system-admin/settings/notification-config");
      setConfig(response.data.config);
    } catch (error: any) {
      console.error("Failed to fetch notification config:", error);
      setErrorMessage(error.response?.data?.error || "Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.put("/system-admin/settings/notification-config", {
        config,
      });

      setSuccessMessage("Configuration saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save config:", error);
      setErrorMessage(error.response?.data?.error || "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const testRedisConnection = async () => {
    try {
      setTestingRedis(true);
      setRedisTestResult(null);
      const response = await api.post("/system-admin/settings/notification-config/test/redis");
      setRedisTestResult({
        success: response.data.success,
        message: response.data.message,
      });
    } catch (error: any) {
      setRedisTestResult({
        success: false,
        message: error.response?.data?.message || "Failed to test Redis connection",
      });
    } finally {
      setTestingRedis(false);
    }
  };

  const testSMTPConnection = async () => {
    try {
      setTestingSMTP(true);
      setSmtpTestResult(null);
      const response = await api.post("/system-admin/settings/notification-config/test/smtp");
      setSmtpTestResult({
        success: response.data.success,
        message: response.data.message,
      });
    } catch (error: any) {
      setSmtpTestResult({
        success: false,
        message: error.response?.data?.message || "Failed to test SMTP connection",
      });
    } finally {
      setTestingSMTP(false);
    }
  };

  const updateConfig = (section: keyof NotificationConfig, updates: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        ...updates,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12 text-red-500">
        {errorMessage || "Failed to load configuration"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Redis Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Redis Configuration</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={testRedisConnection}
            isLoading={testingRedis}
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
        </div>
        {redisTestResult && (
          <div
            className={`p-3 rounded-lg ${
              redisTestResult.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {redisTestResult.success ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiX className="w-5 h-5" />
              )}
              <span className="text-sm">{redisTestResult.message}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Host"
            value={config.redis.host}
            onChange={(e) => updateConfig("redis", { host: e.target.value })}
          />
          <Input
            label="Port"
            type="number"
            value={config.redis.port.toString()}
            onChange={(e) =>
              updateConfig("redis", { port: parseInt(e.target.value) || 6379 })
            }
          />
          <Input
            label="Password"
            type="password"
            value={config.redis.password || ""}
            onChange={(e) =>
              updateConfig("redis", { password: e.target.value || undefined })
            }
            placeholder="Leave empty if no password"
          />
          <Input
            label="Database"
            type="number"
            value={config.redis.db.toString()}
            onChange={(e) =>
              updateConfig("redis", { db: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">SMTP Configuration</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={testSMTPConnection}
            isLoading={testingSMTP}
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
        </div>
        {smtpTestResult && (
          <div
            className={`p-3 rounded-lg ${
              smtpTestResult.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {smtpTestResult.success ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiX className="w-5 h-5" />
              )}
              <span className="text-sm">{smtpTestResult.message}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Host"
            value={config.smtp.host}
            onChange={(e) => updateConfig("smtp", { host: e.target.value })}
          />
          <Input
            label="Port"
            type="number"
            value={config.smtp.port.toString()}
            onChange={(e) =>
              updateConfig("smtp", { port: parseInt(e.target.value) || 587 })
            }
          />
          <Input
            label="Username"
            value={config.smtp.user || ""}
            onChange={(e) =>
              updateConfig("smtp", { user: e.target.value || undefined })
            }
          />
          <Input
            label="Password"
            type="password"
            value={config.smtp.pass || ""}
            onChange={(e) =>
              updateConfig("smtp", { pass: e.target.value || undefined })
            }
          />
          <Input
            label="From Email"
            value={config.smtp.from || ""}
            onChange={(e) =>
              updateConfig("smtp", { from: e.target.value || undefined })
            }
            placeholder="Default: Username"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Secure (TLS)
            </label>
            <select
              value={config.smtp.secure ? "true" : "false"}
              onChange={(e) =>
                updateConfig("smtp", { secure: e.target.value === "true" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="true">Yes (Port 465)</option>
              <option value="false">No (Port 587)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Expiry Days"
            type="number"
            value={config.preferences.expiryDays.toString()}
            onChange={(e) =>
              updateConfig("preferences", {
                expiryDays: parseInt(e.target.value) || 30,
              })
            }
            description="Number of days before notifications expire"
          />
          <Input
            label="Max Retries"
            type="number"
            value={config.preferences.maxRetries.toString()}
            onChange={(e) =>
              updateConfig("preferences", {
                maxRetries: parseInt(e.target.value) || 3,
              })
            }
            description="Maximum retry attempts for failed notifications"
          />
          <Input
            label="Cleanup Interval (ms)"
            type="number"
            value={config.preferences.cleanupInterval.toString()}
            onChange={(e) =>
              updateConfig("preferences", {
                cleanupInterval: parseInt(e.target.value) || 86400000,
              })
            }
            description="Interval for cleanup job (milliseconds)"
          />
        </div>
      </div>

      {/* BullMQ Configuration */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">BullMQ Queue Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Concurrency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email Workers"
                type="number"
                value={config.bullmq.concurrency.email.toString()}
                onChange={(e) =>
                  updateConfig("bullmq", {
                    concurrency: {
                      ...config.bullmq.concurrency,
                      email: parseInt(e.target.value) || 5,
                    },
                  })
                }
              />
              <Input
                label="Push Workers"
                type="number"
                value={config.bullmq.concurrency.push.toString()}
                onChange={(e) =>
                  updateConfig("bullmq", {
                    concurrency: {
                      ...config.bullmq.concurrency,
                      push: parseInt(e.target.value) || 10,
                    },
                  })
                }
              />
              <Input
                label="SMS Workers"
                type="number"
                value={config.bullmq.concurrency.sms.toString()}
                onChange={(e) =>
                  updateConfig("bullmq", {
                    concurrency: {
                      ...config.bullmq.concurrency,
                      sms: parseInt(e.target.value) || 5,
                    },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Rate Limiting</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Email Queue</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Jobs"
                    type="number"
                    value={config.bullmq.limiter.email.max.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          email: {
                            ...config.bullmq.limiter.email,
                            max: parseInt(e.target.value) || 100,
                          },
                        },
                      })
                    }
                  />
                  <Input
                    label="Duration (ms)"
                    type="number"
                    value={config.bullmq.limiter.email.duration.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          email: {
                            ...config.bullmq.limiter.email,
                            duration: parseInt(e.target.value) || 60000,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Push Queue</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Jobs"
                    type="number"
                    value={config.bullmq.limiter.push.max.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          push: {
                            ...config.bullmq.limiter.push,
                            max: parseInt(e.target.value) || 1000,
                          },
                        },
                      })
                    }
                  />
                  <Input
                    label="Duration (ms)"
                    type="number"
                    value={config.bullmq.limiter.push.duration.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          push: {
                            ...config.bullmq.limiter.push,
                            duration: parseInt(e.target.value) || 60000,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">SMS Queue</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Jobs"
                    type="number"
                    value={config.bullmq.limiter.sms.max.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          sms: {
                            ...config.bullmq.limiter.sms,
                            max: parseInt(e.target.value) || 100,
                          },
                        },
                      })
                    }
                  />
                  <Input
                    label="Duration (ms)"
                    type="number"
                    value={config.bullmq.limiter.sms.duration.toString()}
                    onChange={(e) =>
                      updateConfig("bullmq", {
                        limiter: {
                          ...config.bullmq.limiter,
                          sms: {
                            ...config.bullmq.limiter.sms,
                            duration: parseInt(e.target.value) || 60000,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default NotificationConfigTab;
