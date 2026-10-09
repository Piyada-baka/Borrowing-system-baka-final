import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Phone, IdCard, Building2, Check, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, isAdmin, updateUserProfile } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [department, setDepartment] = useState(profile?.department || 'ภาควิชาเทคโนโลยีการศึกษา');
  const [faculty, setFaculty] = useState(profile?.faculty || 'คณะศึกษาศาสตร์');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateUserProfile({
        phone: phone.trim(),
        studentId: studentId.trim(),
        department: department.trim(),
        faculty: faculty.trim(),
      });
      setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
      setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-[#FC82A8]/30 overflow-hidden">
        {/* Header with primary #FC82A8 */}
        <div className="p-6 bg-gradient-to-r from-[#FC82A8]/15 via-[#FEF7C7]/70 to-[#93A334]/10 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FC82A8] text-white flex items-center justify-center shadow-md shadow-[#FC82A8]/20">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                ข้อมูลส่วนตัวผู้ยืม
              </h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              ชื่อ-นามสกุล (จากบัญชี Google)
            </label>
            <input
              type="text"
              disabled
              value={profile?.displayName || user?.displayName || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              สถานะสิทธิ์ในระบบ
            </label>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FEF7C7]/50 border border-[#FC82A8]/20">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAdmin ? 'bg-[#FC82A8]' : 'bg-[#93A334]'
                }`}
              />
              <span className="text-sm font-semibold text-gray-800">
                {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (นักศึกษา / อาจารย์ / บุคลากร)'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รหัสนักศึกษา / รหัสประจำตัวอาจารย์ <span className="text-[#FC82A8]">*</span>
            </label>
            <div className="relative">
              <IdCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="เช่น 6401050001 หรือ รหัสบุคลากร"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FC82A8] text-sm text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              เบอร์โทรศัพท์สำหรับติดต่อ <span className="text-[#FC82A8]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FC82A8] text-sm text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ภาควิชา / สาขา
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เทคโนโลยีการศึกษา"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FC82A8] text-xs text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                คณะ / หน่วยงาน
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="คณะศึกษาศาสตร์"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FC82A8] text-xs text-gray-800"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md shadow-[#FC82A8]/25 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
