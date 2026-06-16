import { Component , inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { CustomInputComponent } from '../../../Shared/components/custom-input/custom-input.component';
import { CustomTagBoxComponent } from '../../../Shared/components/custom-tag-box/custom-tag-box.component';
import { ActionButton, ColumnConfig, valueOption } from '../../../Shared/models/typecustom.model';
import { CustomButtonComponent } from '../../../Shared/components/custom-button/custom-button.component';
import { CustomCheckboxGroupComponent } from '../../../Shared/components/custom-checkbox-group/custom-checkbox-group.component';
import { CustomDataGridComponent } from '../../../Shared/components/custom-data-grid/custom-data-grid.component';
import DataSource from 'devextreme/data/data_source';
import { LoadingService } from '../../../Shared/services/loading.service';
import { forkJoin } from 'rxjs';
import { MyOrderService } from '../../service/my-order.service';
import { OrderDetail, OrderProduct, OrderSearchRequestModel } from '../../models/order.model';
import CustomStore from 'devextreme/data/custom_store';
import { LoadOptions } from 'devextreme/data';
import { lastValueFrom } from 'rxjs';
// ======================================
// Data Models
// ======================================

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

  constructor(private myOrderService: MyOrderService) {}
  
  // ======================================
  // ตัวเลือก Product & Status
  // ======================================
  public productOptions: valueOption[] = [];
  public statusOptions: valueOption[] = [];
  // ======================================
  // ตัวแปรค้นหา / Filter
  // ======================================
  public searchKeyword: string = '';
  public selectedProducts: string[] = [];
  public selectedStatus:  (string | number)[] = [];
  public startDate: Date | null = null;
  public endDate: Date | null = null;

  public gridDataSource!: DataSource;

  @ViewChild('dataGrid') dataGrid?: CustomDataGridComponent;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

   public masterColumns: ColumnConfig[] = [];
   public detailColumns: ColumnConfig[] = [];

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
        disabled: (rowData) => rowData.statusOrder === 'APPROVED' || rowData.statusOrder === 'REJECTED' || rowData.statusOrder === 'WAITAPPROVE',
        onClick: (rowdata) => {}
      },
      {
        text: '',
        icon: 'trash',
        type: 'danger',
        stylingMode: 'text',
        disabled: (rowData) => rowData.statusOrder === 'APPROVED' || rowData.statusOrder === 'REJECTED' || rowData.statusOrder === 'WAITAPPROVE',
        onClick: (rowdata) => {}
      },
      
   ];

   ngOnInit(): void {
    this.masterColumns = [
      {
        dataField: 'orderId',
        caption: 'รหัส',
        dataType: 'string',
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
        dataField: 'statusOrder',
        caption: 'สถานะ',
        dataType: 'string',
        alignment: 'center',
        width: 150,
      },
      {
        dataField: 'orderDate',
        caption: 'วันที่เบิก',
        dataType: 'date',
        format: 'dd/MMM/yyyy',
        alignment: 'center',
        width: 120,
      }
    ];
    this.detailColumns = [
      {
        dataField: 'productId',
        caption: 'รหัสสินค้า',
        dataType: 'number',
        alignment: 'center',
        width: 100,
      },
      {
        dataField: 'productName',
        caption: 'ชื่อสินค้า',
        alignment: 'left',
      },
      {
        dataField: 'price',
        caption: 'ราคา',
        dataType: 'number',
        alignment: 'right',
        width: 120,
      },
      {
        dataField: 'quantity',
        caption: 'จำนวนเบิก',
        dataType: 'number',
        alignment: 'center',
        width: 100,
      },
      {
        dataField: 'status',
        caption: 'สถานะ',
        dataType: 'string',
        alignment: 'center',
        cellTemplate: this.statusTemplate,
        width: 100,
      }
    ];

    this.loadInitialData();
   }

   private loadInitialData(): void {
    forkJoin({
        products: this.myOrderService.getProductOptions(),
        statusOrders: this.myOrderService.getStatusOrder(),
    }).subscribe({
      next: (res) => {
        this.productOptions = res.products || [];
        this.statusOptions = res.statusOrders || [];
        this.buildDataSource();
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    })
   }

   private buildDataSource(): void {
    this.gridDataSource = new DataSource({
      store: new CustomStore({
        key: 'orderId',
        load: (loadOptions: LoadOptions) => {
          const request: OrderSearchRequestModel = {
            loadOptions:      loadOptions,
            keyword:          this.searchKeyword || null,
            statusOrders:     this.selectedStatus.length > 0
                                ? this.selectedStatus.map(String)
                                : null,
            productIds:       this.selectedProducts.length > 0
                                ? this.selectedProducts.map(Number)
                                : null,
            startDate:        this.startDate || null,
            endDate:          this.endDate || null,
          };

          return lastValueFrom(this.myOrderService.searchOrders(request))
            .then((res) => ({
              data:       res.data.map((p) => this.mapToOrder(p)),
              totalCount: res.totalCount,
            }));
        },
      })
    });

    setTimeout(() => {
      this.dataGrid?.setDataSource(this.gridDataSource);
    });
   }
   private mapToOrder(res: OrderDetail): any {
    const productList = res.products || [];
    const combinedProductNames = productList.map(p => p.productName).join(', ');

    return {
      orderId: res.orderId,
      productName: combinedProductNames,
      actionBy: res.actionBy,
      statusOrder: res.statusOrder,
      orderDate: new Date(res.orderDate),
      products: productList,
    }
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

  public onAddNewOrder(): void {}
}
