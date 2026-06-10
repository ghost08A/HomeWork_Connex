export interface UserProfileResponseModel {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    roles: string[]; // เก็บ Role เป็น Array ของ String
}