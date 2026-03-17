import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  TbCheck,
  TbX,
  TbAlertTriangle,
  TbInfoCircle,
  TbTrash,
} from "react-icons/tb";
import { FaExclamation } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

export type NotificationType =
  | "info"
  | "success"
  | "error"
  | "warning"
  | "confirm"
  | "delete";

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  icon?: React.ComponentType<{ size: number; className?: string }>;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
  autoClose = false,
  autoCloseDelay = 3000,
  icon: CustomIcon,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && autoClose && (type === "success" || type === "info")) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, type]);

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CustomIcon || TbCheck,
          iconBg: "bg-emerald-500",
          bgColor: "bg-emerald-50",
          titleColor: "text-emerald-800",
          messageColor: "text-emerald-700",
          primaryButton:
            "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
        };
      case "error":
        return {
          icon: CustomIcon || TbX,
          iconBg: "bg-red-500",
          bgColor: "bg-red-50",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
          primaryButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
      case "warning":
        return {
          icon: CustomIcon || TbAlertTriangle,
          iconBg: "bg-amber-500",
          bgColor: "bg-amber-50",
          titleColor: "text-amber-800",
          messageColor: "text-amber-700",
          primaryButton:
            "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
        };
      case "confirm":
        return {
          icon: CustomIcon || FaExclamation,
          iconBg: "bg-primary-600",
          bgColor: "bg-primary-50",
          titleColor: "text-primary-800",
          messageColor: "text-primary-700",
          primaryButton:
            "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
        };
      case "delete":
        return {
          icon: CustomIcon || TbTrash,
          iconBg: "bg-red-600",
          bgColor: "bg-red-50",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
          primaryButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
      default:
        return {
          icon: CustomIcon || TbInfoCircle,
          iconBg: "bg-slate-600",
          bgColor: "bg-slate-50",
          titleColor: "text-slate-800",
          messageColor: "text-slate-600",
          primaryButton:
            "bg-slate-600 hover:bg-slate-700 focus:ring-slate-500",
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-1000 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden font-mukta"
          >
            <div className={`${config.bgColor} px-5 pt-4 pb-3 relative`}>
              {type !== "confirm" && type !== "delete" && (
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-white/60 transition-colors"
                >
                  <FaXmark size={18} />
                </button>
              )}

              <div className="flex items-start gap-3.5">
                <div
                  className={`${config.iconBg} rounded-xl p-2.5 shadow-md flex items-center justify-center`}
                >
                  <IconComponent size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base font-semibold mb-1 font-google ${config.titleColor}`}
                  >
                    {title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${config.messageColor}`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
              {(showCancel || type === "confirm" || type === "delete") && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex justify-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex justify-center px-4 py-2.5 text-sm font-semibold text-white rounded-full transition-colors ${config.primaryButton}`}
              >
                {type === "delete" ? "Delete" : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default NotificationModal;

