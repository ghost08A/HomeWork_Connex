import { 
  Component, 
  Input,          // รับค่าจากหน้าบ้าน
  Output,         // ส่งค่ากลับหน้าบ้าน
  EventEmitter,   // ตัวส่ง event
  OnChanges,      // lifecycle — รู้เมื่อ Input เปลี่ยน
  SimpleChanges   // บอกว่า Input ไหนเปลี่ยน
} from '@angular/core';
import { DxSelectBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { valueOption } from '../../models/typecustom.model';

// --------------------------------------------------
// Interface — กำหนดรูปร่างข้อมูล key-value
// --------------------------------------------------

@Component({
  selector: 'custom-select-box',   // ชื่อ tag ที่ใช้ใน HTML
  standalone: true,                     // ไม่ต้องประกาศใน NgModule
  imports: [
    DxSelectBoxModule,  // DevExtreme select box
    CommonModule        // ใช้ directive ทั่วไปของ Angular
  ],
  templateUrl: './custom-select-box.component.html',
})
export class CustomSelectBoxComponent implements OnChanges {

  // --------------------------------------------------
  // INPUTS — ค่าที่หน้าบ้านส่งเข้ามา
  // --------------------------------------------------

  @Input() dataSource: (valueOption | string)[] = [];
  // รับได้ 2 แบบ
  // แบบ 1: valueOption → [{ key: '1', value: 'IT' }]
  // แบบ 2: string ธรรมดา  → ['Thailand', 'Japan']

  @Input() fieldValue: string | number |null= null;
  // ค่าที่เลือกอยู่ตอนนี้ — หน้าบ้านส่งเข้ามา

  @Input() placeholder:string = 'Select...';
  // ข้อความที่แสดงตอนยังไม่เลือก

  @Input() label:string = '';
  // หัวข้อเหนือ dropdown เช่น 'แผนก', 'ประเทศ'

  @Input() isRequired:boolean = false;
  // true = แสดงดาวแดง * ต่อท้าย label

  @Input() isDisabled:boolean = false;
  // true = ปิดการใช้งาน กดไม่ได้

  @Input() fontSize?: number = 14;
  // ขนาดตัวอักษรของ label

  @Input() layout: 'col' | 'row' = 'col';
  // col = label อยู่บน, input อยู่ล่าง (default)
  // row = label อยู่ซ้าย, input อยู่ขวา

  @Input() labelPosition: 'top' | 'bottom' = 'top';
  // top    = label อยู่เหนือ input (default)
  // bottom = label อยู่ใต้ input

  @Input() showClearButton: boolean = true;
  // แสดงปุ่มกากบาทสำหรับล้างค่ามั้ย

  @Input() attributeName: string = '';
  // ชื่อ field สำหรับดึง error message จาก componentState

  @Input() componentState: any = { getError: () => [] };
  // object ที่เก็บ error — มาจาก validation directive

  @Input() searchEnabled:boolean = false;
  // true = พิมพ์ค้นหาใน dropdown ได้

  @Input() searchMode: 'contains' | 'startswith' = 'contains';
  // contains   = พิมพ์ตรงไหนก็เจอ เช่น 'an' เจอ 'Thailand'
  // startswith = ต้องขึ้นต้นด้วยคำนั้น เช่น 'Th' เจอ 'Thailand'

  @Input() searchExpr: string | string[] = 'value';
  // บอกว่า search จาก field ไหน
  // 'value'          = search จากข้อความที่แสดง
  // ['value', 'key'] = search จากทั้งสอง field

  // --------------------------------------------------
  // OUTPUT — ส่งค่ากลับหน้าบ้าน
  // --------------------------------------------------

  @Output() fieldValueChange = new EventEmitter<string | number | null>();
  // emit ค่าที่เลือกกลับไปให้หน้าบ้าน

  // --------------------------------------------------
  // ตัวแปรภายใน component
  // --------------------------------------------------

  uiValue: string | number | null = null;
  // ค่าที่ใช้ bind กับ dx-select-box จริงๆ
  // แยกออกมาเพื่อไม่ให้แก้ fieldValue ตรงๆ

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if ('fieldValue' in changes) {
      // เมื่อหน้าบ้านเปลี่ยนค่า fieldValue
      // ให้ sync มาที่ uiValue ด้วย
      this.uiValue = this.fieldValue ?? null;
    }
  }

  // --------------------------------------------------
  // Functions
  // --------------------------------------------------

  displayExpr = (item: valueOption | string): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.value;
    // string ธรรมดา → คืน string นั้นเลย
    // valueOption → คืน .value (ข้อความที่แสดง)
  };

  valueExpr = (item: valueOption | string): string | number => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.key;
    // string ธรรมดา → คืน string นั้นเลย
    // valueOption → คืน .key (ค่าที่ใช้จริง)
  };

  onValueChange(value: string | number | null) {
    this.uiValue = value ?? null;           // อัปเดตค่าใน component
    this.fieldValueChange.emit(value ?? null); // ส่งค่ากลับหน้าบ้าน
  }
}