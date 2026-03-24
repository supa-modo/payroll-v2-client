import React, { useCallback, useState } from "react";

export interface AppToast {
  id: number;
  icon: string;
  title: string;
  sub?: string;
}

interface ToastContainerProps {
  toasts: AppToast[];
}

export const useToast = () => {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = useCallback((icon: string, title: string, sub?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, icon, title, sub }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return { toasts, addToast };
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
    {toasts.map((t) => (
      <div key={t.id}
        className="flex items-start gap-3 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl min-w-[280px] border border-slate-700"
        style={{ animation: "toastIn 0.3s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <span className="text-base shrink-0 mt-0.5">{t.icon}</span>
        <div>
          <p className="text-[13px] font-bold">{t.title}</p>
          {t.sub && <p className="text-[11.5px] text-slate-400 mt-0.5">{t.sub}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default ToastContainer;
