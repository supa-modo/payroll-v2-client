/**
 * Remittance Status Badge Component
 */

interface RemittanceStatusBadgeProps {
  status: "pending" | "remitted";
  overdue?: boolean;
}

export default function RemittanceStatusBadge({
  status,
  overdue = false,
}: RemittanceStatusBadgeProps) {
  if (status === "remitted") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Remitted
      </span>
    );
  }

  if (overdue) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Pending
    </span>
  );
}
