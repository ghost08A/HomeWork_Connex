import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import {
  ActionButton,
  ColumnConfig,
  PopupButton,
  valueOption,
} from '../../../Shared/models/typecustom.model';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { ProductForm, ProductList, ProductSearchRequestModel, ProductSearchResponseModel } from '../../models/product.model';
import { CustomCheckboxComponent } from '../../../Shared/components/custom-checkbox/custom-checkbox.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomSelectBoxComponent } from '../../../Shared/components/custom-select-box/custom-select-box.component';
import { ProductService } from '../../service/product.service';

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
export class ProductDashboardComponent implements OnInit, AfterViewInit {

  constructor(private productService: ProductService) {}

  // ======================================
  // ตัวเลือก Category — key เป็น string ตาม valueOption interface
  // ======================================
  public categoryOptions: valueOption[] = [
    { key: '1',  value: 'อุปกรณ์ไอที' },
    { key: '2',  value: 'เครื่องเขียนและอุปกรณ์สำนักงาน' },
    { key: '3',  value: 'วัสดุสิ้นเปลือง (กระดาษ, หมึกพิมพ์)' },
    { key: '4',  value: 'อุปกรณ์ทำความสะอาด' },
    { key: '5',  value: 'อาหารและเครื่องดื่ม (Pantry)' },
    { key: '6',  value: 'เวชภัณฑ์และตู้ยา' },
    { key: '7',  value: 'เครื่องใช้ไฟฟ้าส่วนกลาง' },
    { key: '8',  value: 'เฟอร์นิเจอร์สำนักงาน' },
    { key: '9',  value: 'อุปกรณ์เพื่อความปลอดภัย (PPE)' },
    { key: '10', value: 'เครื่องมือช่างและซ่อมบำรุง' },
  ];

  public statusOptions: valueOption[] = [
    { key: 'ACTIVE',   value: '🟢 ใช้งาน (ACTIVE)' },
    { key: 'INACTIVE', value: '🔴 ระงับการใช้งาน (INACTIVE)' },
  ];

  // ======================================
  // ตัวแปรค้นหา / Filter
  // ======================================
  public searchKeyword: string = '';
  public filterActive: boolean = false;
  public filterInactive: boolean = false;
  public selectedCategories: string[] = [];  // TagBox ส่ง string[]

  // ======================================
  // ข้อมูลตาราง
  // ======================================
  public filteredProducts: ProductList[] = [];
  public totalCount: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public isLoading: boolean = false;

  // ======================================
  // Popup & Form
  // ======================================
  public isPopupVisible: boolean = false;
  public popupMode: 'ADD' | 'EDIT' = 'ADD';
  public showDeletePopup: boolean = false;
  public productForm: ProductForm = new ProductForm();
  public productToDelete: ProductList | null = null;

  // ======================================
  // Column & Action
  // ======================================
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  public columns: ColumnConfig[] = [];

  public actionButtons: ActionButton[] = [
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

  // ======================================
  // Lifecycle Hooks
  // ======================================
  ngOnInit(): void {
    this.fetchProducts();
  }

  ngAfterViewInit(): void {
    // ต้องรอ ViewChild (statusTemplate) พร้อมก่อนจึงค่อย setup columns
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
        cellTemplate: this.statusTemplate,
      },
    ];
  }

  // ======================================
  // Popup Buttons (getter — คำนวณใหม่ทุกครั้ง)
  // ======================================
  get popupButtons(): PopupButton[] {
    return [
      {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => { this.isPopupVisible = false; },
      },
      {
        text: 'บันทึก',
        type: 'success',
        stylingMode: 'contained',
        icon: 'save',
        onClick: () => { this.saveProduct(); },
      },
    ];
  }

  get deleteButtons(): PopupButton[] {
    return [
      {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => {
          this.showDeletePopup = false;
          this.productToDelete = null;
        },
      },
      {
        text: 'ยืนยันลบ',
        type: 'danger',
        stylingMode: 'contained',
        icon: 'trash',
        onClick: () => { this.confirmDelete(); },
      },
    ];
  }

  // ======================================
  // Helper: แปลง API Response → ProductList
  // ======================================
  private mapToProductList(res: ProductSearchResponseModel): ProductList {
    const categoryNames = res.categoryId.map(id => {
      const option = this.categoryOptions.find(opt => opt.key === String(id));
      return option ? option.value : String(id);
    }).join(', ');

    return {
      productId:          res.productId,
      productName:        res.productName,
      price:              res.price,
      detail:             res.detail,
      quantity:           res.quantity,
      imagePath:          res.imagePath,
      statusProductCode:  res.statusProductCode,
      categoryId:         res.categoryId,
      categoryNames,
      createdAt:          res.createdAt,
      updatedAt:          res.updatedAt,
    };
  }

  // ======================================
  // API: ดึงข้อมูลสินค้า
  // ======================================
  private fetchProducts(): void {
    this.isLoading = true;

    const request: ProductSearchRequestModel = {
      keyword:        this.searchKeyword || null,
      filterActive:   this.filterActive,
      filterInactive: this.filterInactive,
      // TagBox ส่ง string[] → แปลงเป็น number[]
      categoryIds:    this.selectedCategories.length > 0
                        ? this.selectedCategories.map(Number)
                        : null,
      pageNumber:     this.currentPage,
      pageSize:       this.pageSize,
    };

    this.productService.searchProducts(request).subscribe({
      next: (res) => {
        this.filteredProducts = res.item.map(p => this.mapToProductList(p));
        this.totalCount       = res.totalCount;
        this.isLoading        = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ======================================
  // Filter (เรียก API ใหม่)
  // ======================================
  public applyFilters(): void {
    this.currentPage = 1;
    this.fetchProducts();
  }

  // ======================================
  // Popup: เพิ่ม / แก้ไข
  // ======================================
  public onAddNewProduct(): void {
    this.popupMode = 'ADD';
    this.productForm = new ProductForm();
    setTimeout(() => { this.isPopupVisible = true; });
  }

  public onEdit(rowData: ProductList): void {
    this.popupMode = 'EDIT';
    this.productForm = {
      productId:         rowData.productId,
      productName:       rowData.productName,
      price:             rowData.price,
      quantity:          rowData.quantity,
      detail:            rowData.detail,
      statusProductCode: rowData.statusProductCode,
      imagePath:         rowData.imagePath,
      categoryId:        [...rowData.categoryId],
    };
    setTimeout(() => { this.isPopupVisible = true; });
  }

  public saveProduct(): void {
    // TODO: เรียก API Create/Update เมื่อมี endpoint พร้อม
    // ตอนนี้ปิด popup แล้ว Refresh ตาราง
    this.isPopupVisible = false;
    this.fetchProducts();
  }

  public onProductPopupHidden(): void {
    this.productForm = new ProductForm();
  }

  // ======================================
  // Popup: ลบ
  // ======================================
  public onDelete(rowData: ProductList): void {
    this.productToDelete = rowData;
    this.showDeletePopup = true;
  }

  public confirmDelete(): void {
    if (!this.productToDelete) return;
    // TODO: เรียก API Delete ด้วย this.productToDelete.productId
    console.log('ลบสินค้า:', this.productToDelete);
    this.productToDelete = null;
    this.showDeletePopup = false;
    this.fetchProducts();
  }

  public onDeletePopupHidden(): void {
    this.productToDelete = null;
  }

  public onRowClick(rowData: any): void {
    console.log('คลิกแถว:', rowData);
  }
}
