import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import DateInput from "../../components/ui/DateInput";
import Select from "../../components/ui/Select";
import api from "../../services/api";

interface StatutoryRate {
  id: string;
  country: string;
  rateType: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  config: Record<string, any>;
  isActive: boolean;
}

const StatutoryRatesPage: React.FC = () => {
  const [rates, setRates] = useState<StatutoryRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<StatutoryRate | null>(null);
  const [formData, setFormData] = useState({
    rateType: "",
    effectiveFrom: "",
    effectiveTo: "",
    country: "Kenya",
    config: {} as Record<string, any>,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/settings/statutory-rates");
      setRates(response.data.rates || []);
    } catch (error: any) {
      console.error("Failed to fetch rates:", error);
      setError(error.response?.data?.error || "Failed to fetch rates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRate(null);
    setFormData({
      rateType: "",
      effectiveFrom: "",
      effectiveTo: "",
      country: "Kenya",
      config: {},
    });
    setIsFormOpen(true);
  };

  const handleEdit = (rate: StatutoryRate) => {
    setEditingRate(rate);
    setFormData({
      rateType: rate.rateType,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo || "",
      country: rate.country,
      config: rate.config,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this rate?")) {
      return;
    }

    try {
      await api.delete(`/settings/statutory-rates/${id}`);
      fetchRates();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete rate");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRate) {
        await api.put(`/settings/statutory-rates/${editingRate.id}`, formData);
      } else {
        await api.post("/settings/statutory-rates", formData);
      }
      setIsFormOpen(false);
      fetchRates();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save rate");
    }
  };

  const columns = [
    {
      header: "Type",
      cell: (row: StatutoryRate) => (
        <span className="text-sm font-medium text-gray-900">
          {row.rateType}
        </span>
      ),
    },
    {
      header: "Country",
      cell: (row: StatutoryRate) => (
        <span className="text-sm text-gray-700">{row.country}</span>
      ),
    },
    {
      header: "Effective From",
      cell: (row: StatutoryRate) => (
        <span className="text-sm text-gray-700">
          {new Date(row.effectiveFrom).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Effective To",
      cell: (row: StatutoryRate) => (
        <span className="text-sm text-gray-700">
          {row.effectiveTo
            ? new Date(row.effectiveTo).toLocaleDateString()
            : "Ongoing"}
        </span>
      ),
    },
    {
      header: "Config",
      cell: (row: StatutoryRate) => (
        <span className="text-xs text-gray-500 font-mono">
          {JSON.stringify(row.config).substring(0, 50)}...
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row: StatutoryRate) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: StatutoryRate) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statutory Rates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage PAYE, NSSF, and NHIF rates
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          leftIcon={<FiPlus className="w-4 h-4" />}
        >
          Add Rate
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          rows={rates}
          tableLoading={isLoading}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRate ? "Edit Statutory Rate" : "New Statutory Rate"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Rate Type"
            value={formData.rateType}
            onChange={(e) =>
              setFormData({ ...formData, rateType: e.target.value })
            }
            options={[
              { value: "", label: "Select rate type" },
              { value: "PAYE", label: "PAYE" },
              { value: "NSSF", label: "NSSF" },
              { value: "NHIF", label: "NHIF" },
            ]}
            required
          />
          <DateInput
            label="Effective From"
            value={formData.effectiveFrom}
            onChange={(e) =>
              setFormData({ ...formData, effectiveFrom: e.target.value })
            }
            required
          />
          <DateInput
            label="Effective To (Optional)"
            value={formData.effectiveTo}
            onChange={(e) =>
              setFormData({ ...formData, effectiveTo: e.target.value })
            }
          />
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Config (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.config, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({
                    ...formData,
                    config: JSON.parse(e.target.value),
                  });
                } catch {
                  // Invalid JSON, keep as is
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              rows={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter valid JSON configuration for the rate
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRate ? "Update" : "Create"} Rate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StatutoryRatesPage;

