import { Component, Input, inject, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, lastValueFrom } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import { LoadOptions } from 'devextreme/data';

import { CustomInputComponent } from '../custom-input/custom-input.component';
import { CustomTagBoxComponent } from '../custom-tag-box/custom-tag-box.component';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { CustomCheckboxGroupComponent } from '../custom-checkbox-group/custom-checkbox-group.component';
import { CustomDataGridComponent } from '../custom-data-grid/custom-data-grid.component';
import { ActionButton, ColumnConfig, valueOption } from '../../models/typecustom.model';
import { LoadingService } from '../../services/loading.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { OrderDetail, OrderSearchRequestModel } from '../../models/order.model';
import { UpsertOrderPayload } from '../../models/orderDetail.model';

import { CommonModule } from '@angular/common';

import { MyOrderService } from '../../../my-order/service/my-order.service';
import { AdminOrderService } from '../../../admin-order/service/admin-order.service';

@Component({
  selector: 'shared-order-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CustomInputComponent,
    CustomTagBoxComponent,
    CustomButtonComponent,
    CustomCheckboxGroupComponent,
    CustomDataGridComponent,
  ],
  templateUrl: './shared-order-dashboard.component.html',
  styleUrl: './shared-order-dashboard.component.scss',
})
export class SharedOrderDashboardComponent implements OnInit, AfterViewInit {
  @Input() mode: 'USER' | 'ADMIN' = 'USER';

  public loadingService = inject(LoadingService);
  private confirm = inject(ConfirmDialogService);
  
  constructor(
    private router: Router,
    private myOrderService: MyOrderService,
    private adminOrderService: AdminOrderService
  ) {}

  public productOptions: valueOption[] = [];
  public statusOptions: valueOption[] = [];

  public searchKeyword: string = '';
  public selectedProducts: string[] = [];
  public selectedStatus: (string | number)[] = [];
  public startDate: Date | null = null;
  public endDate: Date | null = null;

  public gridDataSource!: DataSource;

  @ViewChild('dataGrid') dataGrid?: CustomDataGridComponent;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('masterStatusTemplate', { static: true }) masterStatusTemplate!: TemplateRef<any>;

  public masterColumns: ColumnConfig[] = [];
  public detailColumns: ColumnConfig[] = [];
  public actionButtons: ActionButton[] = [];

  // Getter สำหรับดึง service ตามโหมด
  private get activeService(): any {
    return this.mode === 'ADMIN' ? this.adminOrderService : this.myOrderService;
  }

  ngOnInit(): void {
    this.masterColumns = [
      { dataField: 'orderId', caption: 'รหัส', dataType: 'string', alignment: 'center', width: 120 },
      { dataField: 'productName', caption: 'ชื่อสินค้า', dataType: 'string', alignment: 'left' },
      { dataField: 'actionBy', caption: 'ผู้ดำเนินการ', dataType: 'string', alignment: 'left', width: 150 },
      { dataField: 'statusOrder', caption: 'สถานะ', dataType: 'string', alignment: 'center', cellTemplate: this.masterStatusTemplate, width: 150 },
      { dataField: 'orderDate', caption: 'วันที่เบิก', dataType: 'date', format: 'dd/MMM/yyyy', alignment: 'center', width: 120 },
    ];
    
    this.detailColumns = [
      { dataField: 'productId', caption: 'รหัสสินค้า', dataType: 'number', alignment: 'center', width: 100 },
      { dataField: 'productName', caption: 'ชื่อสินค้า', alignment: 'left' },
      { dataField: 'price', caption: 'ราคา', dataType: 'number', alignment: 'right', width: 100 },
      { dataField: 'quantity', caption: 'จำนวนเบิก', dataType: 'number', alignment: 'center', width: 80 },
      { dataField: 'returnedQuantity', caption: 'คืน', dataType: 'number', alignment: 'center', width: 80 },
      { dataField: 'netQuantity', caption: 'รวม(ได้จริง)', dataType: 'number', alignment: 'center', width: 100 },
      { dataField: 'status', caption: 'สถานะ', dataType: 'string', alignment: 'center', cellTemplate: this.statusTemplate, width: 140 },
    ];

    if (this.mode === 'ADMIN') {
      this.actionButtons = [
        {
          text: '',
          icon: 'eyeopen',
          type: 'default',
          stylingMode: 'text',
          onClick: (rowdata) => {
            this.router.navigate(['/admin-order/order-admin-detail'], {
              queryParams: { orderId: rowdata.orderId },
            });
          },
        }
      ];
    } else {
      this.actionButtons = [
        {
          text: '',
          icon: 'checkmarkcircle',
          type: 'success',
          stylingMode: 'text',
          disabled: (rowData) => rowData.statusOrder !== 'PENDING',
          onClick: (rowdata) => this.onSendToApprove(rowdata.orderId),
        },
        {
          text: '',
          icon: 'eyeopen',
          type: 'default',
          stylingMode: 'text',
          onClick: (rowdata) => {
            this.router.navigate(['/my-order/order-detail'], {
              queryParams: { orderId: rowdata.orderId },
            });
          },
        },
        {
          text: '',
          icon: 'trash',
          type: 'danger',
          stylingMode: 'text',
          disabled: (rowData) =>
            rowData.statusOrder === 'APPROVED' ||
            rowData.statusOrder === 'REJECTED' ||
            rowData.statusOrder === 'WAITAPPROVE',
          onClick: (rowdata) => this.onDeleteOrder(rowdata.orderId)
        },
      ];
    }
  }

  ngAfterViewInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin({
      products: this.activeService.getProductOptions(),
      statusOrders: this.activeService.getStatusOrder(),
    }).subscribe({
      next: (res: any) => {
        this.productOptions = res.products || [];
        this.statusOptions = res.statusOrders || [];
        this.buildDataSource();
      },
      error: (err) => console.error('API Error:', err),
    });
  }

  private buildDataSource(): void {
    this.gridDataSource = new DataSource({
      store: new CustomStore({
        key: 'orderId',
        load: (loadOptions: LoadOptions) => {
          const request: OrderSearchRequestModel = {
            loadOptions: loadOptions,
            keyword: this.searchKeyword || null,
            statusOrder: this.selectedStatus.length > 0 ? this.selectedStatus.map(String) : null,
            productIds: this.selectedProducts.length > 0 ? this.selectedProducts.map(Number) : null,
            startDate: this.startDate || null,
            endDate: this.endDate || null,
          };

          return lastValueFrom(this.activeService.searchOrders(request)).then((res: any) => ({
            data: res.data.map((p: any) => this.mapToOrder(p)),
            totalCount: res.totalCount,
          }));
        },
      }),
    });

    this.dataGrid?.setDataSource(this.gridDataSource);
  }

  private mapToOrder(res: OrderDetail): any {
    const productList = (res.products || []).map((p: any) => ({
      ...p,
      returnedQuantity: p.returnedQuantity || 0,
      netQuantity: p.quantity - (p.returnedQuantity || 0)
    }));
    const combinedProductNames = productList.map((p: any) => p.productName).join(', ');

    return {
      orderId: res.orderId,
      productName: combinedProductNames,
      actionBy: res.actionBy,
      statusOrder: res.statusOrder,
      orderDate: new Date(res.orderDate),
      products: productList,
    };
  }

  public onSearch(): void {
    this.dataGrid?.reload();
  }

  public onClear(): void {
    this.searchKeyword = '';
    this.selectedStatus = [];
    this.selectedProducts = [];
    this.startDate = null;
    this.endDate = null;
    this.dataGrid?.reload();
  }

  public onAddNewOrder(): void {
    this.router.navigate(['/my-order/order-detail']);
  }

  public async onSendToApprove(orderId: string): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: 'ยืนยันการส่งอนุมัติ',
      message: 'ต้องการเปลี่ยนสถานะออเดอร์นี้เป็น WAITAPPROVE ใช่หรือไม่?',
      icon: 'save',
      confirmText: 'ยืนยัน',
      confirmType: 'success',
      cancelText: 'ยกเลิก',
    });

    if (!confirmed) return;

    this.myOrderService.getOrderById(orderId).subscribe({
      next: (order) => {
        const payload: UpsertOrderPayload = {
          orderId: order.orderId,
          updatedAt: order.updatedAt,
          statusOrders: 'WAITAPPROVE',
          orderDetails: order.orderDetails
            .sort((a, b) => a.sequence - b.sequence)
            .map((item, index) => ({
              orderDetailId: item.orderDetailId,
              sequence: index + 1,
              productId: item.productId,
              quantity: item.quantity,
              statusOrderDetailCode: item.statusOrderDetailCode,
              remark: item.remark,
              returnedQuantity: item.returnedQuantity,
              returnRemark: item.returnRemark,
            })),
        };

        this.myOrderService.upsertOrder(payload).subscribe({
          next: () => {
            this.dataGrid?.reload();
          },
        });
      },
    });
  }

  public async onDeleteOrder(orderId: string): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: 'ยืนยันการลบออเดอร์',
      message: 'คุณต้องการลบออเดอร์นี้ใช่หรือไม่?\nเมื่อลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'delete',
      confirmText: 'ลบ',
      confirmType: 'danger',
      cancelText: 'ยกเลิก',
    });

    if (!confirmed) return;

    this.myOrderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.dataGrid?.reload();
      },
    })
  }
}
