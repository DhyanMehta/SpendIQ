import { Status } from "@prisma/client";
export declare class ProductQueryDto {
    search?: string;
    categoryId?: string;
    status?: Status;
}
