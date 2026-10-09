import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Equipment } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Phone, 
  IdCard, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface BookingModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile, updateUserProfile } = useAuth();

  // Date calculation helpers
  const today = new Date().toISOString().split('T')[0];
  const next3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(next3Days);
  const [purpose, setPurpose] = useState<string>('');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [studentId, setStudentId] = useState<string>(profile?.studentId || '');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !equipment) return null;

  const quickPurposes = [
    'ถ่ายทำสื่อการเรียนรู้รายวิชา EDTECH',
    'ผลิตวิดีทัศน์สารคดีเพื่อการศึกษา',
    'จัดกิจกรรมสัมมนา / ถ่ายทอดสดออนไลน์',
    'โครงงานและวิทยานิพนธ์ภาควิชา',
    'ผลิตภาพนิ่งและกราฟิกเพื่อการศึกษา',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนทำการจอง');
      return;
    }

    if (quantity < 1 || quantity > equipment.availableQuantity) {
      setErrorMsg(`จำนวนอุปกรณ์ที่เลือกต้องอยู่ระหว่าง 1 ถึง ${equipment.availableQuantity} ชิ้น`);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg('วันที่ส่งคืนต้องไม่ก่อนกว่าวันที่เริ่มต้นยืม');
      return;
    }

    if (!phone.trim() || !studentId.trim()) {
      setErrorMsg('กรุณากรอกรหัสนักศึกษาและเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('กรุณาระบุวัตถุประสงค์ในการยืมใช้งาน');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('กรุณายอมรับเงื่อนไขและข้อตกลงการยืม-คืนอุปกรณ์');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Update user profile if phone or studentId changed
      if (phone !== profile?.phone || studentId !== profile?.studentId) {
        await updateUserProfile({
          phone: phone.trim(),
          studentId: studentId.trim(),
        });
      }

      // 2. Create booking request in Firestore
      const bookingData = {
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'ผู้ขอยืม',
        userEmail: user.email || '',
        userPhone: phone.trim(),
        userStudentId: studentId.trim(),
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.name,
        equipmentImageUrl: equipment.imageUrl || '',
        quantity: Number(quantity),
        startDate,
        endDate,
        purpose: purpose.trim(),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Booking submission error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'bookings');
      setErrorMsg('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-[#FC82A8]/30 overflow-hidden my-6">
        
        {/* Header with #FC82A8 and #FEF7C7 */}
        <div className="p-6 bg-gradient-to-r from-[#FC82A8]/15 via-[#FEF7C7]/70 to-[#93A334]/10 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30 mb-1">
                {equipment.code}
              </span>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1">
                {equipment.name}
              </h3>
              <p className="text-xs text-gray-500">
                พร้อมให้ยืม: <span className="font-bold text-[#FC82A8]">{equipment.availableQuantity}</span> / {equipment.totalQuantity} ชิ้น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              จำนวนอุปกรณ์ที่ต้องการยืม
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={equipment.availableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(equipment.availableQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-14 text-center font-bold text-gray-900 bg-white py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(equipment.availableQuantity, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500">
                (ไม่เกินคงเหลือ {equipment.availableQuantity} ชิ้น)
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FC82A8]" />
                วันที่เริ่มยืม
              </label>
              <input
                type="date"
                required
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FC82A8] text-sm text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#93A334]" />
                วันที่กำหนดส่งคืน
              </label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FC82A8] text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FC82A8]" />
                วัตถุประสงค์ในการยืมใช้งาน <span className="text-[#FC82A8]">*</span>
              </label>
            </div>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุชื่อวิชา กิจกรรม หรือโครงงานที่ต้องการนำอุปกรณ์ไปใช้งาน..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FC82A8] text-sm text-gray-800 placeholder-gray-400"
            />
            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPurposes.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#FEF7C7] text-gray-600 hover:text-[#FC82A8] transition-colors border border-transparent hover:border-[#FC82A8]/30 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#FC82A8]" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Borrower Information Confirmation */}
          <div className="bg-[#fbfbf7] p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <IdCard className="w-4 h-4 text-[#FC82A8]" />
              ข้อมูลยืนยันตัวตนผู้ยืม
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  รหัสนักศึกษา / รหัสบุคลากร <span className="text-[#FC82A8]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 6401050012"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#FC82A8]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  เบอร์โทรศัพท์ <span className="text-[#FC82A8]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#FC82A8]"
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              ผู้ขอยืม: <span className="font-semibold text-gray-800">{user?.displayName}</span> ({user?.email})
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#FC82A8] focus:ring-[#FC82A8] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-snug cursor-pointer">
              ข้าพเจ้ายินยอมปฏิบัติตามระเบียบการยืม-คืนอุปกรณ์ ภาควิชาเทคโนโลยีการศึกษา และยินยอมรับผิดชอบชดใช้หากอุปกรณ์เกิดความเสียหายหรือสูญหาย
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md shadow-[#FC82A8]/30 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>กำลังบันทึกคำขอ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันการส่งคำขอจอง</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
