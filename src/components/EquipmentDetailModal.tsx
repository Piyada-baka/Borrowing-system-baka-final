import React from 'react';
import { Equipment } from '../types';
import { X, CheckCircle, AlertTriangle, MapPin, Package, Info, Calendar } from 'lucide-react';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onBook,
}) => {
  if (!isOpen || !equipment) return null;

  const isAvailable = equipment.availableQuantity > 0 && equipment.status === 'available';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-[#FC82A8]/30 overflow-hidden my-6">
        
        {/* Image & Header */}
        <div className="relative h-64 sm:h-72 w-full bg-gray-100 overflow-hidden">
          <img
            src={equipment.imageUrl}
            alt={equipment.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-xs transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FEF7C7] text-[#FC82A8] border border-[#FC82A8]/40">
                {equipment.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md">
                {equipment.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {equipment.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Status & Quantities */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#fbfbf7] p-4 rounded-2xl border border-gray-200/70">
            <div>
              <p className="text-xs text-gray-500 font-medium">สถานะอุปกรณ์</p>
              <div className="flex items-center gap-1.5 mt-1">
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#93A334]" />
                    <span className="text-sm font-bold text-[#93A334]">พร้อมใช้งาน</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#FC82A8]" />
                    <span className="text-sm font-bold text-[#FC82A8]">
                      {equipment.status === 'maintenance' ? 'ซ่อมบำรุง' : 'ถูกยืมหมด'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">จำนวนคงเหลือ</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                <span className="text-[#FC82A8] text-lg font-extrabold">{equipment.availableQuantity}</span> / {equipment.totalQuantity} ชิ้น
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 font-medium">สถานที่จัดเก็บ</p>
              <p className="text-xs font-semibold text-gray-800 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#93A334] shrink-0" />
                <span className="truncate">{equipment.location || 'ศูนย์เทคโนโลยีการศึกษา'}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
              <Info className="w-4 h-4 text-[#FC82A8]" />
              รายละเอียดคุณสมบัติ
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              {equipment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>

          {/* Accessories in the kit */}
          {equipment.accessories && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                <Package className="w-4 h-4 text-[#93A334]" />
                อุปกรณ์ร่วมในชุดที่ได้รับ
              </h4>
              <div className="bg-[#FEF7C7]/40 border border-[#FEF7C7] p-4 rounded-2xl text-xs sm:text-sm text-gray-800 leading-relaxed">
                {equipment.accessories}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              ปิด
            </button>
            <button
              disabled={!isAvailable}
              onClick={() => {
                onClose();
                onBook(equipment);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md shadow-[#FC82A8]/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{isAvailable ? 'ส่งคำขอขอยืมอุปกรณ์' : 'ไม่สามารถยืมได้ในขณะนี้'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
