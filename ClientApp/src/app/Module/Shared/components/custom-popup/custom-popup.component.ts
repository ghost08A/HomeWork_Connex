import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,   // ดึง ng-template ที่หน้าบ้านใส่เข้ามาข้างใน tag
  TemplateRef,    // type ของ ng-template
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { PopupButton } from '../../models/typecustom.model';

@Component({
  selector: 'custom-popup',
  imports: [
    CommonModule,
    DxPopupModule,
    CustomButtonComponent
  ],
  templateUrl: './custom-popup.component.html',
  styleUrl: './custom-popup.component.scss',
})
export class CustomPopupComponent {
  // --------------------------------------------------
  // INPUTS
  // --------------------------------------------------

  
  //เปิดปิด  [(visible)] หรือ [visible] + (visibleChange)
  @Input() visible: boolean = false;
  
  @Input() title: string = '';   // หัวข้อ popup เช่น 'เพิ่มสินค้า', 'ยืนยันการลบ'

    @Input() width: string | number = 500;
  // ความกว้าง popup เช่น 500, '80%', '90vw'

  @Input() height: string | number = 'auto';
  // ความสูง popup
  // 'auto' = ปรับตามเนื้อหา (แนะนำ)
  // หรือกำหนดตัวเลข เช่น 400

  @Input() showCloseButton: boolean = true;
  // แสดงปุ่ม X มุมบนขวา

  @Input() closeOnOutsideClick: boolean = false;


  @Input() buttons: PopupButton[] = [];
  // array ของปุ่มด้านล่าง popup
  // เรียงจากซ้ายไปขวาตามลำดับใน array

  @Input() contentTemplate: TemplateRef<any> | null = null;
  // template เนื้อหาข้างใน popup

   // --------------------------------------------------
  // OUTPUTS
  // --------------------------------------------------

  @Output() visibleChange = new EventEmitter<boolean>();
  // emit เมื่อ popup เปิด/ปิด ใช้คู่กับ [visible] ทำให้เป็น two-way binding [(visible)] ได้

  @Output() onHidden = new EventEmitter<void>();
  // emit เมื่อ popup ถูกปิด (ไม่ว่าจะปิดด้วยวิธีไหน)
  // ใช้สำหรับ reset form หรือ clear state

  close(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onPopupHidden(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible); // emit สถานะปัจจุบัน (false)
    this.onHidden.emit(); 
  }
}
