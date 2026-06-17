import { LoadOptions } from "devextreme/data";

export class ProductOrderForm {
  productId: number | null = null;  // null = Create, มีค่า = Update
  quantity: number | null = null;
}

export interface ProductDetail {
  productId: number;
  productName: string;
  description: string;
  imagePath: string;
  price: number;
  quantity: number;      
  categoryNames: string[];
}

export interface OrderDetailTemp {
  orderDetailId: number|null;    
  sequence: number;
  productId: number;         
  productName: string;       
  description: string;      
  categoryNames: string[];     
  quantity: number;            
  statusOrderDetailCode: string; 
  remark: string | null;            
  

  returnedQuantity: number; 
  returnedAt: Date | null;  
  returnRemark: string | null;
}
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