import { Equipment } from '../types';

export const INITIAL_EQUIPMENT_DATA: Omit<Equipment, 'id'>[] = [
  {
    code: 'EDTECH-CAM-001',
    name: 'Sony Alpha 7 IV (พร้อมเลนส์ FE 24-70mm F2.8 GM)',
    category: 'กล้องและเลนส์',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องฟูลเฟรมไฮบริด 33MP บันทึกวิดีโอ 4K 60p สำหรับงานผลิตสื่อการเรียนรู้ รายการการศึกษา และสื่อวิดีโอคุณภาพสูง',
    accessories: 'แบตเตอรี่ NP-FZ100 (2 ก้อน), แท่นชาร์จคู่, การ์ด SD V90 128GB, สายคล้องคอ, กระเป๋าใส่กล้อง Lowepro',
    location: 'ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3'
  },
  {
    code: 'EDTECH-CAM-002',
    name: 'Canon EOS R6 Mark II (ชุดเลนส์ RF 24-105mm F4L)',
    category: 'กล้องและเลนส์',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องมิลเลอร์เลสสำหรับถ่ายทอดการสอน วิดีโอ 4K 60p oversampled 6K โฟกัสแม่นยำด้วย Dual Pixel CMOS AF II',
    accessories: 'แบตเตอรี่ LP-E6NH (2 ก้อน), แท่นชาร์จ, แฟลชไดรฟ์/SD Card 64GB, กระเป๋ากันกระแทก',
    location: 'ตู้ A-02 ศูนย์เทคโนโลยีการศึกษา ชั้น 3'
  },
  {
    code: 'EDTECH-MIC-001',
    name: 'RØDE Wireless PRO ไมโครโฟนไร้สายบันทึกเสียง 32-bit Float',
    category: 'ไมโครโฟนและเสียง',
    totalQuantity: 6,
    availableQuantity: 6,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    description: 'ชุดไมค์ลอยไร้สาย 2 แชนเนล พร้อมเคสชาร์จและระบบออนบอร์ดบันทึกในตัวแบบ 32-bit Float เหมาะสำหรับบันทึกเสียงอาจารย์และผู้สอน',
    accessories: 'ไมค์ Lavalier II (2 ตัว), Windshield ขนแมว (2 ชิ้น), สาย SC2/SC7, กล่องชาร์จ Smart Case, เคสพกพา',
    location: 'ตู้ B-01 ห้องปฏิบัติการเสียง ชั้น 3'
  },
  {
    code: 'EDTECH-MIC-002',
    name: 'Shure MV7X พ็อดคาสท์ไมโครโฟน XLR ไดนามิก',
    category: 'ไมโครโฟนและเสียง',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1583795484071-3c453e3a7c71?auto=format&fit=crop&w=800&q=80',
    description: 'ไมโครโฟนสำหรับจัดรายการวิทยุการศึกษา ผลิตพ็อดคาสท์ หรือบรรยายออนไลน์ ตัดเสียงรบกวนรอบข้างได้ดีเยี่ยม',
    accessories: 'ขาจับยึดโต๊ะ Boom Arm, สาย XLR ความยาว 3 เมตร, ฟองน้ำกันลม',
    location: 'ตู้ B-02 ห้องบันทึกเสียงสตูดิโอ 1'
  },
  {
    code: 'EDTECH-GIM-001',
    name: 'DJI RS 3 Pro กิมบอลกันสั่น 3 แกนสำหรับกล้องวิดีโอ',
    category: 'ขาตั้งกล้องและกิมบอล',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
    description: 'กิมบอลมืออาชีพคาร์บอนไฟเบอร์ รองรับน้ำหนักกล้องสูงสุด 4.5 กก. ล็อกแกนอัตโนมัติ สำหรับการถ่ายทำสื่อเคลื่อนไหว นอกสถานที่',
    accessories: 'ด้ามจับแบตเตอรี่ BG30, ขาตั้งสามขาเสริม, ราง Quick Release, มอเตอร์โฟกัส, กระเป๋าแข็ง Carrying Case',
    location: 'ตู้ C-01 ห้องควบคุมอุปกรณ์'
  },
  {
    code: 'EDTECH-TRI-001',
    name: 'Manfrotto 055 ขาตั้งกล้องคาร์บอนไฟเบอร์ + หัวน้ำมันวิดีโอ 502AH',
    category: 'ขาตั้งกล้องและกิมบอล',
    totalQuantity: 5,
    availableQuantity: 5,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
    description: 'ขาตั้งกล้องมั่นคงสูง ปรับแกนแนวนอน 90 องศาได้ เหมาะกับงานถ่ายวิดีโอ ถ่ายทอดการสอน และงานสต็อปโมชัน',
    accessories: 'หัวน้ำมัน Fluid Head พร้อม Plate ปลดเร็ว, ด้ามคันโยก Pan Bar, ถุงสะพายบุนวมแท้',
    location: 'ตู้ C-03 โซนขาตั้งกล้อง'
  },
  {
    code: 'EDTECH-LGT-001',
    name: 'Aputure Amaran 200d ไฟสปอตไลท์สตูดิโอ LED Daylight 200W',
    category: 'ไฟสตูดิโอและจัดแสง',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    description: 'ไฟถ่ายทำสตูดิโอความสว่างสูง 65,000 lux @ 1m (พร้อมรีเฟล็กเตอร์) สีแม่นยำ CRI 95+ TLCI 96+ ควบคุมผ่านแอป Sidus Link',
    accessories: 'โคมสะท้อนแสง Hyper-Reflector 55°, อะแดปเตอร์จ่ายไฟ, ซอฟต์บ็อกซ์ Light Dome SE, ขาตั้งไฟ C-Stand',
    location: 'ห้องสตูดิโอถ่ายทำ ชั้น 2'
  },
  {
    code: 'EDTECH-PRJ-001',
    name: 'Epson EB-FH52 เครื่องโปรเจกเตอร์ความคมชัด Full HD 4,000 Lumens',
    category: 'โปรเจกเตอร์และจอภาพ',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    description: 'โปรเจกเตอร์พกพาความสว่างสูง 4,000 Lumens แสดงผล Full HD 1080p รองรับการเชื่อมต่อไร้สาย Miracast เหมาะสำหรับนำเสนองานและการจัดสัมมนา',
    accessories: 'รีโมทคอนโทรล, สาย HDMI ความยาว 5 เมตร, สายไฟ AC, กระเป๋าพกพา Epson',
    location: 'ตู้ D-01 ห้องสื่อโสตทัศนูปกรณ์'
  },
  {
    code: 'EDTECH-STM-001',
    name: 'Blackmagic ATEM Mini Pro มิกเซอร์สลับสัญญาณภาพ 4 HDMI',
    category: 'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    description: 'วิดีโอสวิตเชอร์สำหรับจัดการเรียนการสอนแบบผสมผสาน (Hybrid Learning) และไลฟ์สตรีม รองรับ 4 กล้อง พร้อม multiview และบันทึกตรงลง USB Flash Drive',
    accessories: 'อะแดปเตอร์แปลงไฟ 12V, สาย USB-C to USB-A, สาย HDMI ความเร็วสูง 2 เส้น',
    location: 'ตู้ D-03 ห้องควบคุมการออกอากาศ'
  }
];
