import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, ShieldCheck, UserCheck, Sparkles, ArrowRightLeft } from 'lucide-react';

interface ViewModeBannerProps {
  currentViewMode: 'user' | 'admin';
  onToggleViewMode: (mode: 'user' | 'admin') => void;
  pendingRequestsCount: number;
}

export const ViewModeBanner: React.FC<ViewModeBannerProps> = ({
  currentViewMode,
  onToggleViewMode,
  pendingRequestsCount,
}) => {
  const { user, isAdmin } = useAuth();

  // If user is not admin, they only have user mode, but we can display a helpful guide indicator
  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-[#FEF7C7]/90 via-[#FC82A8]/10 to-[#93A334]/15 border-b border-[#FC82A8]/20 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Current Mode Description */}
        <div className="flex items-center gap-2">
          {currentViewMode === 'admin' ? (
            <span className="flex items-center gap-1.5 font-bold text-gray-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-[#FC82A8]/30">
              <ShieldCheck className="w-4 h-4 text-[#FC82A8]" />
              <span>มุมมองผู้ดูแลระบบ (Admin Mode)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-gray-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-[#93A334]/30">
              <UserCheck className="w-4 h-4 text-[#93A334]" />
              <span>มุมมองผู้ใช้งานทั่วไป (Student / User Mode)</span>
            </span>
          )}
          <span className="hidden md:inline text-gray-600">
            {currentViewMode === 'admin'
              ? 'คุณสามารถเพิ่ม/แก้ไขอุปกรณ์, อนุมัติการยืม, ตรวจสภาพรับคืน และจัดการสิทธิ์ได้'
              : 'มุมมองเสมือนจริงของนักศึกษาและอาจารย์ ค้นหาอุปกรณ์ ส่งคำขอจอง และเปิดบัตรยืมดิจิทัล'}
          </span>
        </div>

        {/* View Switcher Toggle for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">สลับมุมมองหน้าจอ:</span>
            <div className="bg-white p-0.5 rounded-xl border border-gray-200 shadow-2xs flex items-center">
              <button
                type="button"
                onClick={() => onToggleViewMode('user')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentViewMode === 'user'
                    ? 'bg-[#93A334] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>มุมมองผู้ใช้</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('admin')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentViewMode === 'admin'
                    ? 'bg-[#FC82A8] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>มุมมองแอดมิน</span>
                {pendingRequestsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-[#FC82A8] text-[10px] font-extrabold flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
