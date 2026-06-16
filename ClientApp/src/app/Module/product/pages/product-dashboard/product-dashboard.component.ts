import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin, lastValueFrom } from 'rxjs';
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
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomSelectBoxComponent } from '../../../Shared/components/custom-select-box/custom-select-box.component';
import { ProductService } from '../../service/product.service';
import { LoadingService } from '../../../Shared/services/loading.service';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import notify from 'devextreme/ui/notify';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data';

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
  // ตัวเลือก Category & Status
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


  public gridDataSource!: DataSource;

  // ======================================
  // Popup & Form
  // ======================================
  public isPopupVisible: boolean = false;
  public popupMode: 'ADD' | 'EDIT' = 'ADD';
  public productForm: ProductForm = new ProductForm();
  // ======================================
  // Column & Action
  // ======================================
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<unknown>;
  @ViewChild('categoryNamesTemplate', { static: true }) categoryNamesTemplate!: TemplateRef<unknown>;
  @ViewChild('dataGrid') dataGrid?: CustomDataGridComponent;
  public columns: ColumnConfig[] = [];

  public actionButtons: ActionButton[] = [
    {
      text: '',
      icon: 'edit',
      type: 'default',
      stylingMode: 'text',
      onClick: (rowData) => this.onEdit(rowData as ProductList),
    },
  ];

  // ======================================
  // Lifecycle Hooks
  // ======================================
  ngOnInit(): void {
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
        allowSorting: false, 
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
      
        this.buildDataSource();
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  // ======================================
  // Popup Buttons
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

  // ======================================
  // Helper: แปลง API Response → ProductList
  // ======================================
  private mapToProductList(res: ProductSearchResponseModel): ProductList {
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
      categoryNames,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    };
  }

  // ======================================
  // สร้าง CustomStore
  // ======================================
  private buildDataSource(): void {
    this.gridDataSource = new DataSource({
      store: new CustomStore({
        key: 'productId',
        load: (loadOptions: LoadOptions) => {
          const request: ProductSearchRequestModel = {
            loadOptions:      loadOptions,
            keyword:          this.searchKeyword || null,
            filterActive:     this.filterActive,
            filterInactive:   this.filterInactive,
            categoryIds:      this.selectedCategories.length > 0
                                ? this.selectedCategories.map(Number)
                                : null,
          };

          return lastValueFrom(this.productService.searchProducts(request))
            .then((res) => ({
              data:       res.data.map((p) => this.mapToProductList(p)),
              totalCount: res.totalCount,
            }));
        },
      })
    });

    setTimeout(() => {
      this.dataGrid?.setDataSource(this.gridDataSource);
    });
  }

  // ======================================
  // Filter — เรียก refresh() เพื่อให้กริด
  // ยิง load() ใหม่พร้อม LoadOptions ปัจจุบัน
  // ======================================
  public applyFilters(): void {
    this.dataGrid?.reload();
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
      productId:          rowData.productId,
      productName:        rowData.productName,
      price:              rowData.price,
      quantity:           rowData.quantity,
      detail:             rowData.detail,
      statusProductCode:  rowData.statusProductCode,
      imagePath:          rowData.imagePath,
      categoryId:         [...rowData.categoryId],
      updatedAt:          rowData.updatedAt,
    };
    setTimeout(() => {
      this.isPopupVisible = true;
    });
  }

  public saveProduct(): void {
    this.productState.clearAllError();

    // ถ้า ADD → productId = null → Backend จะ Create
    // ถ้า EDIT → productId = ตัวเลข → Backend จะ Update
    const payload: ProductForm = {
      productId:          this.popupMode === 'ADD' ? null : Number(this.productForm.productId),
      productName:        this.productForm.productName,
      price:              Number(this.productForm.price),
      detail:             this.productForm.detail || '',
      quantity:           Number(this.productForm.quantity),
      imagePath:          this.productForm.imagePath || '',
      statusProductCode:  this.productForm.statusProductCode,
      categoryId:         this.productForm.categoryId.map(Number),
      updatedAt:          this.productForm.updatedAt,
    };

    this.productService.upsertProduct(payload, this.productState).subscribe({
      next: () => {
        const msg = this.popupMode === 'ADD' ? 'เพิ่มสินค้าสำเร็จ' : 'แก้ไขสินค้าสำเร็จ';
        notify({ message: msg, type: 'success', displayTime: 2500 });
        setTimeout(() => {
          this.isPopupVisible = false;
          this.dataGrid?.reload();
        });
      },
      error: (err) => {
        console.error('Upsert Error:', err);
      },
    });
  }
  public onProductPopupHidden(): void {
    this.productForm = new ProductForm();
    this.productState.clearAllError();
  }
}
