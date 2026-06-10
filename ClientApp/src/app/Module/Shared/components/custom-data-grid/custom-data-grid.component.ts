import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { ActionButton, ColumnConfig } from '../../models/typecustom.model';

@Component({
  selector: 'custom-data-grid',
  imports: [CommonModule, DxDataGridModule, DxTemplateModule, CustomButtonComponent],
  templateUrl: './custom-data-grid.component.html',
  styleUrl: './custom-data-grid.component.scss',
})
export class CustomDataGridComponent {
  // --------------------------------------------------
  // INPUTS
  // --------------------------------------------------

  @Input() dataSource: any[] = [];
  // ข้อมูลที่จะแสดงในตาราง

  @Input() keyExpr: string = 'id';
  // field ที่เป็น primary key ของแต่ละแถว
  @Input() columns: ColumnConfig[] = [];
  // array ของ column ทั้งหมดที่ต้องการแสดง
  // หน้าบ้านกำหนดเองว่าจะมี column อะไรบ้าง

  @Input() actionButtons: ActionButton[] = [];
  // array ของปุ่มใน column ActionButton
  // ถ้าไม่ส่งมา = ไม่มี column ActionButton

  @Input() actionColumnCaption: string = 'จัดการ';
  // caption ของ column ที่เป็น ActionButton

  @Input() actionColumnWidth: number = 150;
  // ความกว้างของ column จัดการ

  @Input() showBorders: boolean = true;
  // แสดงเส้นขอบตาราง

  @Input() showRowLines: boolean = true;
  // แสดงเส้นแบ่งแถว

  @Input() rowAlternationEnabled: boolean = true;
  // สลับสีแถว ช่วยให้อ่านง่าย

  @Input() allowColumnReordering: boolean = false;
  // ให้ลาก column สลับตำแหน่งได้

  @Input() allowColumnResizing: boolean = true;
  // ให้ resize ความกว้าง column ได้

  @Input() showSearchPanel: boolean = false;
  // แสดงช่อง search เหนือตาราง

  @Input() showPager: boolean = true;
  // แสดง pagination ด้านล่าง

  @Input() pageSize: number = 10;
  // จำนวนแถวต่อหน้า

  @Input() hasDetailRow: boolean = false;
  // true = เปิดใช้ master-detail (มีปุ่ม expand ▶ ที่แถว)

  @Input() masterDetailTemplate: TemplateRef<any> | null = null;
  // template ของ detail row
  // หน้าบ้านสร้าง ng-template แล้วส่งเข้ามา

  // --------------------------------------------------
  // OUTPUTS
  // --------------------------------------------------
  @Output() rowClick = new EventEmitter<any>();
  // emit rowData เมื่อ user คลิกที่แถว

  @Output() selectionChanged = new EventEmitter<any[]>();
  // emit array ของแถวที่เลือกเมื่อ selection เปลี่ยน

  // --------------------------------------------------
  // Functions
  // --------------------------------------------------

  isButtonVisible(btn: ActionButton, rowData: any): boolean {
    if (!btn.visible) return true;

    // เช็คว่าปุ่มนี้ควรแสดงไหมสำหรับแถวนี้
    // ถ้าไม่ได้กำหนด visible = แสดงเสมอ
    return btn.visible(rowData);
  }
  onRowClick(e: any): void {
    this.rowClick.emit(e.data);
  }

  onSelectionChanged(e: any): void {
    this.selectionChanged.emit(e.selectedRowsData);
  }
}
