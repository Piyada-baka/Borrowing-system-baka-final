import React, { useState } from 'react';
import { Equipment, EquipmentCategory } from '../types';
import { 
  Search, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  MapPin, 
  SlidersHorizontal, 
  PlusCircle, 
  CalendarPlus 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface CatalogViewProps {
  equipments: Equipment[];
  onSelectEquipment: (equipment: Equipment) => void;
  onBookEquipment: (equipment: Equipment) => void;
  onSeedData?: () => void;
  onOpenAddEquipment?: () => void;
  loading: boolean;
}

const CATEGORIES: (EquipmentCategory | 'ทั้งหมด')[] = [
  'ทั้งหมด',
  'กล้องและเลนส์',
  'ไมโครโฟนและเสียง',
  'ขาตั้งกล้องและกิมบอล',
  'ไฟสตูดิโอและจัดแสง',
  'โปรเจกเตอร์และจอภาพ',
  'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ',
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  equipments,
  onSelectEquipment,
  onBookEquipment,
  onSeedData,
  onOpenAddEquipment,
  loading,
}) => {
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtered equipment list
  const filteredEquipments = equipments.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    const matchAvailability =
      !onlyAvailable || (item.availableQuantity > 0 && item.status === 'available');

    return matchSearch && matchCategory && matchAvailability;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner featuring Logo and Primary #FC82A8 with #FEF7C7 and #93A334 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FC82A8]/15 via-[#FEF7C7]/60 to-white border border-[#FC82A8]/30 p-6 sm:p-10 shadow-sm">
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#FC82A8]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-44 h-44 rounded-full bg-[#FEF7C7] blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#93A334]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#FC82A8] text-xs font-bold border border-[#FC82A8]/30 shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FC82A8]" />
              ศูนย์บริการยืม-คืนอุปกรณ์การศึกษาและโสตทัศนูปกรณ์
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              ระบบยืม-คืนอุปกรณ์ <br />
              <span className="text-[#FC82A8]">ภาควิชาเทคโนโลยีการศึกษา</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
              บริการยืมอุปกรณ์ผลิตสื่อการสอน กล้องถ่ายทำ ไมโครโฟน ไฟสตูดิโอ และโปรเจกเตอร์
              สำหรับนิสิต นักศึกษา อาจารย์ และบุคลากร ตรวจสอบคลังอุปกรณ์และส่งคำขอจองได้ทันที
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {onOpenAddEquipment && (
                <button
                  onClick={onOpenAddEquipment}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white font-bold text-sm shadow-md shadow-[#FC82A8]/25 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ เพิ่มอุปกรณ์ใหม่เข้าคลัง</span>
                </button>
              )}

              {!user && (
                <button
                  onClick={signInWithGoogle}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 shadow-xs transition-all cursor-pointer"
                >
                  เข้าสู่ระบบด้วย Google
                </button>
              )}
            </div>
          </div>

          {/* Logo Badge Card in Hero */}
          <div className="shrink-0 p-4 bg-white/90 rounded-3xl border border-[#FC82A8]/20 shadow-md flex flex-col items-center justify-center text-center">
            <Logo className="w-24 h-24 sm:w-28 sm:h-28" />
            <div className="mt-2 text-xs font-extrabold text-gray-900">
              EdTech Borrowing
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              Educational Technology
            </div>
          </div>
        </div>

        {/* 4 Steps How-to-Borrow Guide */}
        <div className="mt-8 pt-6 border-t border-[#FC82A8]/20 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white/80 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-[#FC82A8] text-white text-[11px] font-bold flex items-center justify-center mb-1">1</span>
            <div className="font-bold text-gray-800 text-xs">เลือกอุปกรณ์</div>
            <div className="text-[11px] text-gray-500">เช็กสถานะความพร้อมและอุปกรณ์ในชุด</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-[#FEF7C7] text-gray-800 text-[11px] font-bold flex items-center justify-center mb-1 border border-gray-300">2</span>
            <div className="font-bold text-gray-800 text-xs">ส่งคำขอจอง</div>
            <div className="text-[11px] text-gray-500">ระบุวันที่ยืม-คืน และวัตถุประสงค์การใช้</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-[#93A334] text-white text-[11px] font-bold flex items-center justify-center mb-1">3</span>
            <div className="font-bold text-gray-800 text-xs">รอการอนุมัติ</div>
            <div className="text-[11px] text-gray-500">เจ้าหน้าที่ตรวจสอบคิวและยืนยัน</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center mb-1">4</span>
            <div className="font-bold text-gray-800 text-xs">รับอุปกรณ์จริง</div>
            <div className="text-[11px] text-gray-500">แสดงบัตรดิจิทัลที่ศูนย์โสตทัศนูปกรณ์</div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่ออุปกรณ์ รหัส (เช่น EDTECH-CAM-001) หรือคุณสมบัติ..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FC82A8] shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 cursor-pointer"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Quick toggle for available only */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border shrink-0 cursor-pointer ${
              onlyAvailable
                ? 'bg-[#93A334] text-white border-[#93A334] shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>เฉพาะที่มีให้ยืม</span>
          </button>

          {/* Add equipment shortcut button */}
          {onOpenAddEquipment && (
            <button
              onClick={onOpenAddEquipment}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-xs shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มอุปกรณ์</span>
            </button>
          )}
        </div>

        {/* Category Pill Buttons with Primary #FC82A8 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FC82A8] text-white shadow-sm font-bold'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment List Status count */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>
          พบอุปกรณ์ทั้งหมด <strong className="text-gray-800">{filteredEquipments.length}</strong> รายการ
        </span>
        {onlyAvailable && (
          <span className="text-[#93A334] font-semibold">
            (กรองเฉพาะอุปกรณ์ที่พร้อมใช้งาน)
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <div className="w-10 h-10 border-4 border-[#FC82A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">กำลังโหลดข้อมูลอุปกรณ์...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEquipments.length === 0 && (
        <div className="py-16 px-4 text-center bg-white rounded-3xl border border-gray-200 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FEF7C7] text-[#FC82A8] flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">ไม่พบอุปกรณ์ที่ค้นหา</h3>
            <p className="text-xs text-gray-500 mt-1">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
            </p>
          </div>

          {onOpenAddEquipment && (
            <button
              onClick={onOpenAddEquipment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FC82A8] hover:bg-[#eb7197] text-white text-sm font-bold shadow-md shadow-[#FC82A8]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>เพิ่มอุปกรณ์ใหม่ทันที</span>
            </button>
          )}
        </div>
      )}

      {/* Equipment Grid */}
      {!loading && filteredEquipments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipments.map((item) => {
            const isAvailable = item.availableQuantity > 0 && item.status === 'available';
            const isLowStock = item.availableQuantity === 1 && isAvailable;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-gray-200/90 hover:border-[#FC82A8]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div 
                  onClick={() => onSelectEquipment(item)}
                  className="relative h-48 w-full bg-gray-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Chip */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/90 backdrop-blur-md text-gray-800 shadow-xs">
                    {item.category}
                  </span>

                  {/* Stock Status Chip */}
                  <div className="absolute top-3 right-3">
                    {isAvailable ? (
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md shadow-xs flex items-center gap-1 ${
                        isLowStock 
                          ? 'bg-[#FEF7C7] text-amber-800 border border-amber-300'
                          : 'bg-[#93A334] text-white'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        ว่าง {item.availableQuantity} ชิ้น
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FC82A8] text-white shadow-xs">
                        {item.status === 'maintenance' ? 'ซ่อมบำรุง' : 'ถูกยืมหมด'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Code Badge */}
                    <div className="text-[11px] font-bold text-[#FC82A8] tracking-wide mb-1 flex items-center gap-1">
                      <span>{item.code}</span>
                      {item.serialNumber && (
                        <span className="text-gray-400 font-mono font-normal">({item.serialNumber})</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectEquipment(item)}
                      className="font-bold text-gray-900 text-base line-clamp-2 leading-snug group-hover:text-[#FC82A8] transition-colors cursor-pointer"
                    >
                      {item.name}
                    </h3>

                    {/* Description preview */}
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.description || item.accessories}
                    </p>

                    {/* Location tag */}
                    {item.location && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#93A334] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action buttons with Primary #FC82A8 */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectEquipment(item)}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-[#FEF7C7]/50 transition-colors cursor-pointer"
                      title="ดูรายละเอียดอุปกรณ์"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      disabled={!isAvailable}
                      onClick={() => onBookEquipment(item)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-xs hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'จองอุปกรณ์นี้' : 'ไม่ว่าง'}</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
