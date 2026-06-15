import { Component , inject, OnInit, ViewChild} from '@angular/core';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { ActionButton, ColumnConfig, valueOption } from '../../../Shared/models/typecustom.model';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomCheckboxGroupComponent } from '../../../Shared/components/custom-checkbox-group/custom-checkbox-group.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import DataSource from 'devextreme/data/data_source';
import { LoadingService } from '../../../Shared/services/loading.service';

// ======================================
// Mock Data Models
// ======================================
interface OrderProduct {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface MockOrder {
  orderId: number;
  productName: string; // Concatenated product names
  actionBy: string;
  status: string; // For display in the grid column
  statusOrder: string; // For button logic
  orderDate: Date;
  products: OrderProduct[]; // Detailed product list
}
@Component({
  selector: 'order-dashboard',
  imports: [
    CustomInputComponent,
    CustomTagBoxComponent,
    CustomButtonComponent,
    CustomCheckboxGroupComponent,
    CustomDataGridComponent,
  ],
  templateUrl: './order-dashboard.component.html',
  styleUrl: './order-dashboard.component.scss',
})
export class OrderDashboardComponent implements OnInit {
  public loadingService = inject(LoadingService);

  // ======================================
  // ตัวเลือก Category & Status
  // ======================================
  public categoryOptions: valueOption[] = [];
  public statusOptions: valueOption[] = [
    { key: 'Draft', value: 'Draft' },
    { key: 'Submit', value: 'Submit' },
    { key: 'Pending', value: 'Pending' },
    { key: 'Approved', value: 'Approved' },
    { key: 'Rejected', value: 'Rejected' },
    { key: 'WaitApprove', value: 'Wait Approve' },
  ];
  // ======================================
  // ตัวแปรค้นหา / Filter
  // ======================================
  public searchKeyword: string = '';
  public selectedCategories: number[] = [];
  public selectedStatus:  (string | number)[] = [];
  public startDate: Date | null = null;
  public endDate: Date | null = null;

  public gridDataSource!: DataSource;

  private mockOrders: MockOrder[] = [
    {
      orderId: 1001,
      products: [
        { productId: 1, productName: 'โน๊ตบุ๊คสำหรับทำงาน', price: 25000, quantity: 1 },
        { productId: 2, productName: 'เมาส์ไร้สาย', price: 790, quantity: 1 },
      ],
      actionBy: 'สมชาย ใจดี',
      statusOrder: 'Draft',
      status: 'Draft',
      orderDate: new Date('2026-06-10T10:00:00Z'),
      productName: 'โน๊ตบุ๊คสำหรับทำงาน, เมาส์ไร้สาย',
    },
    {
      orderId: 1002,
      products: [{ productId: 3, productName: 'จอคอมพิวเตอร์ 24 นิ้ว', price: 4500, quantity: 2 }],
      actionBy: 'สมศรี มีสุข',
      statusOrder: 'Approved',
      status: 'Approved',
      orderDate: new Date('2026-06-11T11:30:00Z'),
      productName: 'จอคอมพิวเตอร์ 24 นิ้ว',
    },
    {
      orderId: 1003,
      products: [{ productId: 4, productName: 'คีย์บอร์ดเกมมิ่ง', price: 3200, quantity: 1 }],
      actionBy: 'สมชาย ใจดี',
      statusOrder: 'Rejected',
      status: 'Rejected',
      orderDate: new Date('2026-06-12T14:00:00Z'),
      productName: 'คีย์บอร์ดเกมมิ่ง',
    },
    {
      orderId: 1004,
      products: [{ productId: 5, productName: 'หูฟังบลูทูธ', price: 1800, quantity: 1 }],
      actionBy: 'มานะ อดทน',
      statusOrder: 'WaitApprove',
      status: 'WaitApprove',
      orderDate: new Date('2026-06-13T09:00:00Z'),
      productName: 'หูฟังบลูทูธ',
    },
    {
      orderId: 1005,
      products: [{ productId: 6, productName: 'ปริ้นเตอร์สี', price: 5500, quantity: 1 }],
      actionBy: 'สมศรี มีสุข',
      statusOrder: 'Submit',
      status: 'Submit',
      orderDate: new Date('2026-06-14T16:20:00Z'),
      productName: 'ปริ้นเตอร์สี',
    },
  ];
  
  @ViewChild('dataGrid') dataGrid?: CustomDataGridComponent;

   public masterColumns: ColumnConfig[] = [];

   public actionButtons: ActionButton[] = [
    {
        text: '',
        icon: "checkmarkcircle",
        type: 'success',
        stylingMode: 'text',
        disabled: (rowData) => rowData.statusOrder !== 'Draft',
        onClick: (rowdata) => {}
    },
    {
        text: '',
        icon: 'edit',
        type: 'default',
        stylingMode: 'text',
        disabled: (rowData) => rowData.statusOrder === 'Approved' || rowData.statusOrder === 'Rejected' || rowData.statusOrder === 'WaitApprove',
        onClick: (rowdata) => {}
      },
      {
        text: '',
        icon: 'trash',
        type: 'danger',
        stylingMode: 'text',
        disabled: (rowData) => rowData.statusOrder === 'Approved' || rowData.statusOrder === 'Rejected' || rowData.statusOrder === 'WaitApprove',
        onClick: (rowdata) => {}
      },
      
   ];

   ngOnInit(): void {
    this.masterColumns = [
      {
        dataField: 'orderId',
        caption: 'รหัส',
        dataType: 'number',
        alignment: 'center',
        width: 80,
      },
      {
        dataField: 'productName',
        caption: 'ชื่อสินค้า',
        dataType: 'string',
        alignment: 'left',
        // width: 200,
      },
      {
        dataField: 'actionBy',
        caption: 'ผู้ดำเนินการ',
        dataType: 'string',
        alignment: 'left',
        width: 150,
      },
      {
        dataField: 'status',
        caption: 'สถานะ',
        dataType: 'string',
        alignment: 'center',
        width: 100,
      },
      {
        dataField: 'orderDate',
        caption: 'วันที่เบิก',
        dataType: 'date',
        alignment: 'center',
        width: 120,
      }
    ];

    this.gridDataSource = new DataSource({
      store: this.mockOrders,
      key: 'orderId',
    });

    setTimeout(() => {
      this.dataGrid?.setDataSource(this.gridDataSource);
    });
   }

  public onSearch(): void {}
  public onClear(): void {
    this.searchKeyword = '';
    this.selectedCategories = [];
    this.selectedStatus = [];
    this.startDate = null;
    this.endDate = null;
  }
}
