
export interface NavigationModel {
    navbarName: string; // ตรงกับ NavbarName ของ C#
    pageURL: string;    // ตรงกับ PageURL ของ C#
    seq: number;        // ตรงกับ Seq ของ C#
    pageCode: string;   
}

export interface PrivPageResponse{
    canAccess:boolean;
    permission: string; // r หรือ rw
}