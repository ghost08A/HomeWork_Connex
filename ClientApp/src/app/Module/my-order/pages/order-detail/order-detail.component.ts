import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
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
import {  OrderActionStatus, OrderDetail, ProductDetail, ProductOrderForm, ReturnFormData, UpsertOrderPayload } from '../../../Shared/models/orderDetail.model';
import { MyOrderService } from '../../service/my-order.service';
import { LoadingService } from '../../../Shared/services/loading.service';
import { TagComponent } from '../../../Shared/components/tag/tag.component';
import { Router } from '@angular/router';
import { ConfirmDialogService } from '../../../Shared/services/confirm-dialog.service';
import notify from 'devextreme/ui/notify';
import { orderDetailStatus, orderDetailStatusLabel, orderStatus, orderStatusLabel } from '../../../Shared/enum/AllStatus';

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
  private confirm = inject(ConfirmDialogService);
  public orderStatus = orderStatus;
  public orderDetailStatus = orderDetailStatus;
  public orderStatusLabel: Record<string, string> = orderStatusLabel;
  public orderDetailStatusLabel: Record<string, string> = orderDetailStatusLabel;

  public orderState = new ErrorEditorState();

  // โหมดหน้า
  public isEditMode: boolean = false;
  public currentOrderId: string | null = null;
  public currentOrder: UpsertOrderPayload  = new UpsertOrderPayload();

  @ViewChild('categoryNamesTemplate', { static: true }) categoryNamesTemplate!: TemplateRef<unknown>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  public orderDetails: OrderDetail[] = [];

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

  public isReturnPopupVisible: boolean = false;
  public returnFormData:ReturnFormData = {
    productId: 0,
    productName: '',
    maxQuantity: 0,
    returnedQuantity: 0,
    returnRemark: ''
  };

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
      disabled: () => this.currentOrder.statusOrders === orderStatus.APPROVED || this.currentOrder.statusOrders === orderStatus.REJECTED || this.currentOrder.statusOrders === orderStatus.WAITAPPROVE || this.currentOrder.statusOrders === orderStatus.PENDING,
      onClick: (rowData) => this.onEditProductOrder(rowData),
    },
    {
      text: '', icon: 'return', type: 'normal', stylingMode: 'text',
      disabled: () => this.currentOrder.statusOrders !== orderStatus.APPROVED,
      onClick: (rowData) => this.openReturnPopup(rowData),
    },
    {
      text: '', icon: 'trash', type: 'danger', stylingMode: 'text',
      disabled: () => this.currentOrder.statusOrders === orderStatus.APPROVED || this.currentOrder.statusOrders === orderStatus.REJECTED || this.currentOrder.statusOrders === orderStatus.WAITAPPROVE || this.currentOrder.statusOrders === orderStatus.PENDING,
      onClick: (rowData) => this.onDeleteRow(rowData),
    },
  ];

  @ViewChild('itemStatusTemplate', { static: true }) itemStatusTemplate!: TemplateRef<any>;

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
      { dataField: 'statusOrderDetailCode', caption: 'สถานะ',          alignment: 'center', cellTemplate: this.itemStatusTemplate, width: 140 },
      { dataField: 'remark',                caption: 'หมายเหตุ',       alignment: 'left', width: 200 },
    ];
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
    this.myOrderService.getOrderById(id).subscribe({
      next: (res) => {
        // Map response to component variables
        this.currentOrder.orderId = res.orderId;
        this.currentOrder.statusOrders = res.statusOrders;
        this.currentOrder.updatedAt = res.updatedAt;
        
        // Map orderDetails to grid format
        this.orderDetails = res.orderDetails.map(od => ({
          orderDetailId: od.orderDetailId,
          sequence: od.sequence,
          productId: od.productId,
          productName: od.productName,
          description: od.description,
          categoryNames: od.categoryNames,
          quantity: od.quantity,
          statusOrderDetailCode: od.statusOrderDetailCode,
          remark: od.remark,
          returnedQuantity: od.returnedQuantity,
          returnedAt: od.returnedAt,
          returnRemark: od.returnRemark
        }));
        
      },
    });
  }

  private loadInitialData(): void {
    this.myOrderService.getProductOptions(true).subscribe({
      next: (res) => {
        this.productOptions = res || [];
      },
    });
  }

  // ======================================
  // Popup Buttons
  // ======================================

  get returnPopupButtons(): PopupButton[] {
    return [
        {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => { this.isReturnPopupVisible = false; },
      },
      {
        text: 'บันทึก',
        type: 'success',
        stylingMode: 'contained',
        onClick: () => this.confirmReturn(),
      }
    ]
  }

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
  public openReturnPopup(rowData: OrderDetail): void {
    this.orderState.clearAllError();
    this.returnFormData = {
      productId: rowData.productId,
      productName: rowData.productName,
      maxQuantity: rowData.quantity, // ล็อกจำนวนสูงสุดที่คืนได้
      returnedQuantity: rowData.returnedQuantity > 0 ? rowData.returnedQuantity : 1, 
      returnRemark: rowData.returnRemark || ''
    };
    
    this.isReturnPopupVisible = true;
  }

  // 2. ฟังก์ชันปิด Popup
  public closeReturnPopup(): void {
    this.isReturnPopupVisible = false;
  }

  // 3. ฟังก์ชันกดยืนยันการคืนสินค้า
  public confirmReturn(): void {
    this.orderState.clearAllError();
    let hasError = false;

    if (this.returnFormData.returnedQuantity <= 0) 
      this.orderState.setError('returnedQuantity', 'กรุณากรอกจำนวนที่ต้องการคืนอย่างน้อย 1 ชิ้น');
    if (this.returnFormData.returnedQuantity > this.returnFormData.maxQuantity) 
      this.orderState.setError('returnedQuantity', `ไม่สามารถคืนสินค้าเกิน ${this.returnFormData.maxQuantity} ชิ้นได้`);
    if (!this.returnFormData.returnRemark || this.returnFormData.returnRemark.trim() === '') 
      this.orderState.setError('returnRemark', 'กรุณาระบุเหตุผลที่คืนสินค้า');
    hasError = this.orderState.hasError('returnedQuantity') || this.orderState.hasError('returnRemark');
    if (hasError) return;

    const targetIndex = this.orderDetails.findIndex(x => x.productId === this.returnFormData.productId);
    
    if (targetIndex !== -1) {
      this.orderDetails = this.orderDetails.map((item, index) => index === targetIndex
        ? {
            ...item,
            returnedQuantity: this.returnFormData.returnedQuantity,
            returnRemark: this.returnFormData.returnRemark,
          }
        : item
      );
      notify('บันทึกข้อมูลการคืนสินค้าในตารางแล้ว (อย่าลืมกด SAVE เพื่อยืนยัน)', 'success', 3000);
    }
    this.closeReturnPopup();
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
  public onEditProductOrder(rowData: OrderDetail): void {
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
  public onDeleteProductOrder(rowData: OrderDetail): void {
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
      const newDetail: OrderDetail = {
        orderDetailId:         null,  
        sequence:              this.nextSequence,
        productId:             this.selectedProductDetail.productId,
        productName:           this.selectedProductDetail.productName,
        description:           this.selectedProductDetail.description,
        categoryNames:         this.selectedProductDetail.categoryNames,
        quantity:              this.productOrderForm.quantity,
        statusOrderDetailCode: null,    
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


  public async onSaveOrder(status: OrderActionStatus){
      const confirmed = await this.confirm.confirm({
      title: 'คุณต้องการบันทึกใช่หรือไม่?',
      message: 'บันทึกข้อมูลออเดอร์ของคุณ\nคุณสามารถกลับมาแก้ไขได้ในภายหลัง',
      icon: 'save',
      confirmText: 'ยืนยัน',  
      confirmType: 'success',
      cancelText: 'ยกเลิก(เปลี่ยนใจ)',
    });
    if (!confirmed) return;
     this.saveOrder(status);
  }

  private saveOrder(targetStatus: OrderActionStatus): void {
    this.orderState.clearAllError();
    const sortedDetails = [...this.orderDetails]
      .sort((a, b) => a.sequence - b.sequence);

    const payload: UpsertOrderPayload = {
      orderId: this.currentOrder.orderId,
      updatedAt: this.currentOrder.updatedAt,
      statusOrders: targetStatus ?? this.currentOrder.statusOrders ,
      orderDetails: sortedDetails.map((item, index) => {
          const isNewItem = item.orderDetailId !== null && item.orderDetailId < 0;
          const finalDetailId = isNewItem ? null : item.orderDetailId;
        return {
          orderDetailId: finalDetailId,
          sequence: index + 1,
          productId: item.productId,
          quantity: item.quantity,
          statusOrderDetailCode: item.statusOrderDetailCode,
          remark: item.remark,
          returnedQuantity: item.returnedQuantity,
          returnRemark: item.returnRemark,
        };
      })
    }
    console.log('Payload to save:', payload);
    this.myOrderService.upsertOrder(payload).subscribe({
      next: (res) => {
        this.currentOrderId = res.orderId;
        console.log('Order saved with ID:', res.orderId);
        this.router.navigate(['/my-order/order-dashboard']);
      }
    });
  }
//insert
  

  public canExpandDetailRow = (rowData: OrderDetail): boolean => {
    return rowData.returnedQuantity > 0;
  };

  public onCellPrepared(e: any): void {
    // 1. เช็คว่าเซลล์นี้อยู่ในแถวข้อมูล (ไม่ใช่หัวตาราง) และเป็นคอลัมน์ปุ่มขยาย (expand)
  if (e.rowType === 'data' && e.column.command === 'expand') {
    
    const rowData: OrderDetail = e.data;

  if (rowData.returnedQuantity <= 0) {
      
      // ล้าง HTML (ลบรูปลูกศรทิ้ง)
      e.cellElement.innerHTML = '';
      
      // ลบ Class ที่เป็นตัวควบคุมการทำงานของ DevExtreme ออก
      e.cellElement.classList.remove('dx-datagrid-expand'); 
      
      // ยกเลิกไม่ให้เม้าส์คลิกได้
      e.cellElement.style.pointerEvents = 'none'; 
    }
  }
  }

  async onDeleteRow(rowData: OrderDetail){
    const confirmed = await this.confirm.confirm({
      title: 'ยืนยันการลบ',
      message: 'คุณต้องการลบสินค้านี้ใช่หรือไม่?\nไม่สามารถกู้คืนได้',
      icon: 'delete',
      confirmText: 'ลบ',
      confirmType: 'danger',
    });
    if (!confirmed) return;
    this.onDeleteProductOrder(rowData);
  }

  async onCancel() {
     const confirmed = await this.confirm.confirm({
      title: 'ต้องการยกเลิกการใช่หรือไม่?',
      message: 'หากคุณยกเลิก\nข้อมูลที่กรอกจะไม่ถูกบันทึกและกลับไปหน้าออเดอร์ทั้งหมด',
      icon: 'delete',
      confirmText: 'ยืนยัน',  
      confirmType: 'danger',
      cancelText: 'ยกเลิก(เปลี่ยนใจ)',
    });
    if (!confirmed) return;
    this.router.navigate(['/my-order/order-dashboard']);
  }

  
}
