import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { AddEquipmentModal } from './components/AddEquipmentModal';
import { ViewModeBanner } from './components/ViewModeBanner';
import { Logo } from './components/Logo';
import { Equipment, Booking, AdminEmailDoc } from './types';
import { collection, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { INITIAL_EQUIPMENT_DATA } from './data/seedEquipment';
import { CheckCircle2, Sparkles, Building, Phone, Clock, PlusCircle } from 'lucide-react';

// Default initial equipment list with stable ids so website ALWAYS has equipment from start
const PRELOADED_EQUIPMENT: Equipment[] = INITIAL_EQUIPMENT_DATA.map((item, idx) => ({
  id: `preloaded-eq-${idx + 1}`,
  ...item,
}));

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-bookings' | 'admin'>('catalog');
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');

  // Sync viewMode when admin status loads
  useEffect(() => {
    if (isAdmin) {
      setViewMode('admin');
      setActiveTab('admin');
    } else {
      setViewMode('user');
      setActiveTab('catalog');
    }
  }, [isAdmin]);

  // Firestore Data State: Pre-loaded with realistic EdTech equipment right from the start!
  const [equipments, setEquipments] = useState<Equipment[]>(PRELOADED_EQUIPMENT);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminEmails, setAdminEmails] = useState<AdminEmailDoc[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Modal States
  const [detailEquipment, setDetailEquipment] = useState<Equipment | null>(null);
  const [bookingEquipment, setBookingEquipment] = useState<Equipment | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);

  // Toast Banner State
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Real-time listener: Equipment with auto-seed if empty
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'equipment'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: Equipment[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Equipment[];
          setEquipments(list);
        } else {
          // If Firestore collection is empty, auto seed the 8 items
          try {
            for (const item of INITIAL_EQUIPMENT_DATA) {
              await addDoc(collection(db, 'equipment'), {
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          } catch {
            // If rules prevent unauthenticated writes, keep PRELOADED_EQUIPMENT in state
          }
        }
        setLoadingEquipments(false);
      },
      (error) => {
        console.warn('Firestore equipment listener, falling back to preloaded data:', error);
        setLoadingEquipments(false);
      }
    );

    return () => unsub();
  }, []);

  // Real-time listener: Bookings
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const list: Booking[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Booking[];
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setBookings(list);
        setLoadingBookings(false);
      },
      (error) => {
        console.warn('Firestore bookings listener:', error);
        setLoadingBookings(false);
      }
    );

    return () => unsub();
  }, []);

  // Real-time listener: Admin emails
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'admin_emails'),
      (snapshot) => {
        const list: AdminEmailDoc[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AdminEmailDoc[];
        setAdminEmails(list);
      },
      (error) => {
        console.warn('Firestore admin_emails listener:', error);
      }
    );

    return () => unsub();
  }, []);

  // Seed sample data handler
  const handleSeedData = async () => {
    try {
      for (const item of INITIAL_EQUIPMENT_DATA) {
        await addDoc(collection(db, 'equipment'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      showToast('นำเข้าอุปกรณ์ตัวอย่าง 8 รายการเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('Error seeding data:', err);
      showToast('ไม่สามารถนำเข้าข้อมูลได้ กรุณาตรวจสอบสิทธิ์', 'info');
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  const handleToggleViewMode = (mode: 'user' | 'admin') => {
    setViewMode(mode);
    if (mode === 'admin') {
      setActiveTab('admin');
      showToast('สลับเข้าสู่ "มุมมองผู้ดูแลระบบ (Admin Mode)" เรียบร้อยแล้ว');
    } else {
      setActiveTab('catalog');
      showToast('สลับเข้าสู่ "มุมมองผู้ใช้งานทั่วไป (Student View)" เรียบร้อยแล้ว');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcf9]">
      {/* Toast Notification with Primary #FC82A8 */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white shadow-xl border-2 border-[#FC82A8] text-gray-800 text-xs sm:text-sm font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#FC82A8] shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#93A334] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Role / Perspective Switcher Banner */}
      <ViewModeBanner
        currentViewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        pendingRequestsCount={pendingCount}
      />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'admin') setViewMode('admin');
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAddEquipment={() => setIsAddEquipmentOpen(true)}
        pendingCount={pendingCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* User View: Catalog */}
        {activeTab === 'catalog' && (
          <CatalogView
            equipments={equipments}
            onSelectEquipment={(eq) => setDetailEquipment(eq)}
            onBookEquipment={(eq) => {
              setBookingEquipment(eq);
            }}
            onSeedData={handleSeedData}
            onOpenAddEquipment={() => setIsAddEquipmentOpen(true)}
            loading={loadingEquipments}
          />
        )}

        {/* User View: My Bookings */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            loading={loadingBookings}
            onExploreCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* Admin View: Full Management Control */}
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard
            equipments={equipments}
            bookings={bookings}
            adminEmails={adminEmails}
            onSeedData={handleSeedData}
            loading={loadingEquipments}
          />
        )}
      </main>

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        equipment={detailEquipment}
        isOpen={!!detailEquipment}
        onClose={() => setDetailEquipment(null)}
        onBook={(eq) => {
          setBookingEquipment(eq);
        }}
      />

      {/* Booking Form Modal */}
      <BookingModal
        equipment={bookingEquipment}
        isOpen={!!bookingEquipment}
        onClose={() => setBookingEquipment(null)}
        onSuccess={() => {
          showToast('ส่งคำขอจองอุปกรณ์เรียบร้อยแล้ว! เจ้าหน้าที่จะตรวจสอบคำขอของคุณ');
          setActiveTab('my-bookings');
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Add Equipment Modal */}
      {isAddEquipmentOpen && (
        <AddEquipmentModal
          isOpen={isAddEquipmentOpen}
          existingEquipments={equipments}
          onClose={() => setIsAddEquipmentOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
          }}
        />
      )}

      {/* Floating "+ เพิ่มอุปกรณ์" Shortcut Button at bottom right */}
      <button
        onClick={() => setIsAddEquipmentOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-[#FC82A8] hover:bg-[#eb7197] text-white font-bold text-sm shadow-xl shadow-[#FC82A8]/35 hover:scale-105 transition-all cursor-pointer"
        title="เพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ"
      >
        <PlusCircle className="w-5 h-5" />
        <span>+ เพิ่มอุปกรณ์ใหม่</span>
      </button>

      {/* Footer with primary #FC82A8 accents & Logo */}
      <footer className="mt-auto border-t border-[#FC82A8]/20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Logo className="w-8 h-8" />
                <h4 className="font-bold text-gray-900 text-sm">
                  ระบบยืม-คืนอุปกรณ์ ภาควิชาเทคโนโลยีการศึกษา
                </h4>
              </div>
              <p className="text-gray-500 leading-relaxed">
                ระบบบริการและจัดการอุปกรณ์การศึกษา โสตทัศนูปกรณ์ สื่อการเรียนรู้ และงานผลิตสื่อ เพื่อการเรียนการสอนและงานวิจัย
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#FC82A8]" />
                สถานที่ติดต่อ & ศูนย์บริการ
              </h4>
              <p className="text-gray-500 leading-relaxed">
                ห้องศูนย์บริการอุปกรณ์และสื่อการเรียนรู้ ชั้น 3 อาคารภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-gray-700">
                <Clock className="w-3.5 h-3.5 text-[#93A334]" />
                <span>วันจันทร์ - ศุกร์ เวลา 08:30 - 16:30 น. (เว้นวันหยุดราชการ)</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#FC82A8]" />
                ข้อปฏิบัติการยืม-คืน
              </h4>
              <ul className="text-gray-500 space-y-1 list-disc list-inside">
                <li>โปรดส่งคำขอล่วงหน้าอย่างน้อย 1-2 วันทำการ</li>
                <li>แสดงบัตรยืมดิจิทัลพร้อมบัตรนักศึกษา/ประจำตัว</li>
                <li>ตรวจสอบอุปกรณ์ร่วมในชุดก่อนและหลังส่งมอบ</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
            <div>
              © 2026 Educational Technology Department Equipment Borrowing System.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FC82A8]" />
              <span>ระบบฐานข้อมูลคลาวด์ Firebase เชื่อมต่อแบบเรียลไทม์</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
