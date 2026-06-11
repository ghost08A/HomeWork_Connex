import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActionButton, ColumnConfig, valueOption } from '../../../Shared/models/typecustom.model';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { ProductList } from '../../models/product.model';
import { CustomCheckboxComponent } from '../../../Shared/components/custom-checkbox/custom-checkbox.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { DecimalPipe } from '@angular/common';
import { DxTemplateModule } from 'devextreme-angular';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';

@Component({
  selector: 'product-dashboard',
  imports: [ DecimalPipe,CustomTagBoxComponent, CustomInputComponent, CustomCheckboxComponent,CustomDataGridComponent, DxTemplateModule, CustomButtonComponent ],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss',
})
export class ProductDashboardComponent implements OnInit {


  // แบบ key-value
  public categoryOptions: valueOption[] = [
   {
    "key": "1",
    "value": "อุปกรณ์ไอที"
  },
  {
    "key": "2",
    "value": "เครื่องเขียนและอุปกรณ์สำนักงาน"
  },
  {
    "key": "3",
    "value": "วัสดุสิ้นเปลือง (กระดาษ, หมึกพิมพ์)"
  },
  {
    "key": "4",
    "value": "อุปกรณ์ทำความสะอาด"
  },
  {
    "key": "5",
    "value": "อาหารและเครื่องดื่ม (Pantry)"
  },
  {
    "key": "6",
    "value": "เวชภัณฑ์และตู้ยา"
  },
  {
    "key": "7",
    "value": "เครื่องใช้ไฟฟ้าส่วนกลาง"
  },
  {
    "key": "8",
    "value": "เฟอร์นิเจอร์สำนักงาน"
  },
  {
    "key": "9",
    "value": "อุปกรณ์เพื่อความปลอดภัย (PPE)"
  },
  {
    "key": "10",
    "value": "เครื่องมือช่างและซ่อมบำรุง"
  }
  ];

  public allProducts: ProductList[] = [
  {
    "productId": 1,
    "productName": "เมาส์ไร้สาย (Wireless Mouse)",
    "price": 450.00,
    "detail": "เมาส์ไร้สายเชื่อมต่อผ่าน Bluetooth 5.0 ระยะการใช้งาน 10 เมตร",
    "quantity": 50,
    "imagePath": "https://placehold.co/400x400/2563eb/ffffff?text=Wireless+Mouse",
    "statusProductCode": "ACTIVE",
    "categoryId": ["1"]
  },
  {
    "productId": 2,
    "productName": "กระดาษถ่ายเอกสาร A4 80 แกรม (500 แผ่น)",
    "price": 120.00,
    "detail": "กระดาษหนา 80 แกรม สำหรับเครื่องพิมพ์และถ่ายเอกสารทั่วไป",
    "quantity": 200,
    "imagePath": "https://placehold.co/400x400/0ea5e9/ffffff?text=A4+Paper",
    "statusProductCode": "ACTIVE",
    "categoryId": ["2", "3"]
  },
  {
    "productId": 3,
    "productName": "ปลั๊กพ่วง 5 ช่อง 5 สวิตช์",
    "price": 350.00,
    "detail": "รางปลั๊กไฟ มอก. สายยาว 3 เมตร รองรับไฟ 2300W",
    "quantity": 15,
    "imagePath": "https://placehold.co/400x400/10b981/ffffff?text=Power+Strip",
    "statusProductCode": "INACTIVE",
    "categoryId": ["1", "7"]
  },
  {
    "productId": 4,
    "productName": "เก้าอี้เพื่อสุขภาพ (Ergonomic Chair)",
    "price": 4500.00,
    "detail": "เก้าอี้สำนักงาน ปรับระดับพนักพิงและที่วางแขนได้ ลดอาการออฟฟิศซินโดรม",
    "quantity": 0,
    "imagePath": "https://placehold.co/400x400/64748b/ffffff?text=Ergonomic+Chair",
    "statusProductCode": "INACTIVE",
    "categoryId": ["8"]
  },
  {
    "productId": 5,
    "productName": "ชุดปฐมพยาบาลเบื้องต้น (First Aid Kit)",
    "price": 850.00,
    "detail": "ชุดยาสามัญประจำออฟฟิศและอุปกรณ์ปฐมพยาบาลฉุกเฉิน ครบชุด",
    "quantity": 10,
    "imagePath": "https://placehold.co/400x400/ef4444/ffffff?text=First+Aid+Kit",
    "statusProductCode": "ACTIVE",
    "categoryId": ["6", "9"]
  },
  {
    "productId": 6,
    "productName": "กาแฟแคปซูล คั่วเข้ม (กล่อง 10 แคปซูล)",
    "price": 250.00,
    "detail": "กาแฟแคปซูลรสชาติเข้มข้น สำหรับเครื่องชงกาแฟส่วนกลาง",
    "quantity": 30,
    "imagePath": "https://placehold.co/400x400/8b5cf6/ffffff?text=Coffee+Capsules",
    "statusProductCode": "ACTIVE",
    "categoryId": ["5"]
  },
  {
    "productId": 7,
    "productName": "น้ำยาทำความสะอาดอเนกประสงค์ 1 ลิตร",
    "price": 89.00,
    "detail": "น้ำยาทำความสะอาดพื้นผิว กำจัดแบคทีเรีย 99.9%",
    "quantity": 45,
    "imagePath": "https://placehold.co/400x400/06b6d4/ffffff?text=Cleaner",
    "statusProductCode": "ACTIVE",
    "categoryId": ["4"]
  },
  {
    "productId": 8,
    "productName": "สว่านไฟฟ้าไร้สาย 12V",
    "price": 1290.00,
    "detail": "สว่านไฟฟ้าพร้อมแบตเตอรี่ 2 ก้อน สำหรับงานซ่อมบำรุงทั่วไปในสำนักงาน",
    "quantity": 3,
    "imagePath": "https://placehold.co/400x400/f59e0b/ffffff?text=Cordless+Drill",
    "statusProductCode": "INACTIVE",
    "categoryId": ["10"]
  },
  {
    "productId": 9,
    "productName": "ปากกาลูกลื่น น้ำเงิน (กล่อง 50 ด้าม)",
    "price": 250.00,
    "detail": "ปากกาลูกลื่นหัว 0.5mm เขียนลื่นไม่สะดุด",
    "quantity": 120,
    "imagePath": "https://placehold.co/400x400/3b82f6/ffffff?text=Blue+Pen",
    "statusProductCode": "ACTIVE",
    "categoryId": ["2"]
  },
  {
    "productId": 10,
    "productName": "ตู้เก็บเอกสารเหล็ก 2 บานเปิด",
    "price": 2800.00,
    "detail": "ตู้เหล็กเก็บเอกสารสำคัญ พร้อมกุญแจล็อก 2 ชั้น",
    "quantity": 8,
    "imagePath": "https://placehold.co/400x400/475569/ffffff?text=Steel+Cabinet",
    "statusProductCode": "ACTIVE",
    "categoryId": ["2", "8"]
  }
  ];

  public filterActive: boolean = false;
  public filterInactive: boolean = false;

  public filteredProducts: ProductList[] = [];
  public searchKeyword: string = '';
  public selectedCategories: string[] = [];

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  public columns: ColumnConfig[] = [];

  ngOnInit(): void {
    this.filteredProducts = [...this.allProducts];
    
    this.columns = [
      {
        dataField: 'productId',
        caption: 'รหัส',
        dataType: 'number',
        alignment: 'center',
        width: 80,
      },
      {
        dataField: 'productName',
        caption: 'ชื่อสินค้า',
        alignment: 'left',
      },
      {
        dataField: 'statusProductCode',
        caption: 'สถานะ',
        alignment: 'center',
        width: 120,
        cellTemplate: this.statusTemplate, // ใช้ TemplateRef
      },
    ];
  }

actionButtons: ActionButton[] = [
    {
      text: '',
      icon: 'edit',
      type: 'default',
      stylingMode: 'text',
      onClick: (rowData) => this.onEdit(rowData),
    },
    {
      text: '',
      icon: 'trash',
      type: 'danger',
      stylingMode: 'text',
      disabled: (rowData) => rowData.statusProductCode === 'ACTIVE',
      onClick: (rowData) => this.onDelete(rowData),
    },
  ];

  public detailColumns: ColumnConfig[] = [
    { dataField: 'detailId',    caption: 'รหัส',         alignment: 'center', width: 80 },
    { dataField: 'description', caption: 'รายละเอียด',   alignment: 'left'              },
    { dataField: 'price',       caption: 'ราคา',          alignment: 'right',
      dataType: 'number', format: '#,##0.00'                                              },
    { dataField: 'stock',       caption: 'จำนวนคงเหลือ', alignment: 'center',
      dataType: 'number'                                                                   },
  ];

  public applyFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      
      const matchesSearch = this.searchKeyword 
        ? product.productName.toLowerCase().includes(this.searchKeyword.toLowerCase())
        : true; 

      const matchesCategory = this.selectedCategories && this.selectedCategories.length > 0
        ? product.categoryId.some(catId => this.selectedCategories.includes(catId))
        : true; 

      const bothUnchecked = !this.filterActive && !this.filterInactive;
      const matchesStatus = bothUnchecked ? true 
        : (this.filterActive && product.statusProductCode === 'ACTIVE') || 
          (this.filterInactive && product.statusProductCode === 'INACTIVE');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  public onAddProduct(): void {
    console.log('เพิ่มสินค้า');
    // TODO: ใส่ Logic เปิด popup หรือ Navigate ไปหน้าเพิ่มสินค้า
  }

  public onEdit(rowData: any): void {
    console.log('แก้ไข:', rowData);
    // ใส่ logic ที่ต้องการ เช่น เปิด popup หรือ navigate ไปหน้า edit
  }

  public onDelete(rowData: any): void {
    console.log('ลบ:', rowData);
    // ใส่ logic ที่ต้องการ เช่น เรียก API ลบ
  }
  public onRowClick(rowData: any): void { 
    // ตัวอย่างการใช้งาน rowClick
   }
  
}
