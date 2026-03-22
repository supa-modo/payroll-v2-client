import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { dummyMonthsForSelect, dummyPayslips, type PortalPayslip } from "./portalDummyData";
import { usePortalToast } from "../../components/layouts/EmployeePortalLayout";
import {
  PayslipModal,
  SectionHeader,
  StatusBadge,
} from "./portalComponents/portalUi";
import { FiFileText, FiDownload } from "react-icons/fi";

const formatKES = (n: number) => `KES ${Math.round(n).toLocaleString()}`;

const PortalPayslips: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const pushToast = usePortalToast();

  const [year, setYear] = useState<(typeof dummyMonthsForSelect)[number]>("All Years");
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PortalPayslip>(dummyPayslips[0]);

  const filtered = useMemo(() => {
    if (year === "All Years") return dummyPayslips;
    const y = Number(year);
    return dummyPayslips.filter((p) => p.year === y);
  }, [year]);

  const openPayslip = (p: PortalPayslip) => {
    setSelectedPayslip(p);
    setIsPayslipModalOpen(true);
  };

  const name = `${user?.firstName || "Employee"} ${user?.lastName || ""}`.trim();

  return (
    <div className="space-y-5 lg:space-y-6">
      <SectionHeader
        title={
          <>
            My <em className="not-italic text-primary-700">Payslips</em>
          </>
        }
        meta="Download & view official salary statements"
        action={
          <select
            value={year}
            onChange={(e) => setYear(e.target.value as (typeof dummyMonthsForSelect)[number])}
            className="border border-gray-200 bg-white rounded-2xl px-4 py-2.5 text-[13px] font-semibold text-gray-800 focus:border-primary-300 outline-none"
          >
            {dummyMonthsForSelect.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        }
      />

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-gray-100 mx-auto flex items-center justify-center mb-4">
            <FiFileText className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-[14px] font-black text-gray-900">No payslips for this year</div>
          <div className="text-[12px] text-gray-500 font-semibold mt-1">Try another filter (dummy data)</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-sm transition-shadow">
              <button
                onClick={() => openPayslip(p)}
                className="w-full text-left"
              >
                <div className="px-5 py-5 border-b border-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-primary-700" />
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="text-[16px] font-black text-gray-900 tracking-tight leading-tight mb-1">{p.period}</div>
                  <div className="text-[11px] text-gray-500 font-semibold">Salary Statement</div>

                  <div className="mt-4">
                    <div className="text-[30px] font-black text-gray-900 tracking-tight leading-none">
                      {formatKES(p.netPay)}
                    </div>
                    <div className="text-[11px] text-gray-500 font-semibold mt-2">
                      Net pay
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                      <FiDownload className="w-4 h-4 text-primary-700" />
                    </span>
                    <div className="text-[12px] font-black text-primary-700">Download PDF (dummy)</div>
                  </div>
                </div>
              </button>

              <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => pushToast({ tone: "info", title: "Export CSV", message: "CSV export is a dummy action for now." })}
                  className="text-[12px] font-black text-gray-700 hover:text-gray-900"
                >
                  Export
                </button>
                <button
                  onClick={() => navigate("/portal/salary-history")}
                  className="text-[12px] font-black text-primary-700 hover:text-primary-800"
                >
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={selectedPayslip}
        employeeName={name}
        employeeId="EMP-00247"
        department="Engineering Department"
        kraPin="A003928475W"
        bankMasked="Equity Bank · Nairobi CBD"
      />
    </div>
  );
};

export default PortalPayslips;

