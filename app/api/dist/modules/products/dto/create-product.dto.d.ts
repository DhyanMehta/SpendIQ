export declare class CreateProductDto {
    name: string;
    description?: string;
    salesPrice: number;
    purchasePrice: number;
    status?: "ACTIVE" | "ARCHIVED";
    categoryName?: string;
    categoryId?: string;
    defaultAnalyticAccountId?: string;
}
