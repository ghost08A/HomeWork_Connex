import { LoadOptions } from "devextreme/data";

export interface OrderSearchRequestModel {
    loadOptions: LoadOptions;
    keyword: string | null;
    statusOrders: string[] | null;
    productIds: number[] | null;
    startDate: Date | null;
    endDate: Date | null;
}

export interface OrderProduct {
  productId: number;
  productName: string;
  status: string;
  price: number;
  quantity: number;
}
export interface OrderDetail {
  orderId: string;
  actionBy: string;
  statusOrder: string;
  orderDate:    Date;
  products: OrderProduct[]; 
}

export interface OrderSearchResult {
  data: OrderDetail[];
  totalCount: number;
}

export interface OrderList {
  orderId: string;
  productName: string;
  actionBy: string;
  statusOrder: string;
  orderDate: Date;
  products: OrderProduct[]; 
}