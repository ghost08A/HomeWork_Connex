export interface loginModel {
  Username: string;
  Password: string;
}

export interface registerModel {
  Username: string;
  Password: string;
  ConfirmPassword: string;
  FirstName: string;
  LastName: string;
  Age: number;
  Phone: string;
  BirthDate: Date | null;
}