/**
 * Loan Form Component
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import { EmployeeLoan, CreateLoanInput, UpdateLoanInput } from "../../types/loan";
import { Employee } from "../../types/employee";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

interface LoanFormProps {
  loan?: EmployeeLoan;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoanForm({ loan, onClose, onSuccess }: LoanFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLoanInput>({
    employeeId: loan?.employeeId || "",
    loanType: loan?.loanType || "personal",
    principalAmount: loan ? parseFloat(loan.principalAmount.toString()) : 0,
    interestRate: loan ? loan.interestRate : 0,
    repaymentStartDate: loan?.repaymentStartDate || "",
    monthlyDeduction: loan ? parseFloat(loan.monthlyDeduction.toString()) : 0,
    reason: loan?.reason || "",
  });

  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    fetchEmployees();
    calculateTotal();
  }, [formData.principalAmount, formData.interestRate]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees?limit=1000");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const calculateTotal = () => {
    const principal = formData.principalAmount || 0;
    const interest = formData.interestRate || 0;
    const total = principal * (1 + interest / 100);
    setCalculatedTotal(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loan) {
        // Update existing loan
        const updateData: UpdateLoanInput = {
          loanType: formData.loanType,
          principalAmount: formData.principalAmount,
          interestRate: formData.interestRate,
          repaymentStartDate: formData.repaymentStartDate,
          monthlyDeduction: formData.monthlyDeduction,
          reason: formData.reason,
        };
        await api.put(`/loans/${loan.id}`, updateData);
      } else {
        // Create new loan
        await api.post("/loans", formData);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error saving loan:", error);
      alert(error.response?.data?.error || "Failed to save loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={loan ? "Edit Loan" : "New Loan"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee"
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          required
          disabled={!!loan}
          options={[
            { value: "", label: "Select Employee" },
            ...employees.map((emp) => ({
              value: emp.id,
              label: `${emp.firstName} ${emp.lastName} (${emp.employeeNumber})`,
            })),
          ]}
        />

        <Select
          label="Loan Type"
          value={formData.loanType}
          onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
          required
          options={[
            { value: "personal", label: "Personal Loan" },
            { value: "advance", label: "Advance" },
            { value: "emergency", label: "Emergency" },
            { value: "salary_advance", label: "Salary Advance" },
            { value: "medical", label: "Medical" },
            { value: "education", label: "Education" },
          ]}
        />

        <Input
          type="number"
          label="Principal Amount (KES)"
          value={formData.principalAmount}
          onChange={(e) =>
            setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })
          }
          required
          min={0}
          step="0.01"
        />

        <Input
          type="number"
          label="Interest Rate (%)"
          value={formData.interestRate}
          onChange={(e) =>
            setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })
          }
          min={0}
          max={100}
          step="0.01"
        />

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Total Amount:</span>{" "}
            <span className="text-lg font-bold text-gray-900">
              KES {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>

        <Input
          type="date"
          label="Repayment Start Date"
          value={formData.repaymentStartDate}
          onChange={(e) => setFormData({ ...formData, repaymentStartDate: e.target.value })}
          required
        />

        <Input
          type="number"
          label="Monthly Deduction (KES)"
          value={formData.monthlyDeduction}
          onChange={(e) =>
            setFormData({ ...formData, monthlyDeduction: parseFloat(e.target.value) || 0 })
          }
          required
          min={0}
          step="0.01"
        />

        <Textarea
          label="Reason/Purpose"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {loan ? "Update Loan" : "Create Loan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

