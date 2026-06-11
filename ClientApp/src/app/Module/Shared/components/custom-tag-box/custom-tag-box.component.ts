import {
  Component,
  Input, // รับค่าจากหน้าบ้าน
  Output, // ส่งค่ากลับหน้าบ้าน
  EventEmitter, // ตัวส่ง event
  OnChanges, // lifecycle — รู้เมื่อ Input เปลี่ยน
  SimpleChanges, // บอกว่า Input ไหนเปลี่ยน
} from '@angular/core';
import { DxTagBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { valueOption } from '../../models/typecustom.model';

@Component({
  selector: 'custom-tag-box',
  imports: [
    DxTagBoxModule, // DevExtreme tag box
    CommonModule, // ใช้ directive ทั่วไปของ Angular
  ],
  templateUrl: './custom-tag-box.component.html',
  styleUrl: './custom-tag-box.component.scss',
})
export class CustomTagBoxComponent {
  // --------------------------------------------------
  // INPUTS — ค่าที่หน้าบ้านส่งเข้ามา
  // --------------------------------------------------
  @Input() dataSource: (valueOption | string)[] = [];
  // รับได้ 2 แบบเหมือน select-box
  // แบบ 1: valueOption → [{ key: '1', value: 'IT' }]
  // แบบ 2: string ธรรมดา  → ['Thailand', 'Japan']

  @Input() fieldValue: (string | number | null)[] = [];
  // ต่างจาก select-box ตรงนี้ครับ
  // select-box → fieldValue: any (ค่าเดียว)
  // tag-box    → fieldValue: string[] (หลายค่า เป็น array เสมอ)

  @Input() placeholder = 'Select...';
  // ข้อความที่แสดงตอนยังไม่เลือก

  @Input() label:string = '';
  // หัวข้อเหนือ tag box เช่น 'แผนก', 'ทักษะ'

  @Input() isRequired:boolean = false;
  // true = แสดงดาวแดง * ต่อท้าย label

  @Input() isDisabled:boolean = false;
  // true = ปิดการใช้งาน กดไม่ได้

  @Input() fontSize?: number = 14;
  // ขนาดตัวอักษรของ label

  @Input() layout: 'col' | 'row' = 'col';
  // col = label อยู่บน input อยู่ล่าง (default)
  // row = label อยู่ซ้าย input อยู่ขวา

  @Input() labelPosition: 'top' | 'bottom' = 'top';
  // top    = label อยู่เหนือ input (default)
  // bottom = label อยู่ใต้ input

  @Input() attributeName: string = '';
  // ชื่อ field สำหรับดึง error message จาก componentState

  @Input() componentState: any = { getError: () => [] };
  // object ที่เก็บ error — มาจาก validation directive

  @Input() searchEnabled = false;
  // true = พิมพ์ค้นหาใน dropdown ได้

  @Input() searchMode: 'contains' | 'startswith' = 'contains';
  // contains   = พิมพ์ตรงไหนก็เจอ เช่น 'an' เจอ 'Thailand'
  // startswith = ต้องขึ้นต้นด้วยคำนั้น เช่น 'Th' เจอ 'Thailand'

  @Input() showSelectionControls:boolean = false;
  // true = แสดง checkbox และปุ่ม Select All ใน dropdown
  // มักใช้คู่กับ applyValueMode="useButtons"

  @Input() applyValueMode: 'instantly' | 'useButtons' = 'instantly';
  // instantly  = เลือกแล้วปิด dropdown ทันที (default)
  // useButtons = ต้องกด OK ถึงจะ apply — ใช้คู่กับ showSelectionControls

  @Input() maxDisplayedTags?: number;
  // จำกัดจำนวน tag ที่แสดง เช่น 3
  // ถ้าเลือก 5 อัน จะแสดง 3 tag แล้วบอกว่า "+2 more"
  // ไม่กำหนด = แสดงทุก tag

  @Input() showMultiTagOnly:boolean = false;
  // ใช้คู่กับ maxDisplayedTags
  // true  = แสดงแค่ "5 selected" อย่างเดียว ไม่แสดง tag เลย
  // false = แสดง tag ปกติ แล้วค่อยบอกส่วนเกิน เช่น "+2 more"

  // --------------------------------------------------
  // OUTPUT — ส่งค่ากลับหน้าบ้าน
  // --------------------------------------------------

  @Output() fieldValueChange = new EventEmitter<(string|number|null)[]>();
  // emit array ของค่าที่เลือกกลับไปให้หน้าบ้าน
  // ต่างจาก select-box ที่ emit ค่าเดียว
  // tag-box emit string[] เสมอ เช่น ['1', '2', '3']

  // --------------------------------------------------
  // ตัวแปรภายใน component
  // --------------------------------------------------

  uiValue: (string | number | null)[] = [];
  // ค่าที่ใช้ bind กับ dx-tag-box จริงๆ
  // แยกออกมาเพื่อไม่ให้แก้ fieldValue ตรงๆ
  // ต้องเป็น array เสมอ — dx-tag-box จะ error ถ้าได้ null หรือ string

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if ('fieldValue' in changes) {
      // เมื่อหน้าบ้านเปลี่ยนค่า fieldValue ให้ sync มาที่ uiValue
      // ?? [] คือถ้า fieldValue เป็น null หรือ undefined ให้ใช้ [] แทน
      // ป้องกัน dx-tag-box ได้รับ null แล้ว error
      this.uiValue = this.fieldValue ?? [];
    }
  }

  // --------------------------------------------------
  // Functions
  // --------------------------------------------------

  displayExpr = (item: valueOption | string): string => {
    // บอก dx-tag-box ว่าแต่ละ option แสดงข้อความอะไร
    if (!item) return '';
    return typeof item === 'string' ? item : item.value;
    // string ธรรมดา → คืน string นั้นเลย   เช่น 'Thailand'
    // valueOption  → คืน .value             เช่น 'IT'
  };

  valueExpr = (item: valueOption | string): string | number => {
    // บอก dx-tag-box ว่าเวลาเลือกแล้วเก็บค่าอะไร
    if (!item) return '';
    return typeof item === 'string' ? item : item.key;
    // string ธรรมดา → คืน string นั้นเลย   เช่น 'Thailand'
    // valueOption  → คืน .key              เช่น '1'
  };

  onValueChange(values: (string | number | null)[]) {
    // values คือ array ของทุกค่าที่เลือกอยู่ตอนนี้
    // ไม่ใช่แค่ค่าที่เพิ่ง click — เป็น snapshot ทั้งหมด
    this.uiValue = values ?? [];            // อัปเดตค่าใน component
    this.fieldValueChange.emit(values ?? []); // ส่ง array กลับหน้าบ้าน
  }
}




