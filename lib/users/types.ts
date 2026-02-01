export enum Role {
  ADMIN = "ADMIN",
  VENDOR = "VENDOR",
  CUSTOMER = "CUSTOMER",
}

export interface CreateUserRequest {
  name: string;
  loginId: string;
  email: string;
  password: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: Role;
  createdAt: string;
}
