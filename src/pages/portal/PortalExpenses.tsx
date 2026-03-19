import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";

const PortalExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/expenses")
      .then((response) => setExpenses(response.data.expenses || []))
      .catch(() => setExpenses([]));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">My Expenses</h2>
        <Button size="sm" onClick={() => navigate("/expenses/submit")}>
          Submit Expense
        </Button>
      </div>
      {expenses.map((expense) => (
        <button
          key={expense.id}
          className="w-full text-left rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50"
          onClick={() => navigate(`/expenses/${expense.id}`)}
        >
          <p className="font-semibold text-slate-800">{expense.title}</p>
          <p className="text-xs text-slate-500">
            KES {Number(expense.amount || 0).toLocaleString()} • {expense.status}
          </p>
        </button>
      ))}
      {expenses.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No expenses found.
        </div>
      )}
    </div>
  );
};

export default PortalExpenses;
