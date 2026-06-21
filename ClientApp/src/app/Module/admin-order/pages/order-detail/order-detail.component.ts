import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomPopupComponent } from '../../../Shared/components/custom-popup/custom-popup.component';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import { ActionButton, ColumnConfig, PopupButton } from '../../../Shared/models/typecustom.model';
import { ErrorEditorState } from '../../../Shared/directives/validate-error.directive';
import {
  OrderActionStatus,
  OrderDetail,
  ProductDetail,
  ProductOrderForm,
  UpsertOrderPayload,
} from '../../../Shared/models/orderDetail.model';
import { AdminOrderService } from '../../service/admin-order.service'; // เปลี่ยนเป็น Service ของ Admin
import { LoadingService } from '../../../Shared/services/loading.service';
import { TagComponent } from '../../../Shared/components/tag/tag.component';
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

  public currentOrderId: string | null = null;
  public currentOrder: UpsertOrderPayload = new UpsertOrderPayload();

  @ViewChild('categoryNamesTemplate', { static: true })
  categoryNamesTemplate!: TemplateRef<unknown>;
  @ViewChild('itemStatusTemplate', { static: true }) itemStatusTemplate!: TemplateRef<unknown>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminOrderService: AdminOrderService,
  ) {}

  public orderDetails: OrderDetail[] = [];
  // 🌟 1. เก็บตัวต้นฉบับไว้ (Deep Copy) เพื่อใช้ตอนกด REJECT ORDER
  public originalOrderDetails: OrderDetail[] = [];

  // ======================================
  // Popup & Form (สำหรับการแก้ไข Item)
  // ======================================
  public isPopupVisible: boolean = false;
  // เพิ่ม remark ใน form (ถ้าใน model คุณไม่มี ให้เติม string เข้าไปด้วย)
  public productOrderForm: ProductOrderForm & { remark?: string } = new ProductOrderForm();
  public selectedProductDetail: ProductDetail | null = null;
  public isLoadingProduct: boolean = false;
  private editingProductId: number | null = null;

  // ======================================
  // Grid Columns & Actions
  // ======================================
  public columns: ColumnConfig[] = [];

  public isRejectPopupVisible = false;
  public rejectRemark = '';
  public rejectingProductId: number | null = null;

  // 🌟 2. ปุ่ม Action ในตาราง 3 ปุ่ม
  public actionButtons: ActionButton[] = [
    {
      text: '',
      icon: 'edit',
      type: 'default',
      stylingMode: 'text',
      // ปิดปุ่มแก้ถ้าออเดอร์ไม่อนุญาตให้แก้แล้ว
      disabled: () =>
        this.currentOrder.statusOrders === orderStatus.APPROVED ||
        this.currentOrder.statusOrders === orderStatus.PENDING ||
        this.currentOrder.statusOrders === orderStatus.REJECTED,
      onClick: (rowData) => this.onEditProductOrder(rowData),
    },
    {
      text: '',
      icon: 'close',
      type: 'danger',
      stylingMode: 'text',
      // ปุ่ม REJECT Item
      disabled: (rowData) =>
        rowData.statusOrderDetailCode === orderDetailStatus.REJECTED ||
        this.currentOrder.statusOrders === orderStatus.APPROVED,
      onClick: (rowData) => this.openRejectPopup(rowData),
    },
    {
      text: '',
      icon: 'check',
      type: 'success',
      stylingMode: 'text',
      // ปุ่ม APPROVE Item (เผื่อเปลี่ยนใจจากที่เคยกด Reject ไว้)
      disabled: (rowData) =>
        rowData.statusOrderDetailCode === orderDetailStatus.APPROVED ||
        this.currentOrder.statusOrders === orderStatus.APPROVED,
      onClick: (rowData) => this.onChangeItemStatus(rowData, orderDetailStatus.APPROVED),
    },
  ];

  ngOnInit(): void {
    this.columns = [
      {
        dataField: 'sequence',
        caption: 'ลำดับ',
        dataType: 'number',
        alignment: 'center',
        width: 80,
      },
      { dataField: 'productName', caption: 'ชื่อสินค้า', alignment: 'left' },
      {
        dataField: 'categoryNames',
        caption: 'ประเภทสินค้า',
        alignment: 'left',
        cellTemplate: this.categoryNamesTemplate,
      },
      { dataField: 'quantity', caption: 'จำนวน', alignment: 'center', width: 80 },
      {
        dataField: 'statusOrderDetailCode',
        caption: 'สถานะรายการ',
        alignment: 'center',
        cellTemplate: this.itemStatusTemplate,
        width: 140,
      },
      { dataField: 'remark', caption: 'หมายเหตุแอดมิน', alignment: 'left', width: 200 },
    ];

    this.route.queryParams.subscribe((params) => {
      if (params['orderId']) {
        this.currentOrderId = params['orderId'];
        this.loadOrderData(this.currentOrderId!);
      }
    });
  }

  private loadOrderData(id: string): void {
    this.adminOrderService.getOrderById(id).subscribe({
      next: (res) => {
        this.currentOrder.orderId = res.orderId;
        this.currentOrder.statusOrders = res.statusOrders;
        this.currentOrder.updatedAt = res.updatedAt;

        this.orderDetails = res.orderDetails;
        // 🌟 จำค่า Original ไว้ เผื่อแอดมินกด REJECT ORDER จะได้ส่งค่านี้กลับไป
        this.originalOrderDetails = JSON.parse(JSON.stringify(res.orderDetails));
      },
    });
  }

  // ======================================
  // การจัดการระดับ Item (ในตาราง)
  // ======================================
  public canExpandDetailRow(rowData: any): boolean {
    return rowData.returnedQuantity > 0;
  }

  public onChangeItemStatus(rowData: OrderDetail, status: orderDetailStatus): void {
    const targetIndex = this.orderDetails.findIndex((x) => x.productId === rowData.productId);
    if (targetIndex !== -1) {
      this.orderDetails[targetIndex].statusOrderDetailCode = status;
      notify(
        `เปลี่ยนสถานะรายการเป็น ${status} แล้ว`,
        status === orderDetailStatus.APPROVED ? 'success' : 'warning',
        2000,
      );
    }
  }

  public onEditProductOrder(rowData: OrderDetail): void {
    this.editingProductId = rowData.productId;
    this.productOrderForm = {
      productId: rowData.productId,
      quantity: rowData.quantity,
      remark: rowData.remark || '',
    };
    this.loadProductDetail(rowData.productId);

    setTimeout(() => {
      this.isPopupVisible = true;
    });
  }

  private loadProductDetail(productId: number): void {
    this.isLoadingProduct = true;
    this.adminOrderService.getProductById(productId).subscribe({
      next: (res) => {
        this.selectedProductDetail = res;
        this.isLoadingProduct = false;
      },
      error: () => {
        this.isLoadingProduct = false;
      },
    });
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
        text: 'บันทึกการแก้ไข',
        type: 'success',
        stylingMode: 'contained',
        icon: 'save',
        disabled: !this.selectedProductDetail || this.isLoadingProduct,
        onClick: () => {
          this.saveItemEdit();
        },
      },
    ];
  }

  private saveItemEdit(): void {
    this.orderState.clearAllError();
    // 🌟 3. บังคับใส่ Remark และเช็ค Stock
    if (!this.productOrderForm.remark || this.productOrderForm.remark.trim() === '') {
      this.orderState.setError('remark', 'แอดมินจำเป็นต้องระบุเหตุผลในการแก้ไขจำนวน');
    }
    if (!this.productOrderForm.quantity || this.productOrderForm.quantity <= 0) {
      this.orderState.setError('quantity', 'จำนวนต้องมากกว่า 0');
    } else if (
      this.selectedProductDetail &&
      this.productOrderForm.quantity > this.selectedProductDetail.quantity
    ) {
      this.orderState.setError('quantity', 'จำนวนที่ระบุเกินกว่าสต็อกที่มีอยู่');
    }

    if (this.orderState.hasError('remark') || this.orderState.hasError('quantity')) return;

    this.orderDetails = this.orderDetails.map((d) => {
      if (d.productId !== this.editingProductId) return d;
      return {
        ...d,
        quantity: this.productOrderForm.quantity!,
        remark: this.productOrderForm.remark!,
      };
    });

    notify('แก้ไขข้อมูลรายการแล้ว', 'success', 2000);
    this.isPopupVisible = false;
  }

  public onPopupHidden(): void {
    this.productOrderForm = new ProductOrderForm();
    this.selectedProductDetail = null;
    this.orderState.clearAllError();
  }

  // ======================================
  // การจัดการ Reject Popup
  // ======================================
  public openRejectPopup(rowData: OrderDetail | null): void {
    this.rejectingProductId = rowData ? rowData.productId : null;
    this.rejectRemark = '';
    this.orderState.clearAllError();
    this.isRejectPopupVisible = true;
  }

  get rejectPopupButtons(): PopupButton[] {
    return [
      {
        text: 'ยกเลิก',
        type: 'normal',
        stylingMode: 'outlined',
        onClick: () => {
          this.isRejectPopupVisible = false;
        },
      },
      {
        text: 'ยืนยัน',
        type: 'danger',
        stylingMode: 'contained',
        onClick: () => {
          this.confirmRejectItem();
        },
      },
    ];
  }

  private confirmRejectItem(): void {
    this.orderState.clearAllError();
    if (!this.rejectRemark || this.rejectRemark.trim() === '') {
      this.orderState.setError('rejectRemark', 'แอดมินจำเป็นต้องระบุเหตุผลที่ไม่อนุมัติ');
      return;
    }

    if (this.rejectingProductId === null) {
      // Reject Both Order
      this.isRejectPopupVisible = false;
      this.processRejectWholeOrder();
    } else {
      // Reject Specific Item
      const targetIndex = this.orderDetails.findIndex((x) => x.productId === this.rejectingProductId);
      if (targetIndex !== -1) {
        this.orderDetails[targetIndex].statusOrderDetailCode = orderDetailStatus.REJECTED;
        this.orderDetails[targetIndex].remark = this.rejectRemark;
        notify('เปลี่ยนสถานะรายการเป็น REJECTED และระบุเหตุผลแล้ว', 'warning', 2000);
      }
      this.isRejectPopupVisible = false;
    }
  }

  public onRejectPopupHidden(): void {
    this.rejectingProductId = null;
    this.rejectRemark = '';
    this.orderState.clearAllError();
  }

  // ======================================
  // การจัดการระดับออเดอร์ (ปุ่มด้านล่าง)
  // ======================================

  private processRejectWholeOrder(): void {
    // 🌟 5.2 ถ้า Admin กด REJECT ทั้งออเดอร์ ให้เปลี่ยนสถานะใน orderDetails ทุกตัวให้เป็น REJECTED
    // และเอาค่าเดิม(original) กลับมา พร้อมทั้งใส่ remark ตามที่แอดมินกรอก
    this.originalOrderDetails = this.originalOrderDetails.map((od) => {
      return {
        ...od,
        statusOrderDetailCode: orderDetailStatus.REJECTED,
        remark: this.rejectRemark
      };
    });
    
    // บันทึกออเดอร์ทันที โดยใช้ original data
    this.saveOrder(orderStatus.REJECTED, true);
  }

  public async onActionOrder(actionType: orderStatus.PENDING | orderStatus.APPROVED) {
    let confirmConfig: any = {};

    // 🌟 4. ตั้งค่าข้อความแจ้งเตือนแยกตามการกระทำ
    if (actionType === orderStatus.PENDING) {
      confirmConfig = {
        title: 'ส่งให้ผู้ใช้ยืนยัน (PENDING)?',
        message: 'ระบบจะส่งออเดอร์ที่ถูกแก้ไขให้ผู้ใช้งานยืนยันอีกครั้ง',
        confirmText: 'ส่ง PENDING',
        confirmType: 'warning',
      };
    } else if (actionType === orderStatus.APPROVED) {
      confirmConfig = {
        title: 'อนุมัติคำสั่งซื้อ?',
        message: 'ระบบจะอนุมัติออเดอร์ และตัดสต็อกตามข้อมูลที่แก้ไขล่าสุด',
        confirmText: 'อนุมัติ (APPROVE)',
        confirmType: 'success',
      };
    }

    const confirmed = await this.confirm.confirm({
      ...confirmConfig,
      icon: 'info',
      cancelText: 'ยกเลิก',
    });

    if (!confirmed) return;

    this.saveOrder(actionType, false);
  }

  private saveOrder(targetStatus: OrderActionStatus, useOriginalData: boolean): void {
    const dataSource = useOriginalData ? this.originalOrderDetails : this.orderDetails;

    const payload: UpsertOrderPayload = {
      orderId: this.currentOrder.orderId,
      updatedAt: this.currentOrder.updatedAt,
      statusOrders: targetStatus,
      orderDetails: dataSource.map((item, index) => ({
        orderDetailId: item.orderDetailId,
        sequence: item.sequence || index + 1,
        productId: item.productId,
        quantity: item.quantity,
        // ถ้าอนุมัติทั้งออเดอร์ และ Item ยังไม่มีสถานะ ก็จับเป็น APPROVED ให้หมด
        statusOrderDetailCode:
          targetStatus === orderStatus.APPROVED && !item.statusOrderDetailCode
            ? orderDetailStatus.APPROVED
            : item.statusOrderDetailCode,
        remark: item.remark,
        returnedQuantity: item.returnedQuantity,
        returnRemark: item.returnRemark,
      })),
    };

    this.adminOrderService.upsertOrder(payload).subscribe({
      next: () => {
        notify(`ดำเนินการออเดอร์สำเร็จ (${targetStatus})`, 'success', 3000);
        this.router.navigate(['/admin-order/order-admin-dashboard']);
      },
    });
  }

  async onCancel() {
    this.router.navigate(['/admin-order/order-admin-dashboard']);
  }

}
