import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { 
  CalendarDays, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  GraduationCap,
  PlusCircle,
  LayoutGrid
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'my-bookings' | 'admin';
  setActiveTab: (tab: 'catalog' | 'my-bookings' | 'admin') => void;
  onOpenProfile: () => void;
  onOpenAddEquipment: () => void;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenAddEquipment,
  pendingCount = 0,
}) => {
  const { user, profile, isAdmin, signInWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#FC82A8]/20 shadow-xs">
      {/* Top Banner accent stripe with primary #FC82A8, #FEF7C7, and #93A334 */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FC82A8] via-[#FEF7C7] to-[#93A334]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Department Brand with Attached Hanami Calendar Logo */}
          <div 
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FEF7C7]/60 border border-[#FC82A8]/30 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
              <Logo className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight leading-tight">
                  ระบบยืม-คืนอุปกรณ์
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30">
                  EdTech Borrowing
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#93A334]" />
                ภาควิชาเทคโนโลยีการศึกษา
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#fbfbf7] p-1.5 rounded-2xl border border-gray-200/80">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#FC82A8] text-white shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>อุปกรณ์ทั้งหมด</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-bookings'
                    ? 'bg-[#FC82A8] text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>รายการจองของฉัน</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer relative ${
                  activeTab === 'admin'
                    ? 'bg-[#FC82A8] text-white shadow-sm font-bold'
                    : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>จัดการระบบ</span>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 bg-[#93A334] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Actions: Add Equipment Button & User Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Prominent "+ เพิ่มอุปกรณ์" button */}
            <button
              onClick={onOpenAddEquipment}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FC82A8] hover:bg-[#eb7197] text-white text-xs font-bold shadow-sm shadow-[#FC82A8]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มอุปกรณ์</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-[#FEF7C7]/60 border border-transparent hover:border-[#FC82A8]/30 transition-all text-left group cursor-pointer"
                  title="คลิกเพื่อแก้ไขข้อมูลโปรไฟล์"
                >
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FC82A8]/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-[#FC82A8] truncate max-w-[120px]">
                      {profile?.displayName || user.displayName || 'ผู้ใช้งาน'}
                    </div>
                    <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-[#FC82A8] font-bold bg-[#FEF7C7] px-1.5 py-0.2 rounded-md">
                          Admin
                        </span>
                      ) : (
                        <span>{profile?.studentId || 'ผู้ใช้ทั่วไป'}</span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white font-medium shadow-md shadow-[#FC82A8]/25 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAddEquipment}
              className="p-2 rounded-xl bg-[#FC82A8] text-white"
              title="เพิ่มอุปกรณ์ใหม่"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            {user && (
              <button
                onClick={onOpenProfile}
                className="p-1 rounded-full ring-2 ring-[#FC82A8]/40"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              activeTab === 'catalog'
                ? 'bg-[#FC82A8] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>อุปกรณ์ทั้งหมด</span>
          </button>

          {user && (
            <button
              onClick={() => {
                setActiveTab('my-bookings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'my-bookings'
                  ? 'bg-[#FC82A8] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>รายการจองของฉัน</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'admin'
                  ? 'bg-[#FC82A8] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <span>จัดการระบบ (Admin)</span>
              </div>
              {pendingCount > 0 && (
                <span className="w-5 h-5 bg-[#93A334] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              onOpenAddEquipment();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FC82A8] text-white text-sm font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มอุปกรณ์ใหม่</span>
          </button>

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#FEF7C7]/50"
                >
                  <UserIcon className="w-5 h-5 text-[#FC82A8]" />
                  <span>แก้ไขข้อมูลโปรไฟล์</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FC82A8] text-white font-medium shadow-md shadow-[#FC82A8]/25"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
