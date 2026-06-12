import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  ActionButton,
  ColumnConfig,
  PopupButton,
  valueOption,
} from '../../../Shared/models/typecustom.model';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import {
  ProductForm,
  ProductList,
  ProductSearchRequestModel,
  ProductSearchResponseModel,
} from '../../models/product.model';
import { CustomCheckboxComponent } from '../../../Shared/components/custom-checkbox/custom-checkbox.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomSelectBoxComponent } from '../../../Shared/components/custom-select-box/custom-select-box.component';
import { ProductService } from '../../service/product.service';
import { LoadingService } from '../../../Shared/services/loading.service';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import notify from 'devextreme/ui/notify';

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
    CustomSelectBoxComponent,
  ],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss',
})
export class ProductDashboardComponent implements OnInit {
  public loadingService = inject(LoadingService);
  public productState = new ErrorEditorState();
  constructor(private productService: ProductService) {}

  // ======================================
  // ตัวเลือก Category — key เป็น string ตาม valueOption interface
  // ======================================
  public categoryOptions: valueOption[] = [];

  public statusOptions: valueOption[] = [];

  // ======================================
  // ตัวแปรค้นหา / Filter
  // ======================================
  public searchKeyword: string = '';
  public filterActive: boolean = false;
  public filterInactive: boolean = false;
  public selectedCategories: string[] = []; // TagBox ส่ง string[]

  // ======================================
  // ข้อมูลตาราง
  // ======================================
  public filteredProducts: ProductList[] = [];
  public totalCount: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;

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
  @ViewChild('categoryNamesTemplate', { static: true }) categoryNamesTemplate!: TemplateRef<any>;
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
    // ตั้งค่า Columns เลยตั้งแต่แรก เนื่องจาก ViewChild มี { static: true }
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
        cellTemplate: this.categoryNamesTemplate,
      },
      {
        dataField: 'statusProductCode',
        caption: 'สถานะ',
        alignment: 'center',
        width: 120,
        cellTemplate: this.statusTemplate,
      },
    ];

    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin({
      categories: this.productService.getCategories(),
      statusProducts: this.productService.getStatusProducts(),
    }).subscribe({
      next: (res) => {
        this.categoryOptions = res.categories || [];
        this.statusOptions = res.statusProducts || [];

        this.fetchProducts();
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
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
        onClick: () => {
          this.confirmDelete();
        },
      },
    ];
  }

  // ======================================
  // Helper: แปลง API Response → ProductList
  // ======================================
  private mapToProductList(res: ProductSearchResponseModel): ProductList {
    // ดักจับกรณีที่ res.categoryId เป็น null หรือ undefined
    const categoryIds = res.categoryId || [];

    const categoryNames: string[] = categoryIds.map((id) => {
      const option = this.categoryOptions.find((opt) => Number(opt.key) === Number(id));
      return option ? option.value : String(id);
    });

    return {
      productId: res.productId,
      productName: res.productName,
      price: res.price,
      detail: res.detail,
      quantity: res.quantity,
      imagePath: res.imagePath,
      statusProductCode: res.statusProductCode,
      categoryId: categoryIds,
      categoryNames: categoryNames,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    };
  }

  // ======================================
  // API: ดึงข้อมูลสินค้า
  // ======================================
  private fetchProducts(): void {
    const request: ProductSearchRequestModel = {
      keyword: this.searchKeyword || null,
      filterActive: this.filterActive,
      filterInactive: this.filterInactive,
      categoryIds: this.selectedCategories.length > 0 ? this.selectedCategories.map(Number) : null,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
    };

    this.productService.searchProducts(request).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        const items = (res as any).Item || res.item || [];
        this.totalCount = res.totalCount || (res as any).TotalCount || 0;
        this.filteredProducts = items.map((p: any) => this.mapToProductList(p));
      },
      error: (err) => {
        console.error('API Error:', err);
        this.filteredProducts = [];
      },
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
    setTimeout(() => {
      this.isPopupVisible = true;
    });
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
      categoryId: [...rowData.categoryId],
      updatedAt: rowData.updatedAt,
    };
    setTimeout(() => {
      this.isPopupVisible = true;
    });
  }

  public saveProduct(): void {
    this.productState.clearAllError();

    const payload = {
      productId: Number(this.productForm.productId), // แปลงเป็น Number ป้องกัน ASP.NET binding error
      productName: this.productForm.productName,
      price: Number(this.productForm.price),
      detail: this.productForm.detail || '',
      quantity: Number(this.productForm.quantity),
      imagePath: this.productForm.imagePath || '',
      statusProductCode: this.productForm.statusProductCode,
      categoryId: this.productForm.categoryId.map(Number),
      updateAt: this.productForm.updatedAt, // ส่งให้ตรงกับ property UpdateAt ใน C#
    };

    if (this.popupMode === 'ADD') {
      this.productService.createProduct(payload, this.productState).subscribe({
        next: (res) => {
          this.isPopupVisible = false;
          this.fetchProducts();
        },
        error: (err) => {
          console.error('API Error:', err);
        },
      });
    } else if (this.popupMode === 'EDIT') {
      this.productState.clearAllError();
      this.productService.updateProduct(payload, this.productState).subscribe({
        next: (res) => {
          notify({ message: 'แก้ไขสินค้าสำเร็จ', type: 'success', displayTime: 2500 });
          this.isPopupVisible = false;
          this.fetchProducts();
        },
        error: (err) => {
          console.error('API Error:', err);
        },
      });
    }
  }

  public onProductPopupHidden(): void {
    this.productForm = new ProductForm();
    this.productState.clearAllError();
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
