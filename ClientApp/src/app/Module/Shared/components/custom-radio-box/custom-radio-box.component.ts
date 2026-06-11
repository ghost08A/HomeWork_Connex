import {
  Component,
  Input, // รับค่าจากหน้าบ้าน
  Output, // ส่งค่ากลับหน้าบ้าน
  EventEmitter, // ตัวส่ง event
  OnChanges, // lifecycle — รู้เมื่อ Input เปลี่ยน
  SimpleChanges, // บอกว่า Input ไหนเปลี่ยน
} from '@angular/core';
import { DxRadioGroupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { valueOption } from '../../models/typecustom.model';

@Component({
  selector: 'custom-radio-box',
  imports: [DxRadioGroupModule, CommonModule],
  templateUrl: './custom-radio-box.component.html',
  styleUrl: './custom-radio-box.component.scss',
})
export class CustomRadioBoxComponent {
  @Input() dataSource: (valueOption | string)[] = [];
  @Input() fieldValue: string | number | null = null;
  @Input() layout: 'col' | 'row' = 'col';
  // col = label อยู่บน input อยู่ล่าง (default)
  // row = label อยู่ซ้าย input อยู่ขวา
  // *** layout นี้คือ layout ของ label กับ input ***
  // ไม่ใช่ layout ของปุ่ม radio (ใช้ itemLayout แทน)

  @Input() itemLayout: 'horizontal' | 'vertical' = 'horizontal';
  // horizontal = ปุ่ม radio เรียงซ้าย-ขวา ○ ชาย  ○ หญิง
  // vertical   = ปุ่ม radio เรียงบน-ล่าง
  @Input() labelPosition: 'top' | 'bottom' = 'top';
  // top    = label อยู่เหนือ radio group (default)
  // bottom = label อยู่ใต้ radio group
  @Input() label: string = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() fontSize?: number = 14;
  @Input() attributeName: string = '';
  @Input() componentState: any = { getError: () => [] }; // object ที่เก็บ error — มาจาก validation directive

  @Output() fieldValueChange = new EventEmitter<string | number | null>();

  uiValue: string | number | null = null; // ค่าที่ใช้ bind กับ dx-radio-group จริงๆ

  ngOnChanges(changes: SimpleChanges): void {
    if ('fieldValue' in changes) {
      this.uiValue = this.fieldValue ?? null; // อัปเดตค่าใน component เมื่อ fieldValue เปลี่ยนจากภายนอก
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
    // valueOption → คืน .key (ค่าที่ใช้เป็นค่าจริง)
  };

  onValueChange(value: string | number | null) {
    if (value === this.uiValue) {
      this.uiValue = null; // ถ้ากดซ้ำที่ตัวเดิม ให้ยกเลิกการเลือก (set เป็น null)
      this.fieldValueChange.emit(null); // ส่งค่ากลับหน้าบ้าน
      return;
    }
    // ถ้าคลิกค่าใหม่ = เลือกปกติ
    this.uiValue = value ?? null;
    this.fieldValueChange.emit(value ?? null);
  }
  onItemClick(e: any) {
  // e.itemData คือ option ที่คลิก
  // ดึงค่า key ออกมาก่อนเพื่อเอาไปเปรียบเทียบ
  const clickedValue = typeof e.itemData === 'string'
    ? e.itemData           // string ธรรมดา → ใช้เลย
    : e.itemData?.key;     // RadioOption   → ดึง .key

  // ถ้าคลิกค่าเดิม = deselect
  if (clickedValue === this.uiValue) {
    this.uiValue = null;
    this.fieldValueChange.emit(null);
  }
  // ถ้าคลิกค่าใหม่ → ปล่อยให้ onValueChanged จัดการปกติ
}
}
