import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Activity, ChevronDown, UserCheck } from 'lucide-react';
import type { SystemStatus } from '@/types/health';
import { Link } from 'react-router-dom';

interface HeaderProps {
  userName: string;
  userEmail: string;
  systemStatus: SystemStatus;
  onLogout: () => void;
}

export default function Header({
  userName,
  userEmail,
  systemStatus,
  onLogout,
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileOpen]);

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 z-30">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
          <Activity className="w-4.5 h-4.5" strokeWidth={2.25} />
        </div>
        <Link
          to="/dashboard"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:underline-offset-4 hover:underline decoration-purple-600 decoration-2"
        >
          AnatomyAI
        </Link>
      </div>

      {/* Right: System Guardrails Status + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Explicit requested status badge */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${
            systemStatus.apiConnected && systemStatus.guardrailsActive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          title={`Model: ${systemStatus.modelName}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {systemStatus.apiConnected ? 'API: Connected' : 'API: Local Mode'} |{' '}
            {systemStatus.guardrailsActive ? 'Guardrails: Active' : 'Guardrails: Check'}
          </span>
        </div>

        {/* User Profile Trigger & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 py-1 pl-1.5 pr-2.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-sky-600"
            aria-expanded={profileOpen}
            aria-label="Hồ sơ người dùng"
          >
            <img
              src="/assets/images/avatar_patient_profile_1794537839765.jpg"
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
            />
            <span className="text-sm font-medium text-slate-800 whitespace-nowrap hidden md:inline">
              {userName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src="/assets/images/avatar_patient_profile_1794537839765.jpg"
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-sky-600" />
                    Hồ sơ sàng lọc cá nhân
                  </p>
                </div>
              </div>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-800 truncate">{userEmail}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Trạng thái bảo vệ AI</dt>
                  <dd className="font-medium text-emerald-700">
                    Guardrails Y khoa Bật
                  </dd>
                </div>
              </dl>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
