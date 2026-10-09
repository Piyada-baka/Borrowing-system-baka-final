export interface EquipmentPreset {
  name: string;
  category: string;
  codePrefix: string;
  imageUrl: string;
  description: string;
  accessories: string;
  location: string;
}

export const EQUIPMENT_PRESETS: EquipmentPreset[] = [
  {
    name: 'Sony Alpha 7 IV (พร้อมเลนส์ FE 24-70mm F2.8 GM)',
    category: 'กล้องและเลนส์',
    codePrefix: 'EDTECH-CAM',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องฟูลเฟรมไฮบริด 33MP วิดีโอ 4K 60p สำหรับงานผลิตสื่อการเรียนรู้ สารคดี และถ่ายทอดสดคุณภาพสูง',
    accessories: 'แบตเตอรี่ NP-FZ100 (2 ก้อน), แท่นชาร์จคู่, การ์ด SD V90 128GB, สายคล้องคอ, กระเป๋ากล้อง',
    location: 'ตู้ A-01 ศูนย์เทคโนโลยีการศึกษา ชั้น 3'
  },
  {
    name: 'Canon EOS R6 Mark II + เลนส์ RF 24-105mm F4L',
    category: 'กล้องและเลนส์',
    codePrefix: 'EDTECH-CAM',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    description: 'กล้องมิลเลอร์เลสสำหรับถ่ายทอดการสอน วิดีโอ 4K 60p โฟกัสแม่นยำด้วย Dual Pixel CMOS AF II',
    accessories: 'แบตเตอรี่ LP-E6NH (2 ก้อน), แท่นชาร์จ, แฟลชไดรฟ์/SD Card 64GB, กระเป๋ากันกระแทก',
    location: 'ตู้ A-02 ศูนย์เทคโนโลยีการศึกษา ชั้น 3'
  },
  {
    name: 'RØDE Wireless PRO ชุดไมโครโฟนไร้สาย 2 ตัวส่ง',
    category: 'ไมโครโฟนและเสียง',
    codePrefix: 'EDTECH-MIC',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    description: 'ชุดไมค์ลอยไร้สายบันทึกเสียง 32-bit Float เหมาะสำหรับบันทึกเสียงอาจารย์ ผู้บรรยาย และสัมภาษณ์',
    accessories: 'ไมค์ Lavalier II (2 ตัว), Windshield ขนแมว (2 ชิ้น), สาย SC2/SC7, เคสชาร์จ Smart Case',
    location: 'ตู้ B-01 ห้องปฏิบัติการเสียง ชั้น 3'
  },
  {
    name: 'DJI RS 3 Pro กิมบอลกันสั่น 3 แกนคาร์บอนไฟเบอร์',
    category: 'ขาตั้งกล้องและกิมบอล',
    codePrefix: 'EDTECH-GIM',
    imageUrl: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
    description: 'กิมบอลมืออาชีพรองรับน้ำหนักกล้องสูงสุด 4.5 กก. ล็อกแกนอัตโนมัติ สำหรับการถ่ายทำเคลื่อนไหว',
    accessories: 'ด้ามแบตเตอรี่ BG30, ขาตั้งสามขาเสริม, มอเตอร์โฟกัส, กระเป๋า Carrying Case',
    location: 'ตู้ C-01 ห้องควบคุมอุปกรณ์'
  },
  {
    name: 'Aputure Amaran 200d ไฟสปอตไลท์ LED Daylight 200W',
    category: 'ไฟสตูดิโอและจัดแสง',
    codePrefix: 'EDTECH-LGT',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    description: 'ไฟถ่ายทำสตูดิโอความสว่างสูง 65,000 lux CRI 95+ พร้อมซอฟต์บ็อกซ์สำหรับแสงนุ่มนวล',
    accessories: 'โคมสะท้อนแสง Hyper-Reflector, ซอฟต์บ็อกซ์ Light Dome SE, สายไฟ AC, ขาตั้ง C-Stand',
    location: 'ห้องสตูดิโอถ่ายทำ ชั้น 2'
  },
  {
    name: 'Epson EB-FH52 เครื่องโปรเจกเตอร์ Full HD ไร้สาย',
    category: 'โปรเจกเตอร์และจอภาพ',
    codePrefix: 'EDTECH-PRJ',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    description: 'โปรเจกเตอร์ความสว่าง 4,000 Lumens Full HD 1080p รองรับ Miracast สำหรับจัดสัมมนาและแสดงผล',
    accessories: 'รีโมทคอนโทรล, สาย HDMI 5 ม., สายไฟ AC, กระเป๋าพกพา Epson',
    location: 'ตู้ D-01 ห้องสื่อโสตทัศนูปกรณ์'
  },
  {
    name: 'Blackmagic ATEM Mini Pro เครื่องสลับสัญญาณ HDMI 4 ช่อง',
    category: 'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ',
    codePrefix: 'EDTECH-STM',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    description: 'สวิตเชอร์วิดีโอสำหรับการเรียนรู้แบบ Hybrid และไลฟ์สตรีมหลายมุมกล้องพร้อม MultiView',
    accessories: 'อะแดปเตอร์จ่ายไฟ, สาย USB-C, สาย HDMI 2 เส้น',
    location: 'ตู้ D-03 ห้องควบคุมการออกอากาศ'
  },
  {
    name: 'iPad Pro 11 นิ้ว + Apple Pencil สำหรับ Teleprompter และงานนำเสนอ',
    category: 'คอมพิวเตอร์และแท็บเล็ต',
    codePrefix: 'EDTECH-TAB',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    description: 'แท็บเล็ตความเร็วสูงชิป M2 สำหรับติดตั้งบนชุดบอกบท Teleprompter และบันทึกคำสอนแบบสด',
    accessories: 'Apple Pencil 2, เคส Smart Folio, หัวชาร์จ USB-C 20W, สายชาร์จถัก 1.5 ม.',
    location: 'ตู้ E-01 ห้องควบคุมสตูดิโอ'
  }
];

export const PRESET_IMAGE_GALLERY = [
  { label: 'กล้อง Sony / Mirrorless', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { label: 'กล้อง Canon DSLR/Mirrorless', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไมโครโฟน Wireless RØDE', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไมค์พ็อดคาสท์ Shure XLR', url: 'https://images.unsplash.com/photo-1583795484071-3c453e3a7c71?auto=format&fit=crop&w=800&q=80' },
  { label: 'กิมบอลกันสั่น DJI', url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80' },
  { label: 'ขาตั้งกล้อง Manfrotto', url: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไฟสตูดิโอ LED Aputure', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80' },
  { label: 'โปรเจกเตอร์ Epson', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80' },
  { label: 'สวิตเชอร์ ATEM Mini', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' },
  { label: 'iPad / แท็บเล็ตควบคุม', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
  { label: 'หูฟังมอนิเตอร์ Audio-Technica', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { label: 'เครื่องบันทึกเสียง Zoom H6', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80' }
];

export const CATEGORY_PREFIX_MAP: Record<string, string> = {
  'กล้องและเลนส์': 'EDTECH-CAM',
  'ไมโครโฟนและเสียง': 'EDTECH-MIC',
  'ขาตั้งกล้องและกิมบอล': 'EDTECH-GIM',
  'ไฟสตูดิโอและจัดแสง': 'EDTECH-LGT',
  'โปรเจกเตอร์และจอภาพ': 'EDTECH-PRJ',
  'อุปกรณ์ไลฟ์สตรีมและสลับสัญญาณ': 'EDTECH-STM',
  'คอมพิวเตอร์และแท็บเล็ต': 'EDTECH-TAB',
  'อุปกรณ์เสริมและสายสัญญาณ': 'EDTECH-ACC',
};
