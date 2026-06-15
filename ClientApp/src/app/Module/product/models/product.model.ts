
import { LoadOptions } from 'devextreme/data';
import { DevExtremeLoadOptions } from '../../Shared/models/devExtreme.model';
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
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// ======================================
// ProductForm — ใช้ใน Popup เพิ่ม/แก้ไข
// ======================================
export class ProductForm {
    productId: number | null = null;  // null = Create, มีค่า = Update
    productName: string = '';
    price: number = 0;
    detail: string = '';
    quantity: number = 0;
    imagePath: string = '';
    statusProductCode: string = 'ACTIVE';
    categoryId: number[] = [];
    updatedAt?: string | Date | null = null;
}

// ======================================
// Request/Response Model สำหรับ API
// ======================================



// Model ขาไป (Request) — รวม LoadOptions ของ DevExtreme + filter ของเราเอง

export interface ProductSearchRequestModel {
    loadOptions: DevExtremeLoadOptions;
    keyword: string | null;
    filterActive: boolean;
    filterInactive: boolean;
    categoryIds: number[] | null;
}

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

// Wrapper ที่ Backend ส่งกลับมา (DevExtreme.AspNet.Data LoadResult format)
export interface ProductSearchResult {
    data: ProductSearchResponseModel[];
    totalCount: number;
}

