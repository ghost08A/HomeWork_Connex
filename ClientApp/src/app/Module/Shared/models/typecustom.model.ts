export interface valueOption {
  key: string;    // ค่าที่ใช้จริงในระบบ เช่น '1', 'TH'
  value: string;  // ข้อความที่แสดงให้ user เห็น เช่น 'IT', 'Thailand'
}

// --------------------------------------------------
// Interface กำหนดรูปร่างของแต่ละ column
// หน้าบ้านส่ง array ของ ColumnConfig เข้ามา
// --------------------------------------------------
export interface ColumnConfig {
  dataField: string;
  // ชื่อ field ในข้อมูล เช่น 'productName', 'status'

  caption?: string;
  // หัวข้อ column ที่แสดงให้ user เห็น

  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'datetime';
  // type ของข้อมูล — ส่งผลต่อการ sort, filter, format

  alignment?: 'left' | 'center' | 'right';
  // จัดวางข้อมูลใน cell


  width?: number | string;
  // ความกว้าง column เช่น 100 หรือ '20%'

  fixed?: boolean;
  // true = ล็อก column ไม่ให้เลื่อนตาม scroll แนวนอน

  fixedPosition?: 'left' | 'right';
  // ล็อกไว้ด้านไหน

  visible?: boolean;
  // false = ซ่อน column นี้ไม่ให้แสดง

  format?: string;
  // format การแสดงผล
  // ตัวเลข → '#,##0.00'
  // วันที่  → 'dd/MM/yyyy'

  cellTemplate?: string;
  // ชื่อ template พิเศษที่ต้องการ render เอง
  // หน้าบ้านสร้าง *dxTemplate ชื่อเดียวกันนี้
}

// --------------------------------------------------
// Interface กำหนดปุ่ม action แต่ละปุ่ม
// ใช้ property เดียวกับ CustomButtonComponent เลย
// --------------------------------------------------
export interface ActionButton {
  text?: string;
  // ข้อความบนปุ่ม — ตรงกับ @Input() text ของ CustomButtonComponent

  icon?: string;
  // icon DevExtreme — ตรงกับ @Input() icon

  type?: 'normal' | 'default' | 'success' | 'danger';
  // สีปุ่ม — ตรงกับ @Input() type ของ CustomButtonComponent
  // normal  = เทา
  // default = น้ำเงิน
  // success = เขียว
  // danger  = แดง

  stylingMode?: 'text' | 'outlined' | 'contained';
  // รูปแบบปุ่ม — ตรงกับ @Input() stylingMode
  // contained = ปุ่มทึบ (default)
  // outlined  = ปุ่มมีขอบ
  // text      = ปุ่มแบบข้อความ

  width?: string | number;
  // ความกว้างปุ่ม — ตรงกับ @Input() width

  disabled?: boolean;
  // ปิดการใช้งานปุ่ม — ตรงกับ @Input() disabled

  onClick: (rowData: any) => void;
  // function ที่จะเรียกเมื่อกดปุ่ม
  // rowData = ข้อมูลของแถวนั้น

  visible?: (rowData: any) => boolean;
  // function บอกว่าปุ่มนี้แสดงไหมสำหรับแถวนี้
  // ถ้าไม่กำหนด = แสดงทุกแถว
}