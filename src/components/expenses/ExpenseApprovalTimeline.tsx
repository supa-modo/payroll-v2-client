import React from "react";
import { FiCheck, FiX, FiClock } from "react-icons/fi";
import type { ExpenseApproval } from "../../types/expense";

interface ExpenseApprovalTimelineProps {
  approvals: ExpenseApproval[];
}

const ExpenseApprovalTimeline: React.FC<ExpenseApprovalTimelineProps> = ({ approvals }) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No approval history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval, index) => (
        <div key={approval.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                approval.action === "approved"
                  ? "bg-green-100 text-green-600"
                  : approval.action === "rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {approval.action === "approved" ? (
                <FiCheck className="w-5 h-5" />
              ) : approval.action === "rejected" ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiClock className="w-5 h-5" />
              )}
            </div>
            {index < approvals.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {approval.approvalLevel === "manager" ? "Manager" : "Finance"} Approval
                </p>
                <p className="text-sm text-gray-600">
                  {approval.approver
                    ? `${approval.approver.firstName || ""} ${approval.approver.lastName || ""}`.trim() ||
                      approval.approver.email
                    : "Unknown"}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  approval.action === "approved"
                    ? "bg-green-100 text-green-800"
                    : approval.action === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)}
              </span>
            </div>
            {approval.comments && (
              <p className="mt-2 text-sm text-gray-700">{approval.comments}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {new Date(approval.actedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseApprovalTimeline;

