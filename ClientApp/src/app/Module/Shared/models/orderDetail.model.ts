import { orderStatus } from "../enum/AllStatus";

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

export interface OrderDetail{
  orderDetailId: number|null;    
  sequence: number;
  productId: number;         
  productName: string;       
  description: string;      
  categoryNames: string[];     
  quantity: number;            
  statusOrderDetailCode: string|null; 
  remark: string | null;            

  returnedQuantity: number; 
  returnedAt: Date | null;  
  returnRemark: string | null;
}

export interface OrderDetailPayload {
  orderDetailId: number | null;
  sequence: number;
  productId: number;
  quantity: number;
  statusOrderDetailCode: string|null;
  remark: string | null;
  returnedQuantity: number;
  returnRemark: string | null;
}

export class UpsertOrderPayload {
  orderId: string | null = null; // null = Create, มีค่า = Update
  updatedAt : Date|null = null; // ใช้สำหรับ Update เพื่อเช็คว่า order นี้มีการแก้ไขจากที่อื่นหรือไม่
  statusOrders: string|null = null; // สถานะของ order ทั้งหมด (เช่น DRAFT, SUBMITTED, APPROVED, REJECTED) 
  orderDetails: OrderDetailPayload[] = []; // รายละเอียดของแต่ละ order detail ที่จะส่งไป API
}

export interface UpsertOrderResponse {
  orderId: string;
}

export interface GetOrderByIdResponse {
  orderId: string;
  statusOrders: string;
  updatedAt: Date | null;
  orderDetails: OrderDetail[];
}

export type OrderActionStatus = `${orderStatus}` | null;


export interface ReturnFormData{
  productId: number;
  productName: string;
  maxQuantity: number;
  returnedQuantity: number;
  returnRemark: string;

}
