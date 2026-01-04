import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiPlay, FiCheck, FiLock, FiEye } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import DateInput from "../../components/ui/DateInput";
import api from "../../services/api";
import type { PayrollPeriod, CreatePayrollPeriodInput } from "../../types/payroll";
import { useNavigate } from "react-router-dom";

const PeriodsPage: React.FC = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [formData, setFormData] = useState<CreatePayrollPeriodInput>({
    name: "",
    periodType: "monthly",
    startDate: "",
    endDate: "",
    payDate: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 30;

  useEffect(() => {
    fetchPeriods();
  }, [currentPage, filterStatus]);

  const fetchPeriods = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      if (filterStatus) params.append("status", filterStatus);

      const response = await api.get(`/payroll-periods?${params.toString()}`);
      setPeriods(response.data.periods || []);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to fetch payroll periods:", error);
      setError(error.response?.data?.error || "Failed to fetch payroll periods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPeriod(null);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const payDate = new Date(today.getFullYear(), today.getMonth() + 1, 5);

    setFormData({
      name: `Payroll ${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      periodType: "monthly",
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
      payDate: payDate.toISOString().split("T")[0],
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleEdit = (period: PayrollPeriod) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      periodType: period.periodType,
      startDate: period.startDate,
      endDate: period.endDate,
      payDate: period.payDate,
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingPeriod) {
        await api.put(`/payroll-periods/${editingPeriod.id}`, formData);
      } else {
        await api.post("/payroll-periods", formData);
      }
      setIsFormOpen(false);
      fetchPeriods();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save payroll period");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcess = async (id: string) => {
    if (!window.confirm("Are you sure you want to process this payroll period?")) {
      return;
    }

    try {
      await api.post(`/payroll-periods/${id}/process`);
      fetchPeriods();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to process payroll period");
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this payroll period?")) {
      return;
    }

    try {
      await api.post(`/payroll-periods/${id}/approve`);
      fetchPeriods();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to approve payroll period");
    }
  };

  const handleLock = async (id: string) => {
    if (!window.confirm("Are you sure you want to lock this payroll period? This action cannot be undone.")) {
      return;
    }

    try {
      await api.post(`/payroll-periods/${id}/lock`);
      fetchPeriods();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to lock payroll period");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPeriods = periods.filter((period) => {
    if (filterStatus && period.status !== filterStatus) return false;
    return true;
  });

  const startIndex = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Periods</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage payroll periods and process payroll
          </p>
        </div>
        <Button onClick={handleCreate} leftIcon={<FiPlus className="w-4 h-4" />}>
          New Period
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "processing", label: "Processing" },
              { value: "pending_approval", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "paid", label: "Paid" },
              { value: "locked", label: "Locked" },
            ]}
            wrapperClassName="mb-0"
          />
        </div>

        <DataTable
          columns={[
            {
              header: "Period",
              cell: (period: PayrollPeriod) => (
                <div>
                  <div className="font-medium text-gray-900">{period.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{period.periodType}</div>
                </div>
              ),
            },
            {
              header: "Dates",
              cell: (period: PayrollPeriod) => (
                <div className="text-sm">
                  <div className="text-gray-900">
                    {new Date(period.startDate).toLocaleDateString()} -{" "}
                    {new Date(period.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    Pay: {new Date(period.payDate).toLocaleDateString()}
                  </div>
                </div>
              ),
            },
            {
              header: "Status",
              cell: (period: PayrollPeriod) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(period.status)}`}
                >
                  {period.status.replace("_", " ")}
                </span>
              ),
            },
            {
              header: "Summary",
              cell: (period: PayrollPeriod) => (
                <div className="text-sm">
                  <div className="text-gray-900">
                    {period.totalEmployees} employees
                  </div>
                  <div className="text-gray-500">
                    Net: {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(period.totalNet)}
                  </div>
                </div>
              ),
            },
            {
              header: "Actions",
              cell: (period: PayrollPeriod) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/payroll/periods/${period.id}/review`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View/Review"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  {period.status === "draft" && (
                    <>
                      <button
                        onClick={() => handleEdit(period)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleProcess(period.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Process"
                      >
                        <FiPlay className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {period.status === "pending_approval" && (
                    <button
                      onClick={() => handleApprove(period.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  {period.status === "approved" && (
                    <button
                      onClick={() => handleLock(period.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Lock"
                    >
                      <FiLock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={filteredPeriods}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          tableLoading={isLoading}
          hasSearched={!!filterStatus}
          showCheckboxes={false}
        />
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingPeriod ? "Edit Payroll Period" : "New Payroll Period"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-2.5">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Period Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Select
              label="Period Type"
              value={formData.periodType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  periodType: e.target.value as "monthly" | "bi-weekly" | "weekly" | "custom",
                })
              }
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "bi-weekly", label: "Bi-Weekly" },
                { value: "weekly", label: "Weekly" },
                { value: "custom", label: "Custom" },
              ]}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateInput
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <DateInput
                label="End Date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
              <DateInput
                label="Pay Date"
                name="payDate"
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingPeriod ? "Update" : "Create"} Period
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PeriodsPage;

