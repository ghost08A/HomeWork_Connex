export class RegisterModel  {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  age: number = 0;
  phone: string = '';
  birthDate: Date | null = null;
}

export class LoginRequestModel {
  username: string = '';
  password: string = '';
}

export interface LoginModel {
  username: string;
  password: string;
}