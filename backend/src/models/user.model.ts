export interface UserModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
  RECEPTIONIST = "RECEPTIONIST",
  GUEST = "GUEST",
}