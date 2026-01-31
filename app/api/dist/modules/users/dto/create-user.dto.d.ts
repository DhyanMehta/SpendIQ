import { Role } from "@prisma/client";
export declare class CreateUserDto {
    name: string;
    loginId: string;
    email: string;
    password: string;
    role: Role;
}
