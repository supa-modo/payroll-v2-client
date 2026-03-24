import React from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

export interface ConfirmConfig {
  type?: "confirm" | "delete";
  title: string;
  message: string;
  confirmText?: string;
}

interface ConfirmModalProps {
  config: ConfirmConfig | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ config, onClose, onConfirm }) => {
  if (!config) return null;
  const isDelete = config.type === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
        style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <div className={`h-1 w-full ${isDelete ? "bg-linear-to-r from-red-600 to-red-400" : "bg-linear-to-r from-primary-700 to-primary-400"}`} />
        <div className="p-7">
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isDelete ? "bg-red-50 border border-red-100" : "bg-primary-50 border border-primary-100"}`}>
              {isDelete ? <FiTrash2 className="w-4.5 h-4.5 text-red-600" /> : <FiAlertTriangle className="w-4.5 h-4.5 text-primary-600" />}
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-slate-900">{config.title}</h3>
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{config.message}</p>
            </div>
          </div>
          <div className="flex gap-2.5 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors ${isDelete ? "bg-red-600 hover:bg-red-700" : "bg-primary-600 hover:bg-primary-700"}`}>
              {config.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
