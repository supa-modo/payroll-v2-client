import { FiChevronRight } from "react-icons/fi";

/* ─── SECTION CARD ──────────────────────────────────── */
interface SectionCardProps {
    title: string;
    sub?: string;
    action?: React.ReactNode;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, sub, action, badge, children, className = "" }) => (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${className}`}>
        {(title || action || badge) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    {sub && (
                        <>
                            <div className="w-px h-4 bg-gray-200" />
                            <p className="text-sm text-slate-500">{sub}</p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {badge}
                    {action && (
                        <button className="flex items-center gap-0.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                            {action} <FiChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        )}
        <div className="px-6 py-5">{children}</div>
    </div>
);

export default SectionCard;