import { Status } from "@prisma/client";
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    salesPrice?: number;
    purchasePrice?: number;
    categoryName?: string;
    categoryId?: string;
    defaultAnalyticAccountId?: string;
    status?: Status;
}
