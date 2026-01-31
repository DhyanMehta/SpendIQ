declare class SalesOrderLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateSalesOrderDto {
    customerId: string;
    date: string;
    lines: SalesOrderLineDto[];
}
export {};
