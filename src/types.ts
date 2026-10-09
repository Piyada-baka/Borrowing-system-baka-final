export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  studentId?: string; // รหัสนักศึกษา หรือ รหัสบุคลากร
  department?: string; // ภาควิชาเทคโนโลยีการศึกษา
  faculty?: string; // คณะ
  createdAt?: string;
  updatedAt?: string;
}

export type EquipmentCategory = 
  | 'กล้องและเลนส์'
  | 'ไมโครโฟนและเสียง'
  | 'ขาตั้งกล้องและกิมบอล'
  | 'ไฟสตูดิโอและจัดแสง'
  | 'โปรเจกเตอร์และจอภาพ'
  | 'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ'
  | 'คอมพิวเตอร์และแท็บเล็ต'
  | 'อุปกรณ์เสริมและสายสัญญาณ';

export type EquipmentStatus = 'available' | 'low_stock' | 'maintenance' | 'unavailable';

export interface Equipment {
  id: string;
  code: string; // e.g. "EDTECH-CAM-001"
  name: string;
  category: EquipmentCategory | string;
  totalQuantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  imageUrl: string;
  description: string;
  accessories?: string; // อุปกรณ์ร่วม เช่น แบตเตอรี่, ที่ชาร์จ, เมมโมรี่
  location?: string; // สถานที่จัดเก็บ เช่น ตู้ A1 ศูนย์เทคโนโลยีการศึกษา
  serialNumber?: string; // เลขครุภัณฑ์ / Serial Number
  condition?: string; // สภาพอุปกรณ์
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'active' | 'returned' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userStudentId: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentImageUrl?: string;
  quantity: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  purpose: string; // วัตถุประสงค์ในการยืมใช้งาน
  status: BookingStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  pickedUpAt?: string;
  returnedAt?: string;
  returnCondition?: 'good' | 'damaged' | 'incomplete';
  returnNotes?: string;
  returnInspectedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminEmailDoc {
  id?: string;
  email: string;
  addedAt: string;
  addedBy: string;
}
