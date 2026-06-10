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
  // ถ้าไม่ใส่ DevExtreme จะใช้ dataField แทน

  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'datetime';
  // บอก DevExtreme ว่าข้อมูลใน column นี้เป็น type อะไร
  // ส่งผลต่อการ sort, filter, และ format การแสดงผล

  alignment?: 'left' | 'center' | 'right';
  // จัดวางข้อมูลใน column

  width?: number | string;
  // ความกว้าง column เช่น 100, '20%'
  // ไม่กำหนด = auto

  fixed?: boolean;
  // true = ล็อก column ไว้ไม่ให้เลื่อนตาม scroll

  fixedPosition?: 'left' | 'right';
  // ล็อกไว้ซ้ายหรือขวา

  visible?: boolean;
  // false = ซ่อน column นี้

  format?: string;
  // format การแสดงผล เช่น '#,##0.00' สำหรับตัวเลข
  // หรือ 'dd/MM/yyyy' สำหรับวันที่

  cellTemplate?: string;
  // ชื่อ template พิเศษที่ต้องการ render เอง
  // เช่น 'statusTemplate', 'imageTemplate'
  // หน้าบ้านกำหนด template ใน HTML เอง
}


export interface ActionButton {
  label?: string;
  // ข้อความบนปุ่ม เช่น 'Edit', 'ลบ'

  icon?: string;
  // icon DevExtreme เช่น 'edit', 'trash', 'info'
  // ดูรายการได้ที่ https://js.devexpress.com/Documentation/Guide/Themes_and_Styles/Icons/

  type?: 'default' | 'success' | 'danger' | 'warning';
  // สีของปุ่ม
  // default = เทา, success = เขียว
  // danger  = แดง,  warning = เหลือง

  onClick: (rowData: any) => void;
  // function ที่จะเรียกเมื่อกดปุ่ม
  // rowData คือข้อมูลของแถวนั้น
  
  visible?: (rowData: any) => boolean;
  // function บอกว่าปุ่มนี้แสดงไหมสำหรับแถวนี้
  // เช่น แสดงปุ่ม Delete เฉพาะ status === 'INACTIVE'
}