import {
  Component,
  Input,          // รับค่าจากหน้าบ้าน
  Output,         // ส่งค่ากลับหน้าบ้าน
  EventEmitter,   // ตัวส่ง event
  OnChanges,      // lifecycle — รู้เมื่อ Input เปลี่ยน
  SimpleChanges   // บอกว่า Input ไหนเปลี่ยน
} from '@angular/core';
import { DxCheckBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'custom-checkbox',
  imports: [DxCheckBoxModule, CommonModule],
  templateUrl: './custom-checkbox.component.html',
  styleUrl: './custom-checkbox.component.scss',
})
export class CustomCheckboxComponent implements OnChanges {
    @Input() fieldValue: boolean = false;
    @Input() label: string = '';
    @Input() isDisabled: boolean = false;
    @Input() fontSize?: number = 14;
    @Input() attributeName:string = '';
    @Input() componentState: any = { getError: () => [] };


    @Output() fieldValueChange = new EventEmitter<boolean>();  // emit boolean กลับหน้าบ้าน

    uiValue: boolean = false;// ค่าที่ใช้ bind กับ dx-check-box จริงๆ

    ngOnChanges(changes: SimpleChanges): void {
      if('fieldValue' in changes) {
        this.uiValue = this.fieldValue ?? false; // อัปเดตค่าใน component เมื่อ fieldValue เปลี่ยนจากภายนอก
      }
    }

    onValueChange(value: boolean): void {
      this.uiValue = value; // อัปเดตค่าใน component เมื่อ user กดเปลี่ยน
      this.fieldValueChange.emit(this.uiValue); // ส่งค่ากลับหน้าบ้าน
    }
}
