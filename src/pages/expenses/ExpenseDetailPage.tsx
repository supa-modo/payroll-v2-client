import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiDollarSign } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import ExpenseApprovalTimeline from "../../components/expenses/ExpenseApprovalTimeline";
import ExpenseDocumentsSection from "../../components/expenses/ExpenseDocumentsSection";
import api from "../../services/api";
import type { Expense, ExpenseApproval, ExpenseDocument } from "../../types/expense";

const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [approvals, setApprovals] = useState<ExpenseApproval[]>([]);
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "mark-paid">("approve");
  const [actionData, setActionData] = useState({ comments: "", reason: "", paymentReference: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExpense();
      fetchApprovals();
      fetchDocuments();
    }
  }, [id]);

  const fetchExpense = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/expenses/${id}`);
      setExpense(response.data.expense);
    } catch (error: any) {
      console.error("Failed to fetch expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      const response = await api.get(`/expenses/${id}/approvals`);
      setApprovals(response.data.approvals || []);
    } catch (error: any) {
      console.error("Failed to fetch approvals:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/expenses/${id}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      if (actionType === "approve") {
        await api.post(`/expenses/${id}/approve`, {
          comments: actionData.comments,
        });
      } else if (actionType === "reject") {
        await api.post(`/expenses/${id}/reject`, {
          reason: actionData.reason,
          comments: actionData.comments,
        });
      } else if (actionType === "mark-paid") {
        await api.post(`/expenses/${id}/mark-paid`, {
          paymentReference: actionData.paymentReference,
        });
      }
      setIsActionModalOpen(false);
      setActionData({ comments: "", reason: "", paymentReference: "" });
      fetchExpense();
      fetchApprovals();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to perform action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApprove = expense && (expense.status === "pending_manager" || expense.status === "pending_finance");
  const canMarkPaid = expense && expense.status === "approved";
  const canEdit = expense && expense.status === "draft" ? true : false;

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!expense) {
    return <div className="text-center py-12">Expense not found</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      submitted: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
      pending_manager: { label: "Pending Manager", className: "bg-yellow-100 text-yellow-800" },
      pending_finance: { label: "Pending Finance", className: "bg-orange-100 text-orange-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      paid: { label: "Paid", className: "bg-purple-100 text-purple-800" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/expenses")}
            leftIcon={<FiArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{expense.title}</h1>
            <p className="mt-1 text-sm text-gray-600">Expense #{expense.expenseNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(expense.status)}
          {canApprove && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setActionType("approve");
                  setIsActionModalOpen(true);
                }}
                leftIcon={<FiCheck className="w-4 h-4" />}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType("reject");
                  setIsActionModalOpen(true);
                }}
                leftIcon={<FiX className="w-4 h-4" />}
              >
                Reject
              </Button>
            </>
          )}
          {canMarkPaid && (
            <Button
              variant="primary"
              onClick={() => {
                setActionType("mark-paid");
                setIsActionModalOpen(true);
              }}
              leftIcon={<FiDollarSign className="w-4 h-4" />}
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Details</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {expense.category?.name || "N/A"} ({expense.category?.code || "N/A"})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Employee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {expense.employee
                    ? `${expense.employee.firstName} ${expense.employee.lastName}`
                    : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: expense.currency || "KES",
                  }).format(parseFloat(expense.amount.toString()))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Expense Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </dd>
              </div>
              {expense.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{expense.description}</dd>
                </div>
              )}
              {expense.rejectionReason && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-red-600">{expense.rejectionReason}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ExpenseDocumentsSection
              expenseId={expense.id}
              documents={documents}
              onDocumentsChange={fetchDocuments}
              canEdit={canEdit}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Approval History</h2>
            <ExpenseApprovalTimeline approvals={approvals} />
          </div>
        </div>
      </div>

      {isActionModalOpen && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          title={
            actionType === "approve"
              ? "Approve Expense"
              : actionType === "reject"
              ? "Reject Expense"
              : "Mark as Paid"
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction();
            }}
            className="space-y-4"
          >
            {actionType === "reject" && (
              <Textarea
                label="Rejection Reason"
                name="reason"
                value={actionData.reason}
                onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                required
                rows={3}
              />
            )}
            {actionType === "mark-paid" && (
              <Textarea
                label="Payment Reference (Optional)"
                name="paymentReference"
                value={actionData.paymentReference}
                onChange={(e) => setActionData({ ...actionData, paymentReference: e.target.value })}
                rows={2}
              />
            )}
            <Textarea
              label="Comments (Optional)"
              name="comments"
              value={actionData.comments}
              onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === "reject" ? "outline" : "primary"}
                isLoading={isSubmitting}
              >
                {actionType === "approve"
                  ? "Approve"
                  : actionType === "reject"
                  ? "Reject"
                  : "Mark as Paid"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExpenseDetailPage;

