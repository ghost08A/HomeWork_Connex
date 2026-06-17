import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { ActionButton, ColumnConfig } from '../../models/typecustom.model';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'custom-data-grid',
  imports: [CommonModule, DxDataGridModule, DxTemplateModule, CustomButtonComponent],
  templateUrl: './custom-data-grid.component.html',
  styleUrl: './custom-data-grid.component.scss',
})
export class CustomDataGridComponent {
  @ViewChild('dataGrid') dataGrid?: DxDataGridComponent;

  // --------------------------------------------------
  // INPUTS
  // --------------------------------------------------

  @Input() dataSource: any[] | DataSource = [];
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

  // true = ส่ง skip/take/sort/filter ไป backend (Server-Side)
  // false = จัดการทุกอย่างใน client (ใช้เมื่อ dataSource เป็น Array)
  @Input() remoteOperations: boolean = false;

  @Input() hasDetailRow: boolean = false;
  // true = เปิดใช้ master-detail (มีปุ่ม expand ▶ ที่แถว)

  @Input() masterDetailTemplate: TemplateRef<any> | null = null;
  // template ของ detail row
  // หน้าบ้านสร้าง ng-template แล้วส่งเข้ามา

  @Input() expandCondition?: (rowData: any) => boolean;
  // function เช็คเงื่อนไขว่าแถวไหนกดขยาย detail ได้บ้าง
  // ถ้า return false จะซ่อนปุ่มลูกศรลง

  // --------------------------------------------------
  // OUTPUTS
  // --------------------------------------------------
  @Output() rowClick = new EventEmitter<any>();
  // emit rowData เมื่อ user คลิกที่แถว

  @Output() selectionChanged = new EventEmitter<any[]>();
  // emit array ของแถวที่เลือกเมื่อ selection เปลี่ยน

  @Output() cellPrepared = new EventEmitter<any>();
  // emit e จาก onCellPrepared ของ DevExtreme

  // --------------------------------------------------
  // Functions
  // --------------------------------------------------

  handleCellPrepared(e: any): void {
    if (e.rowType === 'data' && e.column.command === 'expand') {
      if (this.expandCondition && !this.expandCondition(e.data)) {
        e.cellElement.classList.remove('dx-datagrid-expand');
        e.cellElement.innerHTML = '';
      }
    }
    
    // ส่งต่อ event เผื่อ parent component ต้องการดักจับเอง
    this.cellPrepared.emit(e);
  }

  isButtonVisible(btn: ActionButton, rowData: any): boolean {
    if (!btn.visible) return true;
    return btn.visible(rowData);
  }

  isButtonDisabled(btn: ActionButton, rowData: any): boolean {
    if (typeof btn.disabled === 'function') {
      return btn.disabled(rowData);
    }
    return btn.disabled ?? false;
  }

  onRowClick(e: any): void {
    this.rowClick.emit(e.data);
  }

  onSelectionChanged(e: any): void {
    this.selectionChanged.emit(e.selectedRowsData);
  }

  isTemplateRef(value: any): boolean {
    return value instanceof TemplateRef;
  }

  getTemplateRef(dataField: string): TemplateRef<any> | null {
    const col = this.columns.find(c => c.dataField === dataField);
    return (col && col.cellTemplate instanceof TemplateRef) ? col.cellTemplate : null;
  }

  setDataSource(dataSource: any[] | DataSource): void {
    this.dataSource = dataSource;
    this.dataGrid?.instance.option('dataSource', dataSource);
    this.refresh();
  }

  refresh(): void {
    this.dataGrid?.instance.refresh();
    this.repaint();
  }

  reload(): void {
    this.dataGrid?.instance.getDataSource()?.reload();
    this.repaint();
  }

  repaint(): void {
    this.dataGrid?.instance.repaint();
  }
}
