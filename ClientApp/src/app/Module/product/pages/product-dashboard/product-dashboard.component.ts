import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  ActionButton,
  ColumnConfig,
  PopupButton,
  valueOption,
} from '../../../Shared/models/typecustom.model';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { ProductForm, ProductList } from '../../models/product.model';
import { CustomCheckboxComponent } from '../../../Shared/components/custom-checkbox/custom-checkbox.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomSelectBoxComponent } from '../../../Shared/components/custom-select-box/custom-select-box.component';
@Component({
  selector: 'product-dashboard',
  imports: [
    DecimalPipe,
    DatePipe,
    CustomTagBoxComponent,
    CustomInputComponent,
    CustomCheckboxComponent,
    CustomDataGridComponent,
    CustomButtonComponent,
    CustomPopupComponent,
    CustomSelectBoxComponent
  ],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss',
})
export class ProductDashboardComponent implements OnInit {
  // แบบ key-value
  public categoryOptions: valueOption[] = [
    {
      key: '1',
      value: 'อุปกรณ์ไอที',
    },
    {
      key: '2',
      value: 'เครื่องเขียนและอุปกรณ์สำนักงาน',
    },
    {
      key: '3',
      value: 'วัสดุสิ้นเปลือง (กระดาษ, หมึกพิมพ์)',
    },
    {
      key: '4',
      value: 'อุปกรณ์ทำความสะอาด',
    },
    {
      key: '5',
      value: 'อาหารและเครื่องดื่ม (Pantry)',
    },
    {
      key: '6',
      value: 'เวชภัณฑ์และตู้ยา',
    },
    {
      key: '7',
      value: 'เครื่องใช้ไฟฟ้าส่วนกลาง',
    },
    {
      key: '8',
      value: 'เฟอร์นิเจอร์สำนักงาน',
    },
    {
      key: '9',
      value: 'อุปกรณ์เพื่อความปลอดภัย (PPE)',
    },
    {
      key: '10',
      value: 'เครื่องมือช่างและซ่อมบำรุง',
    },
  ];

  public allProducts: ProductList[] = [
    {
      productId: 1,
      productName: 'เมาส์ไร้สาย (Wireless Mouse)',
      price: 450.0,
      detail: 'เมาส์ไร้สายเชื่อมต่อผ่าน Bluetooth 5.0 ระยะการใช้งาน 10 เมตร',
      quantity: 50,
      imagePath: 'https://placehold.co/400x400/2563eb/ffffff?text=Wireless+Mouse',
      statusProductCode: 'ACTIVE',
      categoryId: ['1'],
      createdDate: '2024-01-10T08:30:00',
      updatedDate: '2024-05-15T14:20:00',
    },
    {
      productId: 2,
      productName: 'กระดาษถ่ายเอกสาร A4 80 แกรม (500 แผ่น)',
      price: 120.0,
      detail: 'กระดาษหนา 80 แกรม สำหรับเครื่องพิมพ์และถ่ายเอกสารทั่วไป',
      quantity: 200,
      imagePath: 'https://placehold.co/400x400/0ea5e9/ffffff?text=A4+Paper',
      statusProductCode: 'ACTIVE',
      categoryId: ['2', '3'],
      createdDate: '2024-02-05T09:15:00',
      updatedDate: '2024-06-01T10:45:00',
    },
    {
      productId: 3,
      productName: 'ปลั๊กพ่วง 5 ช่อง 5 สวิตช์',
      price: 350.0,
      detail: 'รางปลั๊กไฟ มอก. สายยาว 3 เมตร รองรับไฟ 2300W',
      quantity: 15,
      imagePath: 'https://placehold.co/400x400/10b981/ffffff?text=Power+Strip',
      statusProductCode: 'INACTIVE',
      categoryId: ['1', '7'],
      createdDate: '2023-11-20T11:00:00',
      updatedDate: '2024-01-25T16:30:00',
    },
    {
      productId: 4,
      productName: 'เก้าอี้เพื่อสุขภาพ (Ergonomic Chair)',
      price: 4500.0,
      detail: 'เก้าอี้สำนักงาน ปรับระดับพนักพิงและที่วางแขนได้ ลดอาการออฟฟิศซินโดรม',
      quantity: 0,
      imagePath: 'https://placehold.co/400x400/64748b/ffffff?text=Ergonomic+Chair',
      statusProductCode: 'INACTIVE',
      categoryId: ['8'],
      createdDate: '2024-03-12T13:40:00',
      updatedDate: '2024-06-10T09:20:00',
    },
    {
      productId: 5,
      productName: 'ชุดปฐมพยาบาลเบื้องต้น (First Aid Kit)',
      price: 850.0,
      detail: 'ชุดยาสามัญประจำออฟฟิศและอุปกรณ์ปฐมพยาบาลฉุกเฉิน ครบชุด',
      quantity: 10,
      imagePath: 'https://placehold.co/400x400/ef4444/ffffff?text=First+Aid+Kit',
      statusProductCode: 'ACTIVE',
      categoryId: ['6', '9'],
      createdDate: '2024-01-05T10:00:00',
      updatedDate: '2024-04-18T15:10:00',
    },
    {
      productId: 6,
      productName: 'กาแฟแคปซูล คั่วเข้ม (กล่อง 10 แคปซูล)',
      price: 250.0,
      detail: 'กาแฟแคปซูลรสชาติเข้มข้น สำหรับเครื่องชงกาแฟส่วนกลาง',
      quantity: 30,
      imagePath: 'https://placehold.co/400x400/8b5cf6/ffffff?text=Coffee+Capsules',
      statusProductCode: 'ACTIVE',
      categoryId: ['5'],
      createdDate: '2024-04-22T08:50:00',
      updatedDate: '2024-06-05T11:30:00',
    },
    {
      productId: 7,
      productName: 'น้ำยาทำความสะอาดอเนกประสงค์ 1 ลิตร',
      price: 89.0,
      detail: 'น้ำยาทำความสะอาดพื้นผิว กำจัดแบคทีเรีย 99.9%',
      quantity: 45,
      imagePath: 'https://placehold.co/400x400/06b6d4/ffffff?text=Cleaner',
      statusProductCode: 'ACTIVE',
      categoryId: ['4'],
      createdDate: '2024-05-10T14:15:00',
      updatedDate: '2024-06-08T16:40:00',
    },
    {
      productId: 8,
      productName: 'สว่านไฟฟ้าไร้สาย 12V',
      price: 1290.0,
      detail: 'สว่านไฟฟ้าพร้อมแบตเตอรี่ 2 ก้อน สำหรับงานซ่อมบำรุงทั่วไปในสำนักงาน',
      quantity: 2,
      imagePath: 'https://placehold.co/400x400/f59e0b/ffffff?text=Cordless+Drill',
      statusProductCode: 'INACTIVE',
      categoryId: ['10'],
      createdDate: '2023-12-01T09:30:00',
      updatedDate: '2024-03-20T10:10:00',
    },
    {
      productId: 9,
      productName: 'ปากกาลูกลื่น น้ำเงิน (กล่อง 50 ด้าม)',
      price: 250.0,
      detail: 'ปากกาลูกลื่นหัว 0.5mm เขียนลื่นไม่สะดุด',
      quantity: 120,
      imagePath: 'https://placehold.co/400x400/3b82f6/ffffff?text=Blue+Pen',
      statusProductCode: 'ACTIVE',
      categoryId: ['2'],
      createdDate: '2024-02-15T11:45:00',
      updatedDate: '2024-05-22T13:25:00',
    },
    {
      productId: 10,
      productName: 'ตู้เก็บเอกสารเหล็ก 2 บานเปิด',
      price: 2800.0,
      detail: 'ตู้เหล็กเก็บเอกสารสำคัญ พร้อมกุญแจล็อก 2 ชั้น',
      quantity: 8,
      imagePath: 'https://placehold.co/400x400/475569/ffffff?text=Steel+Cabinet',
      statusProductCode: 'ACTIVE',
      categoryId: ['2', '8'],
      createdDate: '2024-01-20T10:20:00',
      updatedDate: '2024-04-30T15:55:00',
    },
  ];

  public statusOptions: valueOption[] = [
    { key: 'ACTIVE', value: '🟢 ใช้งาน (ACTIVE)' },
    { key: 'INACTIVE', value: '🔴 ระงับการใช้งาน (INACTIVE)' }
  ];

  public filterActive: boolean = false;
  public filterInactive: boolean = false;
  public filteredProducts: ProductList[] = [];
  public searchKeyword: string = '';
  public selectedCategories: string[] = [];

  public isPopupVisible: boolean = false;
  public popupMode: 'ADD' | 'EDIT' = 'ADD';
  public showDeletePopup: boolean = false;

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  public columns: ColumnConfig[] = [];
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
    { dataField: 'detailId', caption: 'รหัส', alignment: 'center', width: 80 },
    { dataField: 'description', caption: 'รายละเอียด', alignment: 'left' },
    {
      dataField: 'price',
      caption: 'ราคา',
      alignment: 'right',
      dataType: 'number',
      format: '#,##0.00',
    },
    { dataField: 'stock', caption: 'จำนวนคงเหลือ', alignment: 'center', dataType: 'number' },
  ];

  public productForm: ProductForm = new ProductForm();

  // เก็บ record ที่กำลังจะลบ
  public productToDelete: ProductList | null = null;

  ngOnInit(): void {
    // แปลง categoryId ให้เป็น categoryNames
    this.allProducts = this.allProducts.map((p) => {
      const names = p.categoryId.map((id) => {
        const option = this.categoryOptions.find((opt) => opt.key === id);
        return option ? option.value : id;
      });
      return { ...p, categoryNames: names.join(', ') };
    });

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
        dataField: 'categoryNames',
        caption: 'ประเภทสินค้า',
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

  get popupButtons(): PopupButton[] {
    return [
      {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => {
          this.isPopupVisible = false;
        },
      },
      {
        text: 'บันทึก',
        type: 'success',
        stylingMode: 'contained',
        icon: 'save',
        onClick: () => {
          this.saveProduct();
        },
      },
    ];
  }

  // ปุ่มใน popup ยืนยันลบ
  get deleteButtons(): PopupButton[] {
    return [
      {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => {
          this.showDeletePopup = false;
          this.productToDelete = null; // clear ข้อมูลที่เก็บไว้
        },
      },
      {
        text: 'ยืนยันลบ',
        type: 'danger',
        stylingMode: 'contained',
        icon: 'trash',
        onClick: () => {
          this.confirmDelete();
        },
      },
    ];
  }

  public applyFilters(): void {
    this.filteredProducts = this.allProducts.filter((product) => {
      const matchesSearch = this.searchKeyword
        ? product.productName.toLowerCase().includes(this.searchKeyword.toLowerCase())
        : true;

      const matchesCategory =
        this.selectedCategories && this.selectedCategories.length > 0
          ? product.categoryId.some((catId) => this.selectedCategories.includes(catId))
          : true;

      const bothUnchecked = !this.filterActive && !this.filterInactive;
      const matchesStatus = bothUnchecked
        ? true
        : (this.filterActive && product.statusProductCode === 'ACTIVE') ||
          (this.filterInactive && product.statusProductCode === 'INACTIVE');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  public onAddNewProduct(): void {
    this.popupMode = 'ADD';
    // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
    this.productForm = {
      productId: 0,
      productName: '',
      price: 0,
      quantity: 0,
      detail: '',
      statusProductCode: 'ACTIVE',
      imagePath: '',
      categoryId: [],
    };
    setTimeout(() => {
      this.isPopupVisible = true; // เปิด popup
    })
  }

  public onEdit(rowData: ProductList): void {
    this.popupMode = 'EDIT';
    this.productForm = {
      productId: rowData.productId,
      productName: rowData.productName,
      price: rowData.price,
      quantity: rowData.quantity,
      detail: rowData.detail,
      statusProductCode: rowData.statusProductCode,
      imagePath: rowData.imagePath,
      categoryId: [...rowData.categoryId], // clone array
    };
    setTimeout(() => {
      this.isPopupVisible = true; // เปิด popup
    })
  }

  public saveProduct(): void {
    console.log(`บันทึกข้อมูล (${this.popupMode}):`, this.productForm);

    if (this.popupMode === 'ADD') {
      const newId = this.allProducts.length > 0 ? Math.max(...this.allProducts.map(p => p.productId)) + 1 : 1;
      const newProduct: ProductList = {
        ...this.productForm,
        productId: newId,
        categoryNames: this.productForm.categoryId
          .map((id) => {
            const option = this.categoryOptions.find((opt) => opt.key === id);
            return option ? option.value : id;
          })
          .join(', '),
        createdDate: new Date(),
        updatedDate: new Date(),
      };
      // ใส่รูป mock ถ้าว่าง
      if (!newProduct.imagePath) {
        newProduct.imagePath = 'https://placehold.co/400x400/94a3b8/ffffff?text=New+Product';
      }
      this.allProducts.push(newProduct);
    } else {
      const index = this.allProducts.findIndex((p) => p.productId === this.productForm.productId);
      if (index !== -1) {
        this.allProducts[index] = {
          ...this.allProducts[index],
          ...this.productForm,
          updatedDate: new Date(),
          categoryNames: this.productForm.categoryId
            .map((id) => {
              const option = this.categoryOptions.find((opt) => opt.key === id);
              return option ? option.value : id;
            })
            .join(', '),
        };
      }
    }
    
    this.isPopupVisible = false;
    this.applyFilters(); // refresh ตาราง
  }

  public onProductPopupHidden(): void {
    // popup ปิดสนิทแล้ว — reset form กลับเป็นค่าว่าง
    this.productForm = {
      productId: 0,
      productName: '',
      price: 0,
      quantity: 0,
      detail: '',
      statusProductCode: 'ACTIVE',
      imagePath: '',
      categoryId: [],
    };
  }

  public onDelete(rowData: ProductList): void {
    console.log('ลบ:', rowData);
    this.productToDelete = rowData;
    this.showDeletePopup = true;
  }

  public confirmDelete(): void {
    if (!this.productToDelete) return;

    // TODO: เรียก API delete ด้วย this.productToDelete.productId
    console.log('ลบสินค้า:', this.productToDelete);

    // ลบออกจาก allProducts (ก่อนมี API จริง)
    this.allProducts = this.allProducts.filter(
      (p) => p.productId !== this.productToDelete!.productId,
    );

    this.productToDelete = null;
    this.applyFilters(); // refresh ตาราง
  }

  public onDeletePopupHidden(): void {
    // popup ปิดสนิทแล้ว — clear ข้อมูลที่เก็บไว้
    this.productToDelete = null;
  }

  public onRowClick(rowData: any): void {
    console.log('คลิกแถว:', rowData);
  }
}
