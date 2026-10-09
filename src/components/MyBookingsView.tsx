import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  QrCode, 
  Printer, 
  X, 
  Trash2,
  PackageCheck,
  GraduationCap
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

import { Logo } from './Logo';

interface MyBookingsViewProps {
  bookings: Booking[];
  loading: boolean;
  onExploreCatalog: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  loading,
  onExploreCatalog,
}) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter bookings belonging to the user
  const userBookings = bookings.filter((b) => b.userId === user?.uid);

  const filtered = userBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return b.status === 'pending';
    if (filterStatus === 'active') return b.status === 'active' || b.status === 'approved';
    if (filterStatus === 'returned') return b.status === 'returned';
    if (filterStatus === 'rejected') return b.status === 'rejected' || b.status === 'cancelled';
    return true;
  });

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?')) return;
    setCancellingId(bookingId);
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Cancel booking error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF7C7] text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            รอการอนุมัติ
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            อนุมัติแล้ว (รอรับอุปกรณ์)
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FC82A8]/15 text-[#FC82A8] border border-[#FC82A8]/30 font-bold">
            <PackageCheck className="w-3.5 h-3.5 text-[#FC82A8]" />
            กำลังยืมใช้งาน
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#93A334]/15 text-[#93A334] border border-[#93A334]/30 font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-[#93A334]" />
            ส่งคืนเรียบร้อยแล้ว
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ถูกปฏิเสธ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
            ยกเลิกแล้ว
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            รายการจองของฉัน (My Bookings)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ติดตามสถานะคำขอยืม ตรวจสอบกำหนดส่งคืน และแสดงบัตรดิจิทัลเมื่อมารับอุปกรณ์จริง
          </p>
        </div>

        {/* Filter buttons with Primary #FC82A8 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pending', label: 'รออนุมัติ' },
            { id: 'active', label: 'อนุมัติ / กำลังยืม' },
            { id: 'returned', label: 'คืนแล้ว' },
            { id: 'rejected', label: 'ปฏิเสธ / ยกเลิก' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#FC82A8] text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <div className="w-9 h-9 border-4 border-[#FC82A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">กำลังโหลดรายการคำขอ...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="py-16 px-4 text-center bg-white rounded-3xl border border-gray-200 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">ยังไม่มีรายการจองอุปกรณ์</h3>
            <p className="text-xs text-gray-500 mt-1">
              {filterStatus === 'all'
                ? 'คุณยังไม่เคยส่งคำขอยืมอุปกรณ์ สามารถเลือกดูอุปกรณ์ที่พร้อมใช้งานได้เลย'
                : 'ไม่มีรายการในหมวดหมู่นี้'}
            </p>
          </div>
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white text-sm font-bold shadow-md shadow-[#FC82A8]/20 transition-all cursor-pointer"
          >
            <span>ไปยังหน้ารายการอุปกรณ์</span>
          </button>
        </div>
      )}

      {/* Bookings List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                {/* Equipment Thumbnail */}
                {booking.equipmentImageUrl ? (
                  <img
                    src={booking.equipmentImageUrl}
                    alt={booking.equipmentName}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30">
                      {booking.equipmentCode}
                    </span>
                    {getStatusBadge(booking.status)}
                    <span className="text-xs font-semibold text-gray-500">
                      จำนวน {booking.quantity} ชิ้น
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">
                    {booking.equipmentName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 font-medium pt-1">
                    <div className="flex items-center gap-1 text-[#FC82A8] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>ยืม: {booking.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#93A334] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>คืน: {booking.endDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1 italic">
                    วัตถุประสงค์: &ldquo;{booking.purpose}&rdquo;
                  </p>

                  {/* Rejection Note */}
                  {booking.status === 'rejected' && booking.rejectionReason && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>เหตุผล: {booking.rejectionReason}</span>
                    </div>
                  )}

                  {/* Return Condition Note */}
                  {booking.status === 'returned' && (
                    <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        สภาพ: {booking.returnCondition === 'good' ? 'สมบูรณ์ 100%' : booking.returnCondition === 'damaged' ? 'ชำรุดเสียหาย' : 'อุปกรณ์ไม่ครบ'}
                      </span>
                      {booking.returnNotes && <span>(หมายเหตุ: {booking.returnNotes})</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                {(booking.status === 'approved' || booking.status === 'active' || booking.status === 'pending') && (
                  <button
                    onClick={() => setSelectedPassBooking(booking)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30 hover:bg-[#FEF7C7]/80 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>บัตรยืมดิจิทัล / สลิป</span>
                  </button>
                )}

                {booking.status === 'pending' && (
                  <button
                    disabled={cancellingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอ'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Borrowing Slip Modal with Primary #FC82A8 */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-[#FC82A8]/40 overflow-hidden my-4">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#FC82A8] to-[#eb7197] text-white text-center relative">
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Logo className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-lg tracking-tight">
                บัตรยืมอุปกรณ์การศึกษาดิจิทัล
              </h3>
              <p className="text-xs text-white/90">
                ภาควิชาเทคโนโลยีการศึกษา • Educational Technology
              </p>
            </div>

            {/* Slip Body */}
            <div className="p-6 space-y-4">
              
              {/* QR / Barcode simulation */}
              <div className="bg-[#fbfbf7] p-4 rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-gray-800" />
                </div>
                <div className="text-[11px] font-mono tracking-widest text-gray-500">
                  REF: {selectedPassBooking.id.substring(0, 16).toUpperCase()}
                </div>
                <div className="text-xs font-bold text-[#FC82A8]">
                  แสดงบัตรนี้ต่อเจ้าหน้าที่ประจำห้องบริการอุปกรณ์
                </div>
              </div>

              {/* Items Detail */}
              <div className="space-y-2 text-xs border-y border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">อุปกรณ์:</span>
                  <span className="font-bold text-gray-900 text-right">{selectedPassBooking.equipmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">รหัสอุปกรณ์:</span>
                  <span className="font-mono font-bold text-[#FC82A8]">{selectedPassBooking.equipmentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">จำนวน:</span>
                  <span className="font-bold text-gray-900">{selectedPassBooking.quantity} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">กำหนดเวลายืม:</span>
                  <span className="font-bold text-gray-900">{selectedPassBooking.startDate} ถึง {selectedPassBooking.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ผู้ขอยืม:</span>
                  <span className="font-bold text-gray-900">{selectedPassBooking.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">รหัสนักศึกษา:</span>
                  <span className="font-semibold text-gray-900">{selectedPassBooking.userStudentId || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">เบอร์โทรศัพท์:</span>
                  <span className="font-semibold text-gray-900">{selectedPassBooking.userPhone || '-'}</span>
                </div>
              </div>

              {/* Purpose */}
              <div className="bg-[#FEF7C7]/40 p-3 rounded-xl border border-[#FEF7C7] text-xs text-gray-700">
                <span className="font-bold text-gray-800">วัตถุประสงค์: </span>
                {selectedPassBooking.purpose}
              </div>

              {/* Close & Print Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedPassBooking(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#FC82A8]/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์บัตรยืม</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
