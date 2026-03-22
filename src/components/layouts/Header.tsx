import { useState, useRef, useEffect } from "react";
import { FiMenu, FiLogOut, FiChevronDown, FiUser, FiSettings } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../notifications/NotificationCenter";
import { PiUserDuotone } from "react-icons/pi";
import Input from "../ui/Input";
import { TbSearch } from "react-icons/tb";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-18 bg-white/80 backdrop-blur-md border-b border-gray-100/80 flex items-center px-4 md:px-6 gap-3 flex-shrink-0 sticky top-0 z-30 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      {/* Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-150 flex-shrink-0"
      >
        <FiMenu size={25} className="" />
      </button>


      {/* Search */}
      <Input type="text" placeholder="Search employees, payroll..."
        leftIcon={<TbSearch className="w-4 h-4" />}
        wrapperClassName="mb-0"
        className="text-sm max-w-xl"
      />

      <div className="flex items-center gap-1 ml-auto shrink-0">
        {/* Notifications */}
        <div className="relative">
          <NotificationCenter />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User dropdown */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-4 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-secondary-600 to-secondary-700 flex items-center justify-center shrink-0 shadow-sm">
              
              {user?.photoUrl ? (
                <img src={user?.photoUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <PiUserDuotone className="text-white font-bold text-lg" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[0.85rem] font-semibold text-gray-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              {user?.isSystemAdmin && (
                <p className="text-[0.8rem] text-secondary-600 font-semibold leading-tight">System Admin</p>
              )}
            </div>
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 py-1.5 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[13px] font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{user?.email}</p>
                {user?.isSystemAdmin && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    System Admin
                  </span>
                )}
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiUser className="w-3.5 h-3.5 text-gray-400" /> My Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiSettings className="w-3.5 h-3.5 text-gray-400" /> Settings
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <FiLogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;