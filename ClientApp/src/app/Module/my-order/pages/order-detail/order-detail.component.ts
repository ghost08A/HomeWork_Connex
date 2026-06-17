import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { CustomSelectBoxComponent } from '../../../Shared/components/custom-select-box/custom-select-box.component';
import { ActionButton, ColumnConfig, PopupButton, valueOption }
  from '../../../Shared/models/typecustom.model';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import {  OrderDetailTemp, ProductDetail, ProductOrderForm }
  from '../../models/order.model';
import { MyOrderService } from '../../service/my-order.service';
import { LoadingService } from '../../../Shared/services/loading.service';
import { TagComponent } from '../../../Shared/components/tag/tag.component';

@Component({
  selector: 'order-detail',
  standalone: true,
  imports: [
    CommonModule,
    CustomButtonComponent,
    CustomPopupComponent,
    CustomInputComponent,
    CustomSelectBoxComponent,
    CustomDataGridComponent,
    TagComponent,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  public loadingService = inject(LoadingService);
  public orderState = new ErrorEditorState();

  // โหมดหน้า
  public isEditMode: boolean = false;
  public currentOrderId: string | null = null;

  @ViewChild('categoryNamesTemplate', { static: true }) categoryNamesTemplate!: TemplateRef<unknown>;

  constructor(
    private route: ActivatedRoute,
    private myOrderService: MyOrderService,
  ) {}

  // ======================================
  // Options
  // ======================================
  public productOptions: valueOption[] = [];

  get availableProductOptions(): valueOption[] {
    // รหัสสินค้าที่ถูกเลือกไปแล้วในตาราง
    const selectedProductIds = this.orderDetails.map(d => d.productId);
    
    return this.productOptions.filter(opt => {
      const productId = Number(opt.key);
      
      // ถ้ากำลังอยู่ในโหมด EDIT ให้เว้น product เดิมที่กำลังแก้ไว้ให้ยังเลือกได้
      if (this.popupMode === 'EDIT' && this.productOrderForm.productId === productId) {
        return true;
      }
      
      // ถ้าไม่ได้ถูกเลือกไปแล้วก็ให้แสดง
      return !selectedProductIds.includes(productId);
    });
  }

  // ======================================
  // orderDetails — array หลักที่เก็บรายการสินค้าในออเดอร์นี้
  // เริ่มต้นเปล่า ถ้า ADD
  // โหลดจาก API ถ้า EDIT (มี orderId)
  // ======================================
  public orderDetails: OrderDetailTemp[] = [];

  // sequence ถัดไป — คำนวณจาก array ปัจจุบัน
  // ใช้ตอนเพิ่มแถวใหม่
  private get nextSequence(): number {
    if (this.orderDetails.length === 0) return 1;
    return Math.max(...this.orderDetails.map(d => d.sequence)) + 1;
  }

  // ======================================
  // Popup & Form
  // ======================================
  public isPopupVisible: boolean = false;
  public popupMode: 'ADD' | 'EDIT' = 'ADD';
  public productOrderForm: ProductOrderForm = new ProductOrderForm();

  // เก็บ productId ที่กำลังแก้ไขอยู่
  // null = กำลัง ADD อยู่
  private editingProductId: number | null = null;

  // ข้อมูล product ที่โหลดมาโชว์ใน popup
  public selectedProductDetail: ProductDetail | null = null;
  public isLoadingProduct: boolean = false;

  // ======================================
  // Grid Columns
  // ======================================
  public columns: ColumnConfig[] = [];

  public actionButtons: ActionButton[] = [
    {
      text: '', icon: 'edit', type: 'default', stylingMode: 'text',
      onClick: (rowData) => this.onEditProductOrder(rowData),
    },
    {
      text: '', icon: 'return', type: 'normal', stylingMode: 'text',
      onClick: (rowData) => {},
    },
    {
      text: '', icon: 'trash', type: 'danger', stylingMode: 'text',
      onClick: (rowData) => this.onDeleteProductOrder(rowData),
    },
  ];

  // ======================================
  // Lifecycle
  // ======================================
  ngOnInit(): void {
    this.columns = [
    { dataField: 'sequence',              caption: 'ลำดับ',         dataType: 'number', alignment: 'center', width: 80 },
    { dataField: 'productName',           caption: 'ชื่อสินค้า',    alignment: 'left' },
    { dataField: 'description',           caption: 'รายละเอียด',    alignment: 'left', width: 200 },
    { dataField: 'categoryNames',         caption: 'ประเภทสินค้า',  alignment: 'left', cellTemplate: this.categoryNamesTemplate },
    { dataField: 'quantity',              caption: 'จำนวน',          alignment: 'center', width: 80 },
    { dataField: 'statusOrderDetailCode', caption: 'สถานะ',          alignment: 'center', width: 120 },
    { dataField: 'remark',                caption: 'หมายเหตุ',       alignment: 'left', width: 200 },
    ]
    this.route.queryParams.subscribe((params) => {
      if (params['orderId']) {
        // โหมดแก้ไข — มี orderId มา
        this.isEditMode = true;
        this.currentOrderId = params['orderId'];
        this.loadOrderData(this.currentOrderId!);
      } else {
        // โหมดเพิ่ม — เริ่มจาก array เปล่า
        this.isEditMode = false;
        this.orderDetails = [];
      }
      this.loadInitialData();
    });
  }

  private loadOrderData(id: string): void {
    // TODO: เรียก API getOrderById แล้วเอา products มาใส่ orderDetails
    // this.myOrderService.getOrderById(id).subscribe({
    //   next: (res) => {
    //     this.orderDetails = res.products.map((p, index) => ({
    //       orderDetailId: p.productId,
    //       sequence: index + 1,
    //       productId: p.productId,
    //       productName: p.productName,
    //       description: '',
    //       categoryNames: [],
    //       quantity: p.quantity,
    //       statusOrderDetailCode: p.status,
    //       remark: null,
    //       returnedQuantity: 0,
    //       returnedAt: null,
    //       returnRemark: null,
    //     }));
    //   }
    // });
  }

  private loadInitialData(): void {
    this.myOrderService.getProductOptions().subscribe({
      next: (res) => {
        this.productOptions = res || [];
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
        onClick: () => { this.isPopupVisible = false; },
      },
      {
        text: 'บันทึก',
        type: 'success',
        stylingMode: 'contained',
        icon: 'save',
        disabled: !this.selectedProductDetail || this.isLoadingProduct,
        onClick: () => { this.saveProductOrder(); },
      },
    ];
  }

  // ======================================
  // เปิด Popup ADD
  // ======================================
  public onAddNewProductOrder(): void {
    this.popupMode = 'ADD';
    this.editingProductId = null;       // ไม่มี id = ADD
    this.productOrderForm = new ProductOrderForm();
    this.selectedProductDetail = null;

    setTimeout(() => {
      this.isPopupVisible = true;
    });
  }

  // ======================================
  // เปิด Popup EDIT
  // ======================================
  public onEditProductOrder(rowData: OrderDetailTemp): void {
    this.popupMode = 'EDIT';
    this.editingProductId = rowData.productId; // จำไว้ว่าแก้แถวไหน โดยใช้ productId เพราะไม่ซ้ำกันแน่นอน

    // ใส่ค่าเดิมลง form
    this.productOrderForm = {
      productId: rowData.productId,
      quantity:  rowData.quantity,
    };

    // โหลดข้อมูล product มาโชว์
    this.loadProductDetail(rowData.productId);

    setTimeout(() => {
      this.isPopupVisible = true;
    });
  }

  // ======================================
  // ลบแถวออกจาก array
  // ======================================
  public onDeleteProductOrder(rowData: OrderDetailTemp): void {
    // กรองแถวโดยใช้ productId เพราะสินค้าในออเดอร์ห้ามซ้ำกันอยู่แล้ว
    this.orderDetails = this.orderDetails
      .filter(d => d.productId !== rowData.productId);

    // คำนวณ sequence ใหม่ให้ต่อเนื่อง
    this.orderDetails = this.orderDetails.map((d, index) => ({
      ...d,
      sequence: index + 1,
    }));
  }

  // ======================================
  // dropdown เปลี่ยน → โหลด product detail
  // ======================================
  public onProductSelected(productId: number | string | null): void {
    if (!productId) {
      this.selectedProductDetail = null;
      return;
    }
    this.loadProductDetail(Number(productId));
  }

  private loadProductDetail(productId: number): void {
    this.isLoadingProduct = true;
    this.selectedProductDetail = null;

    this.myOrderService.getProductById(productId).subscribe({
      next: (res) => {
        this.selectedProductDetail = res;
        this.isLoadingProduct = false;
      },
      error: () => {
        this.isLoadingProduct = false;
      },
    });
  }

  // ======================================
  // บันทึก — ADD หรือ EDIT ใน array
  // ======================================
  private saveProductOrder(): void {
    if (!this.selectedProductDetail || !this.productOrderForm.quantity) return;

    if (this.popupMode === 'ADD') {

      // สร้าง record ใหม่จากข้อมูล product ที่โหลดมา + จำนวนที่กรอก
      const newDetail: OrderDetailTemp = {
        orderDetailId:         null,  
        sequence:              this.nextSequence,
        productId:             this.selectedProductDetail.productId,
        productName:           this.selectedProductDetail.productName,
        description:           this.selectedProductDetail.description,
        categoryNames:         this.selectedProductDetail.categoryNames,
        quantity:              this.productOrderForm.quantity,
        statusOrderDetailCode: 'DRAFT',    
        remark:                null,
        returnedQuantity:      0,
        returnedAt:            null,
        returnRemark:          null,
      };

      // เพิ่มเข้า array — grid จะ re-render อัตโนมัติ
      this.orderDetails = [...this.orderDetails, newDetail];

    } else {

      // แก้ไขแถวที่ตรงกับ editingProductId
      this.orderDetails = this.orderDetails.map(d => {
        if (d.productId !== this.editingProductId) return d;

        // อัปเดตเฉพาะ field ที่แก้ได้
        return {
          ...d,
          productId:     this.selectedProductDetail!.productId,
          productName:   this.selectedProductDetail!.productName,
          description:   this.selectedProductDetail!.description,
          categoryNames: this.selectedProductDetail!.categoryNames,
          quantity:      this.productOrderForm.quantity!,
        };
      });

    }

    this.isPopupVisible = false;
  }

  // ======================================
  // Reset เมื่อ popup ปิดสนิท
  // ======================================
  public onPopupHidden(): void {
    this.productOrderForm = new ProductOrderForm();
    this.selectedProductDetail = null;
    this.isLoadingProduct = false;
    this.editingProductId = null;
    this.orderState.clearAllError();
  }

  // ======================================
  // ปุ่ม Save Order ทั้งหมด
  // ======================================
  public onSaveDraft(): void {
    // ส่ง orderDetails ทั้ง array ไป API แบบ DRAFT
    console.log('Save Draft:', this.orderDetails);
  }

  public onSave(): void {
    // ส่ง orderDetails ทั้ง array ไป API แบบ Submit
    console.log('Save:', this.orderDetails);
  }

  public onCancel(): void {
    // กลับหน้าก่อน หรือ clear array
    this.orderDetails = [];
  }

  public canExpandDetailRow = (rowData: OrderDetailTemp): boolean => {
    return rowData.returnedQuantity > 0;
  };

}