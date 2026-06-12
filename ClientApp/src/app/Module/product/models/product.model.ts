
// ======================================
// ProductList — ใช้แสดงข้อมูลในตาราง
// ======================================
export interface ProductList {
    productId: number;
    productName: string;
    price: number;
    detail: string;
    quantity: number;
    imagePath: string;
    statusProductCode: string;
    categoryId: number[];
    categoryNames: string[];     // array ของชื่อประเภท แปลงจาก categoryId[]
    createdAt?: string | Date;   // ตรงกับ Backend (createdAt)
    updatedAt?: string | Date;   // ตรงกับ Backend (updatedAt)
}

// ======================================
// ProductForm — ใช้ใน Popup เพิ่ม/แก้ไข
// ======================================
export class ProductForm {
    productId: number = 0;
    productName: string = '';
    price: number = 0;
    detail: string = '';
    quantity: number = 0;
    imagePath: string = '';
    statusProductCode: string = 'ACTIVE';
    categoryId: number[] = [];
    updatedAt?: string | Date|null = null;
}

// ======================================
// Request/Response Model สำหรับ API
// ======================================

// Model ขาไป (Request)
export interface ProductSearchRequestModel {
    keyword: string | null;
    filterActive: boolean;
    filterInactive: boolean;
    categoryIds: number[] | null;
    pageNumber: number;
    pageSize: number;
}

// Model ขากลับ (ตัวสินค้า 1 แถว)
export interface ProductSearchResponseModel {
    productId: number;
    productName: string;
    price: number;
    detail: string;
    quantity: number;
    imagePath: string;
    statusProductCode: string;
    categoryId: number[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// Wrapper หน้าข้อมูล
export interface PageResultResponseModel<T> {
    item: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages?: number;
}