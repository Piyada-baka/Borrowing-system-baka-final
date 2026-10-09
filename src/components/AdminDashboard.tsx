import React, { useState } from 'react';
import { Equipment, Booking, EquipmentStatus, AdminEmailDoc } from '../types';
import { useAuth, BOOTSTRAP_ADMIN_EMAIL } from '../context/AuthContext';
import { 
  BarChart3, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Shield, 
  UserPlus, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X, 
  Phone, 
  IdCard, 
  CheckSquare, 
  RefreshCw, 
  MapPin,
  Copy,
  Download,
  QrCode,
  Printer,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AddEquipmentModal } from './AddEquipmentModal';

interface AdminDashboardProps {
  equipments: Equipment[];
  bookings: Booking[];
  adminEmails: AdminEmailDoc[];
  onSeedData: () => void;
  loading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  equipments,
  bookings,
  adminEmails,
  onSeedData,
  loading,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'equipment' | 'admins'>('overview');

  // Search & Filter States
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState<string>('all');
  const [eqSearch, setEqSearch] = useState('');
  const [eqCatFilter, setEqCatFilter] = useState<string>('all');

  // Modals
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [returnInspectBooking, setReturnInspectBooking] = useState<Booking | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [labelEquipment, setLabelEquipment] = useState<Equipment | null>(null);

  // Admin email form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Return Inspection form
  const [returnCondition, setReturnCondition] = useState<'good' | 'damaged' | 'incomplete'>('good');
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Overdue calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueBookings = bookings.filter(
    (b) => (b.status === 'active' || b.status === 'approved') && b.endDate < todayStr
  );

  // Statistics
  const totalEquipments = equipments.length;
  const totalUnits = equipments.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const totalAvailableUnits = equipments.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  const totalBorrowedUnits = totalUnits - totalAvailableUnits;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'active' || b.status === 'approved').length;
  const returnedBookingsCount = bookings.filter((b) => b.status === 'returned').length;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.userName.toLowerCase().includes(reqSearch.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(reqSearch.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(reqSearch.toLowerCase()) ||
      b.equipmentCode.toLowerCase().includes(reqSearch.toLowerCase()) ||
      (b.userStudentId && b.userStudentId.includes(reqSearch));

    let matchStatus = true;
    if (reqStatusFilter === 'all') matchStatus = true;
    else if (reqStatusFilter === 'overdue') matchStatus = (b.status === 'active' || b.status === 'approved') && b.endDate < todayStr;
    else matchStatus = b.status === reqStatusFilter;

    return matchSearch && matchStatus;
  });

  // Filtered Equipments
  const filteredEquipments = equipments.filter((eq) => {
    const matchSearch =
      eq.name.toLowerCase().includes(eqSearch.toLowerCase()) ||
      eq.code.toLowerCase().includes(eqSearch.toLowerCase()) ||
      (eq.location && eq.location.toLowerCase().includes(eqSearch.toLowerCase())) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(eqSearch.toLowerCase()));

    const matchCat = eqCatFilter === 'all' ? true : eq.category === eqCatFilter;

    return matchSearch && matchCat;
  });

  // Action: Approve booking
  const handleApprove = async (booking: Booking) => {
    try {
      const bRef = doc(db, 'bookings', booking.id);
      await updateDoc(bRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.email || 'admin',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error approving booking:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.id}`);
    }
  };

  // Action: Mark as picked up / active (มารับอุปกรณ์แล้ว)
  const handleMarkPickedUp = async (booking: Booking) => {
    try {
      // 1. Decrement available quantity of equipment
      const eqRef = doc(db, 'equipment', booking.equipmentId);
      const eqSnap = await getDoc(eqRef);
      if (eqSnap.exists()) {
        const currentAvail = eqSnap.data().availableQuantity || 0;
        const newAvail = Math.max(0, currentAvail - booking.quantity);
        await updateDoc(eqRef, {
          availableQuantity: newAvail,
          status: newAvail === 0 ? 'unavailable' : 'available',
          updatedAt: new Date().toISOString(),
        });
      }

      // 2. Update booking to active
      const bRef = doc(db, 'bookings', booking.id);
      await updateDoc(bRef, {
        status: 'active',
        pickedUpAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error marking picked up:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.id}`);
    }
  };

  // Action: Confirm Rejection
  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    try {
      const bRef = doc(db, 'bookings', rejectingBooking.id);
      await updateDoc(bRef, {
        status: 'rejected',
        rejectionReason: rejectReason.trim() || 'ไม่อนุมัติเนื่องจากอุปกรณ์ติดภารกิจอื่น หรือข้อมูลไม่ครบถ้วน',
        updatedAt: new Date().toISOString(),
      });
      setRejectingBooking(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${rejectingBooking.id}`);
    }
  };

  // Action: Confirm Return & Inspection
  const handleConfirmReturn = async () => {
    if (!returnInspectBooking) return;
    setSubmittingReturn(true);

    try {
      // 1. Restore equipment available quantity
      const eqRef = doc(db, 'equipment', returnInspectBooking.equipmentId);
      const eqSnap = await getDoc(eqRef);
      if (eqSnap.exists()) {
        const eqData = eqSnap.data();
        const currentAvail = eqData.availableQuantity || 0;
        const total = eqData.totalQuantity || 1;
        const restoredAvail = Math.min(total, currentAvail + returnInspectBooking.quantity);
        await updateDoc(eqRef, {
          availableQuantity: restoredAvail,
          status: returnCondition === 'damaged' ? 'maintenance' : (restoredAvail > 0 ? 'available' : 'unavailable'),
          updatedAt: new Date().toISOString(),
        });
      }

      // 2. Update booking as returned
      const bRef = doc(db, 'bookings', returnInspectBooking.id);
      await updateDoc(bRef, {
        status: 'returned',
        returnedAt: new Date().toISOString(),
        returnCondition,
        returnNotes: returnNotes.trim(),
        returnInspectedBy: user?.email || 'admin',
        updatedAt: new Date().toISOString(),
      });

      setReturnInspectBooking(null);
      setReturnNotes('');
      setReturnCondition('good');
    } catch (err) {
      console.error('Error recording return:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${returnInspectBooking.id}`);
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Action: Quick Stock Adjustment (+1 / -1)
  const handleAdjustStock = async (eq: Equipment, delta: number) => {
    const newAvail = Math.max(0, Math.min(eq.totalQuantity, eq.availableQuantity + delta));
    if (newAvail === eq.availableQuantity) return;
    try {
      const ref = doc(db, 'equipment', eq.id);
      await updateDoc(ref, {
        availableQuantity: newAvail,
        status: newAvail === 0 ? 'unavailable' : eq.status === 'maintenance' ? 'maintenance' : 'available',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Adjust stock error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `equipment/${eq.id}`);
    }
  };

  // Action: Duplicate/Clone Equipment
  const handleDuplicateEquipment = (eq: Equipment) => {
    const cloned: Equipment = {
      ...eq,
      id: '', // reset id
      code: `${eq.code}-COPY`,
      name: `${eq.name} (สำเนา)`,
    };
    setEditingEquipment(cloned);
    setIsAddEquipmentOpen(true);
  };

  // Action: Export Bookings to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('ยังไม่มีข้อมูลการยืม-คืนสำหรับส่งออก');
      return;
    }

    const headers = [
      'รหัสคำขอ',
      'วันที่ยืม',
      'กำหนดคืน',
      'ชื่อผู้ยืม',
      'รหัสนักศึกษา/บุคลากร',
      'อีเมล',
      'เบอร์โทร',
      'รหัสอุปกรณ์',
      'ชื่ออุปกรณ์',
      'จำนวน',
      'วัตถุประสงค์',
      'สถานะ',
      'สภาพตอนคืน'
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.startDate}"`,
      `"${b.endDate}"`,
      `"${b.userName}"`,
      `"${b.userStudentId || '-'}"`,
      `"${b.userEmail}"`,
      `"${b.userPhone || '-'}"`,
      `"${b.equipmentCode}"`,
      `"${b.equipmentName}"`,
      b.quantity,
      `"${b.purpose.replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${b.returnCondition || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `edtech-borrowing-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Add new admin email
  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setIsAddingAdmin(true);
    setAdminActionMsg(null);

    const emailToAdd = newAdminEmail.toLowerCase().trim();

    try {
      await addDoc(collection(db, 'admin_emails'), {
        email: emailToAdd,
        addedAt: new Date().toISOString(),
        addedBy: user?.email || 'admin',
      });
      setAdminActionMsg(`เพิ่มอีเมล ${emailToAdd} ให้เป็นผู้ดูแลระบบแล้ว`);
      setNewAdminEmail('');
    } catch (err) {
      console.error('Error adding admin email:', err);
      setAdminActionMsg('เกิดข้อผิดพลาดในการเพิ่มอีเมลผู้ดูแล');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Action: Remove admin email
  const handleRemoveAdminEmail = async (id: string, email: string) => {
    if (!confirm(`ต้องการยกเลิกสิทธิ์ Admin ของ ${email} หรือไม่?`)) return;
    try {
      await deleteDoc(doc(db, 'admin_emails', id));
      setAdminActionMsg(`ยกเลิกสิทธิ์ของ ${email} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Error removing admin email:', err);
    }
  };

  // Action: Delete Equipment
  const handleDeleteEquipment = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}" ออกจากระบบ?`)) return;
    try {
      await deleteDoc(doc(db, 'equipment', id));
    } catch (err) {
      console.error('Error deleting equipment:', err);
      handleFirestoreError(err, OperationType.DELETE, `equipment/${id}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and Sub Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#FEF7C7] text-[#FC82A8]">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              ระบบจัดการสำหรับผู้ดูแล (Admin Control)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ควบคุมอุปกรณ์ ตรวจสอบและอนุมัติคำขอยืม บันทึกการส่งคืน และจัดการสิทธิ์ผู้ดูแลระบบ
          </p>
        </div>

        {/* Sub Tabs and Quick Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#fbfbf7] p-1.5 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#FC82A8] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ภาพรวม</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'requests'
                  ? 'bg-[#FC82A8] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>คำขอยืม-คืน</span>
              {pendingBookingsCount > 0 && (
                <span className="w-5 h-5 bg-[#93A334] text-white text-[11px] rounded-full flex items-center justify-center font-bold">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'equipment'
                  ? 'bg-[#FC82A8] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>จัดการอุปกรณ์</span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'admins'
                  ? 'bg-[#FC82A8] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>สิทธิ์ Admin</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingEquipment(null);
              setIsAddEquipmentOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FC82A8]/25 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มอุปกรณ์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Overdue Warning Alert Banner */}
      {overdueBookings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm">
                มีอุปกรณ์เกินกำหนดส่งคืน {overdueBookings.length} รายการ
              </span>
              <p className="text-[11px] text-amber-700">
                ผู้ยืมยังไม่ได้นำอุปกรณ์มาส่งคืนตามวันที่กำหนด กรุณาตรวจสอบและติดต่อผู้ยืม
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('requests');
              setReqStatusFilter('overdue');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shrink-0 cursor-pointer"
          >
            ดูรายการเกินกำหนด
          </button>
        </div>
      )}

      {/* ======================= TAB 1: OVERVIEW ======================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">อุปกรณ์ทั้งหมด</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{totalEquipments} รายการ</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">รวม {totalUnits} ชิ้นในคลัง</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">รออนุมัติ</p>
                <h3 className="text-2xl font-extrabold text-amber-600">{pendingBookingsCount} รายการ</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">รอดำเนินการตรวจสอบ</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FC82A8]/15 text-[#FC82A8] flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">กำลังถูกยืม</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{totalBorrowedUnits} ชิ้น</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">จาก {activeBookingsCount} คำขอที่อนุมัติ</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#93A334]/15 text-[#93A334] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">คืนแล้วสะสม</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{returnedBookingsCount} ครั้ง</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">พร้อมใช้งาน {totalAvailableUnits} ชิ้น</p>
              </div>
            </div>

          </div>

          {/* Quick Actions & Empty Database Alert */}
          {equipments.length === 0 && (
            <div className="p-6 rounded-3xl bg-[#FEF7C7]/50 border-2 border-[#FC82A8]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FC82A8] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">ฐานข้อมูลอุปกรณ์ยังว่างเปล่า</h3>
                  <p className="text-xs text-gray-600">
                    นำเข้าชุดอุปกรณ์มาตรฐานของภาควิชาเทคโนโลยีการศึกษา (กล้อง Sony/Canon, ไมค์ RØDE/Shure, กิมบอล, ไฟสตูดิโอ ฯลฯ)
                  </p>
                </div>
              </div>
              <button
                onClick={onSeedData}
                className="px-5 py-2.5 rounded-xl bg-[#FC82A8] hover:bg-[#eb7197] text-white font-bold text-xs sm:text-sm shadow-md whitespace-nowrap cursor-pointer"
              >
                นำเข้าข้อมูล 8 รายการทันที
              </button>
            </div>
          )}

          {/* Category Distribution Overview */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FC82A8]" />
                สถานะอุปกรณ์แยกตามหมวดหมู่
              </h3>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#FC82A8]" />
                <span>ส่งออกรายงาน CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'กล้องและเลนส์',
                'ไมโครโฟนและเสียง',
                'ขาตั้งกล้องและกิมบอล',
                'ไฟสตูดิโอและจัดแสง',
                'โปรเจกเตอร์และจอภาพ',
                'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ',
                'คอมพิวเตอร์และแท็บเล็ต',
                'อุปกรณ์เสริมและสายสัญญาณ',
              ].map((category) => {
                const itemsInCat = equipments.filter((e) => e.category === category);
                const totalInCat = itemsInCat.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
                const availInCat = itemsInCat.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
                return (
                  <div key={category} className="p-3.5 rounded-2xl bg-[#fbfbf7] border border-gray-200/70">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>{category}</span>
                      <span className="text-[#FC82A8]">{itemsInCat.length} รุ่น</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                      <span>คงเหลือพร้อมยืม: <strong className="text-gray-800">{availInCat}</strong> / {totalInCat} ชิ้น</span>
                      <span className="font-semibold text-[#93A334]">
                        {totalInCat > 0 ? Math.round((availInCat / totalInCat) * 100) : 0}% ว่าง
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: REQUESTS MANAGEMENT ======================= */}
      {activeTab === 'requests' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                placeholder="ค้นหาตามชื่อผู้ยืม, รหัสนักศึกษา, ชื่ออุปกรณ์ หรือรหัส..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-[#FC82A8]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1 rounded-2xl border border-gray-200">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'pending', label: 'รออนุมัติ' },
                { id: 'approved', label: 'อนุมัติแล้ว' },
                { id: 'active', label: 'กำลังยืม' },
                { id: 'overdue', label: '⚠️ เกินกำหนด' },
                { id: 'returned', label: 'คืนแล้ว' },
                { id: 'rejected', label: 'ปฏิเสธ' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setReqStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    reqStatusFilter === f.id
                      ? f.id === 'overdue' ? 'bg-amber-600 text-white font-bold' : 'bg-[#FC82A8] text-white font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#FC82A8] hover:bg-[#FEF7C7] flex items-center gap-1 border border-[#FC82A8]/30 cursor-pointer ml-1"
                title="ดาวน์โหลดไฟล์รายงาน CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Bookings Count */}
          <p className="text-xs text-gray-500 font-medium">
            พบคำขอทั้งหมด <strong className="text-gray-800">{filteredBookings.length}</strong> รายการ
          </p>

          {/* Bookings Table / Cards */}
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 text-gray-400">
              <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">ไม่พบคำขอในหมวดหมู่นี้</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const isOverdue = (b.status === 'active' || b.status === 'approved') && b.endDate < todayStr;

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                      isOverdue ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200/90'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Image */}
                      {b.equipmentImageUrl ? (
                        <img
                          src={b.equipmentImageUrl}
                          alt={b.equipmentName}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center shrink-0">
                          <Package className="w-7 h-7" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30">
                            {b.equipmentCode}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            {b.equipmentName} ({b.quantity} ชิ้น)
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white animate-pulse">
                              เกินกำหนดส่งคืน!
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-bold flex items-center gap-1">
                            ผู้ยืม: {b.userName}
                          </span>
                          {b.userStudentId && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <IdCard className="w-3.5 h-3.5 text-gray-400" />
                              รหัส: {b.userStudentId}
                            </span>
                          )}
                          {b.userPhone && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              โทร: {b.userPhone}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                          <span>วันที่ยืม: <strong className="text-gray-800">{b.startDate}</strong></span>
                          <span>กำหนดคืน: <strong className={isOverdue ? 'text-amber-700 font-bold' : 'text-gray-800'}>{b.endDate}</strong></span>
                        </div>

                        <p className="text-xs text-gray-600 italic bg-gray-50 px-2.5 py-1 rounded-lg">
                          วัตถุประสงค์: &ldquo;{b.purpose}&rdquo;
                        </p>

                        {/* Return check details if returned */}
                        {b.status === 'returned' && (
                          <div className="text-xs text-[#93A334] bg-[#93A334]/10 px-2.5 py-1 rounded-lg border border-[#93A334]/30">
                            คืนแล้ว • สภาพ: {b.returnCondition === 'good' ? 'สมบูรณ์ 100%' : b.returnCondition === 'damaged' ? 'ชำรุดเสียหาย' : 'อุปกรณ์ไม่ครบ'} 
                            {b.returnNotes && ` (หมายเหตุ: ${b.returnNotes})`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions according to status */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      {/* Status: Pending -> Approve or Reject */}
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(b)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-xs cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>อนุมัติคำขอ</span>
                          </button>
                          <button
                            onClick={() => setRejectingBooking(b)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>ปฏิเสธ</span>
                          </button>
                        </>
                      )}

                      {/* Status: Approved -> Mark as Picked Up / Active when user comes */}
                      {b.status === 'approved' && (
                        <button
                          onClick={() => handleMarkPickedUp(b)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#93A334] hover:bg-[#82922e] text-white shadow-xs cursor-pointer"
                          title="คลิกเมื่อผู้ยืมมารับอุปกรณ์จริง"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>บันทึกการส่งมอบอุปกรณ์ (มารับของ)</span>
                        </button>
                      )}

                      {/* Status: Active -> Record Return & Inspect */}
                      {b.status === 'active' && (
                        <button
                          onClick={() => {
                            setReturnInspectBooking(b);
                            setReturnCondition('good');
                            setReturnNotes('');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md shadow-[#FC82A8]/20 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>บันทึกการคืน & ตรวจสภาพ</span>
                        </button>
                      )}

                      {b.status === 'returned' && (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                          คืนอุปกรณ์แล้ว
                        </span>
                      )}

                      {b.status === 'rejected' && (
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl">
                          ปฏิเสธแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: EQUIPMENT CRUD ======================= */}
      {activeTab === 'equipment' && (
        <div className="space-y-5">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={eqSearch}
                onChange={(e) => setEqSearch(e.target.value)}
                placeholder="ค้นหาตามชื่ออุปกรณ์ รหัส เลขครุภัณฑ์ หรือสถานที่จัดเก็บ..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-[#FC82A8]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={eqCatFilter}
                onChange={(e) => setEqCatFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
              >
                <option value="all">ทุกหมวดหมู่ ({equipments.length})</option>
                <option value="กล้องและเลนส์">กล้องและเลนส์</option>
                <option value="ไมโครโฟนและเสียง">ไมโครโฟนและเสียง</option>
                <option value="ขาตั้งกล้องและกิมบอล">ขาตั้งกล้องและกิมบอล</option>
                <option value="ไฟสตูดิโอและจัดแสง">ไฟสตูดิโอและจัดแสง</option>
                <option value="โปรเจกเตอร์และจอภาพ">โปรเจกเตอร์และจอภาพ</option>
                <option value="อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ">อุปกรณ์ไลฟ์สตรีม</option>
              </select>

              <button
                onClick={() => {
                  setEditingEquipment(null);
                  setIsAddEquipmentOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FC82A8]/20 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มอุปกรณ์ใหม่</span>
              </button>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-white rounded-3xl border border-gray-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={eq.imageUrl}
                      alt={eq.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 text-gray-800">
                      {eq.category}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/30">
                      {eq.code}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {eq.name}
                  </h3>

                  {eq.serialNumber && (
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                      ครุภัณฑ์: {eq.serialNumber}
                    </div>
                  )}

                  {/* Stock counter & quick adjustments */}
                  <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <span className="text-gray-500">พร้อมยืม: </span>
                      <strong className="text-[#FC82A8] text-sm">{eq.availableQuantity}</strong>
                      <span className="text-gray-400"> / {eq.totalQuantity}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-400 mr-1">ปรับสต็อก:</span>
                      <button
                        onClick={() => handleAdjustStock(eq, -1)}
                        disabled={eq.availableQuantity <= 0}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
                        title="ลดจำนวนพร้อมยืม 1 ชิ้น"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustStock(eq, 1)}
                        disabled={eq.availableQuantity >= eq.totalQuantity}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
                        title="เพิ่มจำนวนพร้อมยืม 1 ชิ้น"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {eq.location && (
                    <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#93A334]" />
                      <span>{eq.location}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLabelEquipment(eq)}
                      className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-[#FEF7C7]/50 transition-colors cursor-pointer"
                      title="พิมพ์ป้ายสติกเกอร์ติดอุปกรณ์ (QR Label)"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateEquipment(eq)}
                      className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-[#FEF7C7]/50 transition-colors cursor-pointer"
                      title="คัดลอกสร้างชิ้นใหม่ (Duplicate)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingEquipment(eq);
                        setIsAddEquipmentOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบอุปกรณ์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: ADMIN ROLE MANAGEMENT ======================= */}
      {activeTab === 'admins' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FC82A8]" />
              จัดการสิทธิ์ผู้ดูแลระบบ (Admin Access Control)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              เพิ่มอีเมลของอาจารย์หรือเจ้าหน้าที่ เพื่อให้สามารถเข้าสู่หน้าจัดการระบบ อนุมัติการยืม และบันทึกคืนอุปกรณ์ได้
            </p>
          </div>

          {adminActionMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{adminActionMsg}</span>
            </div>
          )}

          {/* Add Admin Email Form */}
          <form onSubmit={handleAddAdminEmail} className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              เพิ่มอีเมลผู้ดูแลระบบใหม่
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="ระบุ email เช่น lecturer@university.ac.th"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#FC82A8]"
              />
              <button
                type="submit"
                disabled={isAddingAdmin}
                className="px-5 py-2.5 rounded-xl bg-[#FC82A8] hover:bg-[#eb7197] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-[#FC82A8]/20 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>เพิ่ม Admin</span>
              </button>
            </div>
          </form>

          {/* Current Admins List */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700">รายชื่อผู้ดูแลระบบปัจจุบัน</h3>

            {/* Bootstrapped Admin */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FEF7C7]/40 border border-[#FEF7C7]">
              <div>
                <span className="font-bold text-gray-800 text-xs sm:text-sm">{BOOTSTRAP_ADMIN_EMAIL}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FC82A8] text-white">
                  Super Admin (Primary)
                </span>
              </div>
              <span className="text-xs text-gray-400">ระบบเริ่มต้น</span>
            </div>

            {/* Other Configured Admin Emails */}
            {adminEmails.map((item) => (
              <div
                key={item.id || item.email}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200"
              >
                <div>
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm">{item.email}</span>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    เพิ่มเมื่อ: {item.addedAt ? new Date(item.addedAt).toLocaleDateString('th-TH') : '-'} โดย {item.addedBy}
                  </div>
                </div>
                {item.id && (
                  <button
                    onClick={() => handleRemoveAdminEmail(item.id!, item.email)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= MODAL: REJECT CONFIRM ======================= */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              ปฏิเสธคำขอยืมอุปกรณ์
            </h3>
            <p className="text-xs text-gray-600">
              อุปกรณ์: <strong className="text-gray-800">{rejectingBooking.equipmentName}</strong> สำหรับ {rejectingBooking.userName}
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ระบุเหตุผลในการปฏิเสธ
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น อุปกรณ์มีตารางใช้งานซ้อนทับ, ติดซ่อมบำรุง, เอกสารไม่ครบถ้วน..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: RETURN INSPECTION ======================= */}
      {returnInspectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#FC82A8]/30 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#FC82A8]" />
                บันทึกการส่งคืน & ตรวจสภาพอุปกรณ์
              </h3>
              <button
                onClick={() => setReturnInspectBooking(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbfbf7] border border-gray-200/80 text-xs space-y-1">
              <div>อุปกรณ์: <strong className="text-gray-900">{returnInspectBooking.equipmentName}</strong></div>
              <div>รหัส: <span className="font-mono text-[#FC82A8] font-bold">{returnInspectBooking.equipmentCode}</span> ({returnInspectBooking.quantity} ชิ้น)</div>
              <div>ผู้ยืม: <span className="font-semibold text-gray-800">{returnInspectBooking.userName}</span> ({returnInspectBooking.userStudentId})</div>
            </div>

            {/* Condition check radios */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ผลการตรวจสอบสภาพอุปกรณ์เมื่อรับคืน
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReturnCondition('good')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    returnCondition === 'good'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs">สมบูรณ์ 100%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReturnCondition('incomplete')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    returnCondition === 'incomplete'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold ring-2 ring-amber-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs">อุปกรณ์ไม่ครบ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReturnCondition('damaged')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    returnCondition === 'damaged'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold ring-2 ring-rose-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                  <span className="text-xs">ชำรุด / เสียหาย</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                บันทึกหมายเหตุการตรวจสอบ (เช่น ขาดสายชาร์จ, เลนส์มีฝุ่น, ทำความสะอาดแล้ว)
              </label>
              <textarea
                rows={2}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="ระบุข้อสังเกตเพิ่มเติม (ถ้ามี)..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FC82A8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReturnInspectBooking(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={submittingReturn}
                onClick={handleConfirmReturn}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submittingReturn ? 'กำลังบันทึก...' : 'ยืนยันรับคืนอุปกรณ์'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: PRINT ASSET LABEL ======================= */}
      {labelEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-[#FEF7C7] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#FC82A8]" />
                ป้ายครุภัณฑ์สำหรับติดอุปกรณ์
              </h3>
              <button
                onClick={() => setLabelEquipment(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticker Graphic */}
            <div className="p-4 bg-white border-2 border-dashed border-gray-400 rounded-2xl text-center space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                ภาควิชาเทคโนโลยีการศึกษา
              </div>
              <div className="w-24 h-24 mx-auto bg-gray-50 border border-gray-200 rounded-xl p-2 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-gray-800" />
              </div>
              <div className="font-mono text-base font-extrabold text-[#FC82A8]">
                {labelEquipment.code}
              </div>
              <div className="text-xs font-bold text-gray-900 line-clamp-1">
                {labelEquipment.name}
              </div>
              {labelEquipment.serialNumber && (
                <div className="text-[10px] text-gray-500 font-mono">
                  เลขครุภัณฑ์: {labelEquipment.serialNumber}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLabelEquipment(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                ปิด
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#FC82A8]/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ป้าย</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= COMPONENT MODAL: ADD / EDIT EQUIPMENT ======================= */}
      {isAddEquipmentOpen && (
        <AddEquipmentModal
          isOpen={isAddEquipmentOpen}
          equipmentToEdit={editingEquipment}
          existingEquipments={equipments}
          onClose={() => {
            setIsAddEquipmentOpen(false);
            setEditingEquipment(null);
          }}
          onSuccess={(msg) => {
            alert(msg);
          }}
        />
      )}

    </div>
  );
};
