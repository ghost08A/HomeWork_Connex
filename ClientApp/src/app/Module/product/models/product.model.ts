

export interface ProductList {
    productId: number;
    productName: string;
    price: number;
    detail: string;
    quantity: number;
    imagePath: string;
    statusProductCode: string;
    categoryId: string[];
    categoryNames?: string; // สำหรับเก็บชื่อประเภทที่เอาไว้แสดงในตารางหน้าใหญ่
    createdDate?: string | Date;
    updatedDate?: string | Date;
}

export class ProductForm {
    productId: number = 0;
    productName: string = '';
    price: number = 0;
    detail: string = '';
    quantity: number = 0;
    imagePath: string = '';
    statusProductCode: string = 'ACTIVE';
    categoryId: string[] = []
}

