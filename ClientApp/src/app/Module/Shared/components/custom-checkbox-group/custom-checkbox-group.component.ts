import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomCheckboxComponent } from '../custom-checkbox/custom-checkbox.component';
import { valueOption } from '../../models/typecustom.model';

@Component({
  selector: 'custom-checkbox-group',
  imports: [CommonModule, CustomCheckboxComponent],
  templateUrl: './custom-checkbox-group.component.html',
  styleUrl: './custom-checkbox-group.component.scss',
})
export class CustomCheckboxGroupComponent  {
    // --------------------------------------------------
  // INPUTS
  // --------------------------------------------------

  @Input() dataSource: (valueOption | string)[] = [];
  // ตัวเลือกทั้งหมด
  // แบบ 1: CheckboxGroupOption → [{ key: 'ACTIVE', value: 'Active' }]
  // แบบ 2: string ธรรมดา      → ['Active', 'Inactive']

  @Input() fieldValue: (string | number)[] = [];
  // ค่าที่เลือกอยู่ตอนนี้ — เป็น array ของ key
  // เช่น ['ACTIVE', 'PENDING']

  @Input() columns: 2 | 3 | 4 = 3;
  // จำนวนคอลัม — default 3
  // ถ้าตัวเลือกเกิน columns จะ wrap ไปแถวถัดไปอัตโนมัติ

  @Input() isDisabled: boolean = false;
  // ปิดทุก checkbox พร้อมกัน

  @Input() label: string = '';
  // หัวข้อเหนือ group (optional)

  // --------------------------------------------------
  // OUTPUT
  // --------------------------------------------------

  @Output() fieldValueChange = new EventEmitter<(string | number)[]>();
  // emit array ของ key ที่เลือกทั้งหมดกลับหน้าบ้าน

  // --------------------------------------------------
  // ตัวแปรภายใน
  // --------------------------------------------------

  uiValue: (string | number)[] = [];
  // copy ของ fieldValue ที่ใช้ภายใน

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if ('fieldValue' in changes) {
      this.uiValue = this.fieldValue ?? [];
    }
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  getKey(item: valueOption | string): string | number {
    // ดึง key จาก option
    return typeof item === 'string' ? item : item.key;
  }

  getLabel(item: valueOption | string): string {
    // ดึง label จาก option
    return typeof item === 'string' ? item : item.value;
  }

  isChecked(item: valueOption | string ): boolean {
    // เช็คว่า option นี้ถูกเลือกอยู่ไหม
    return this.uiValue.includes(this.getKey(item));
  }

  onCheckChange(item: valueOption | string, checked: boolean): void {
    const key = this.getKey(item);

    if (checked) {
      // เพิ่ม key เข้า array ถ้ายังไม่มี
      if (!this.uiValue.includes(key)) {
        this.uiValue = [...this.uiValue, key];
      }
    } else {
      // ลบ key ออก
      this.uiValue = this.uiValue.filter(v => v !== key);
    }

    this.fieldValueChange.emit(this.uiValue);
  }

  get gridClass(): string {
    // คำนวณ CSS class ตาม columns
    const map: Record<number, string> = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    };
    return `grid ${map[this.columns] ?? 'grid-cols-3'} gap-x-2 gap-y-2`;
  }
}
