import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';
import { 
  X, 
  Plus, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Package, 
  Tag, 
  MapPin, 
  CheckSquare, 
  Trash2,
  Copy,
  Info
} from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { EQUIPMENT_PRESETS, PRESET_IMAGE_GALLERY, CATEGORY_PREFIX_MAP } from '../data/equipmentPresets';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
  existingEquipments: Equipment[];
  onSuccess: (message: string) => void;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  equipmentToEdit,
  existingEquipments,
  onSuccess,
}) => {
  const isEditing = !!equipmentToEdit;

  // Form States
  const [code, setCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('กล้องและเลนส์');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [status, setStatus] = useState<EquipmentStatus>('available');
  const [condition, setCondition] = useState('สมบูรณ์ 100%');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3');
  
  // Checklist builder for accessories
  const [accessoriesList, setAccessoriesList] = useState<string[]>([
    'แบตเตอรี่ (2 ก้อน)',
    'แท่นชาร์จไฟ',
    'กระเป๋ากันกระแทก'
  ]);
  const [newAccessoryItem, setNewAccessoryItem] = useState('');

  // Image mode: 'preset' | 'url' | 'upload'
  const [imageMode, setImageMode] = useState<'preset' | 'url' | 'upload'>('preset');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (equipmentToEdit) {
      setCode(equipmentToEdit.code || '');
      setSerialNumber(equipmentToEdit.serialNumber || '');
      setName(equipmentToEdit.name || '');
      setCategory((equipmentToEdit.category as EquipmentCategory) || 'กล้องและเลนส์');
      setTotalQuantity(equipmentToEdit.totalQuantity || 1);
      setAvailableQuantity(equipmentToEdit.availableQuantity || 1);
      setStatus(equipmentToEdit.status || 'available');
      setCondition(equipmentToEdit.condition || 'สมบูรณ์ 100%');
      setImageUrl(equipmentToEdit.imageUrl || '');
      setDescription(equipmentToEdit.description || '');
      setLocation(equipmentToEdit.location || 'ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3');

      if (equipmentToEdit.accessories) {
        const split = equipmentToEdit.accessories.split(',').map((s) => s.trim()).filter(Boolean);
        setAccessoriesList(split.length > 0 ? split : [equipmentToEdit.accessories]);
      }
    } else {
      // Default new item
      handleGenerateCode('กล้องและเลนส์');
      setSerialNumber('');
      setName('');
      setCategory('กล้องและเลนส์');
      setTotalQuantity(1);
      setAvailableQuantity(1);
      setStatus('available');
      setCondition('สมบูรณ์ 100%');
      setImageUrl(PRESET_IMAGE_GALLERY[0].url);
      setDescription('');
      setLocation('ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3');
      setAccessoriesList(['แบตเตอรี่ (2 ก้อน)', 'แท่นชาร์จไฟ', 'กระเป๋ากันกระแทก']);
    }
  }, [equipmentToEdit, isOpen]);

  // Helper to auto-generate code based on existing items
  const handleGenerateCode = (selectedCat: string) => {
    const prefix = CATEGORY_PREFIX_MAP[selectedCat] || 'EDTECH-EQ';
    const sameCategoryItems = existingEquipments.filter((e) => e.code?.startsWith(prefix));
    const nextNum = sameCategoryItems.length + 1;
    const formattedCode = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    setCode(formattedCode);
  };

  // Helper: Apply a preset
  const handleApplyPreset = (presetName: string) => {
    const found = EQUIPMENT_PRESETS.find((p) => p.name === presetName);
    if (!found) return;

    setName(found.name);
    setCategory(found.category as EquipmentCategory);
    setImageUrl(found.imageUrl);
    setDescription(found.description);
    setLocation(found.location);
    handleGenerateCode(found.category);

    const split = found.accessories.split(',').map((s) => s.trim()).filter(Boolean);
    setAccessoriesList(split);
  };

  // Add accessory to checklist
  const handleAddAccessory = () => {
    if (!newAccessoryItem.trim()) return;
    setAccessoriesList([...accessoriesList, newAccessoryItem.trim()]);
    setNewAccessoryItem('');
  };

  // Remove accessory
  const handleRemoveAccessory = (index: number) => {
    setAccessoriesList(accessoriesList.filter((_, i) => i !== index));
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('ไฟล์ภาพมีขนาดเกิน 2.5 MB กรุณาเลือกไฟล์ที่เล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim() || !name.trim()) {
      setErrorMsg('กรุณากรอกรหัสอุปกรณ์และชื่ออุปกรณ์');
      return;
    }

    if (availableQuantity > totalQuantity) {
      setErrorMsg('จำนวนพร้อมให้ยืมต้องไม่เกินจำนวนทั้งหมดในคลัง');
      return;
    }

    setSaving(true);

    try {
      const payload: Omit<Equipment, 'id'> = {
        code: code.trim(),
        serialNumber: serialNumber.trim(),
        name: name.trim(),
        category,
        totalQuantity: Number(totalQuantity),
        availableQuantity: Number(availableQuantity),
        status,
        condition,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        description: description.trim(),
        accessories: accessoriesList.join(', '),
        location: location.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && equipmentToEdit?.id) {
        const docRef = doc(db, 'equipment', equipmentToEdit.id);
        await updateDoc(docRef, payload);
        onSuccess(`อัปเดตข้อมูล "${name}" สำเร็จแล้ว`);
      } else {
        await addDoc(collection(db, 'equipment'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        onSuccess(`เพิ่มอุปกรณ์ "${name}" เข้าสู่ระบบสำเร็จแล้ว`);
      }

      onClose();
    } catch (err) {
      console.error('Error saving equipment:', err);
      handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'equipment');
      setErrorMsg('ไม่สามารถบันทึกข้อมูลอุปกรณ์ได้ กรุณาตรวจสอบการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-[#FC82A8]/30 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FC82A8]/20 via-[#FEF7C7]/70 to-[#93A334]/15 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FC82A8] text-white shadow-xs">
                {isEditing ? 'โหมดแก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าสู่คลัง'}
              </span>
              <span className="text-xs text-gray-500 font-medium">ภาควิชาเทคโนโลยีการศึกษา</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {isEditing ? `แก้ไขข้อมูล: ${equipmentToEdit?.name}` : 'ระบบลงทะเบียนอุปกรณ์สำหรับยืม-คืน'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Selector for New Items */}
          {!isEditing && (
            <div className="p-3.5 rounded-2xl bg-[#FEF7C7]/50 border border-[#FC82A8]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FC82A8]" />
                  เลือกจากแม่แบบอุปกรณ์ยอดนิยม (โหลดข้อมูลทันที)
                </span>
                <span className="text-[11px] text-gray-500">ลดเวลาการพิมพ์</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset.name)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white hover:bg-[#FC82A8] hover:text-white text-gray-700 border border-gray-200 hover:border-[#FC82A8] shadow-2xs transition-all cursor-pointer"
                  >
                    + {preset.name.split(' ')[0]} ({preset.category})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Identification & Category */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FC82A8]" />
              ข้อมูลระบุตัวตนและหมวดหมู่
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  หมวดหมู่อุปกรณ์ <span className="text-[#FC82A8]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as EquipmentCategory;
                    setCategory(newCat);
                    if (!isEditing) handleGenerateCode(newCat);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#FC82A8] bg-white cursor-pointer"
                >
                  <option value="กล้องและเลนส์">กล้องและเลนส์ (Camera & Lens)</option>
                  <option value="ไมโครโฟนและเสียง">ไมโครโฟนและเสียง (Audio & Mic)</option>
                  <option value="ขาตั้งกล้องและกิมบอล">ขาตั้งกล้องและกิมบอล (Tripod & Gimbal)</option>
                  <option value="ไฟสตูดิโอและจัดแสง">ไฟสตูดิโอและจัดแสง (Studio Lighting)</option>
                  <option value="โปรเจกเตอร์และจอภาพ">โปรเจกเตอร์และจอภาพ (Projector & Display)</option>
                  <option value="อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ">อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ (Live Stream)</option>
                  <option value="คอมพิวเตอร์และแท็บเล็ต">คอมพิวเตอร์และแท็บเล็ต (Tablet & Laptop)</option>
                  <option value="อุปกรณ์เสริมและสายสัญญาณ">อุปกรณ์เสริมและสายสัญญาณ (Accessories)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    รหัสอุปกรณ์ <span className="text-[#FC82A8]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateCode(category)}
                    className="text-[11px] text-[#FC82A8] hover:underline font-bold cursor-pointer"
                  >
                    สร้างรหัสอัตโนมัติ
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น EDTECH-CAM-005"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold text-[#FC82A8] focus:ring-2 focus:ring-[#FC82A8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่ออุปกรณ์ <span className="text-[#FC82A8]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Sony Alpha 7 IV หรือ RØDE Wireless PRO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FC82A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  เลขทะเบียนครุภัณฑ์ / Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="เช่น ศศ.0201-67-009 หรือ S/N 4829103"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FC82A8]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Quantities, Stock & Conditions */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#FC82A8]" />
              การจัดการคลังและสถานะ
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">จำนวนทั้งหมด</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setTotalQuantity(val);
                    if (availableQuantity > val) setAvailableQuantity(val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">จำนวนพร้อมให้ยืม</label>
                <input
                  type="number"
                  min={0}
                  max={totalQuantity}
                  required
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-center text-[#FC82A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">สถานะ</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                  className="w-full px-2 py-2 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                >
                  <option value="available">พร้อมใช้งาน</option>
                  <option value="maintenance">ซ่อมบำรุง</option>
                  <option value="unavailable">ไม่พร้อม</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">สภาพอุปกรณ์</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                >
                  <option value="สมบูรณ์ 100%">สมบูรณ์ 100%</option>
                  <option value="ใช้งานปกติ">ใช้งานปกติ</option>
                  <option value="มีรอยขีดข่วนเล็กน้อย">มีรอยขีดข่วน</option>
                  <option value="ส่งซ่อมบำรุง">ส่งซ่อมบำรุง</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#93A334]" />
                สถานที่จัดเก็บ / ตู้เก็บอุปกรณ์
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          </div>

          {/* Section 3: Equipment Photo Management */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FC82A8]" />
                รูปภาพอุปกรณ์
              </h3>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageMode('preset')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    imageMode === 'preset' ? 'bg-[#FC82A8] text-white' : 'text-gray-600'
                  }`}
                >
                  คลังรูปภาพ
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    imageMode === 'url' ? 'bg-[#FC82A8] text-white' : 'text-gray-600'
                  }`}
                >
                  URL ลิงก์
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    imageMode === 'upload' ? 'bg-[#FC82A8] text-white' : 'text-gray-600'
                  }`}
                >
                  อัปโหลดไฟล์
                </button>
              </div>
            </div>

            {/* Mode: Preset Gallery */}
            {imageMode === 'preset' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
                {PRESET_IMAGE_GALLERY.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setImageUrl(img.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer h-16 border-2 transition-all ${
                      imageUrl === img.url ? 'border-[#FC82A8] ring-2 ring-[#FC82A8]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1 text-center">
                      {img.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Mode: URL input */}
            {imageMode === 'url' && (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="วางลิงก์รูปภาพ เช่น https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
              />
            )}

            {/* Mode: File upload */}
            {imageMode === 'upload' && (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-[#FC82A8] rounded-2xl bg-gray-50 cursor-pointer">
                <Upload className="w-6 h-6 text-[#FC82A8] mb-1" />
                <span className="text-xs font-bold text-gray-700">คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง</span>
                <span className="text-[11px] text-gray-400">รองรับไฟล์ JPG, PNG, WEBP (ไม่เกิน 2.5MB)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200">
                <img src={imageUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200" />
                <div className="text-xs text-gray-600 truncate">
                  <span className="font-bold text-gray-800">ตัวอย่างรูปภาพที่เลือก</span>
                  <p className="text-[11px] text-gray-400 truncate">{imageUrl.substring(0, 60)}...</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Specifications & Accessories Checklist */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#FC82A8]" />
              สเปกและอุปกรณ์ร่วมในชุด (Checklist)
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                รายละเอียดคุณสมบัติ (Specifications)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุสเปกเด่นของอุปกรณ์ เช่น ถ่าย 4K 60p, แบตเตอรี่ใช้งานได้ 3 ชม., ความไวรับเสียงสูง..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FC82A8]"
              />
            </div>

            {/* Accessories Checklist Builder */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                อุปกรณ์ในชุดที่ต้องตรวจเช็กเมื่อยืมและคืน
              </label>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAccessoryItem}
                  onChange={(e) => setNewAccessoryItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAccessory();
                    }
                  }}
                  placeholder="พิมพ์ชื่ออุปกรณ์ในชุด เช่น สาย HDMI 3 ม., ที่ชาร์จ..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddAccessory}
                  className="px-3.5 py-2 rounded-xl bg-[#FC82A8] text-white text-xs font-bold hover:bg-[#eb7197] cursor-pointer"
                >
                  + เพิ่มชิ้น
                </button>
              </div>

              {/* Items chips */}
              <div className="flex flex-wrap gap-1.5">
                {accessoriesList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#FEF7C7] text-gray-800 border border-[#FC82A8]/30 shadow-2xs"
                  >
                    <span>✓ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccessory(idx)}
                      className="text-gray-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FC82A8] hover:bg-[#eb7197] text-white shadow-md shadow-[#FC82A8]/30 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกอุปกรณ์ใหม่เข้าสู่ระบบ'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
