import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, user: any): Promise<{
        category: {
            id: string;
            name: string;
            parentId: string | null;
        };
        defaultAnalyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        status: import(".prisma/client").$Enums.Status;
        description: string | null;
        salesPrice: import("@prisma/client/runtime/library").Decimal;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        defaultAnalyticAccountId: string | null;
    }>;
    findAll(query: ProductQueryDto, user: any): Promise<({
        category: {
            id: string;
            name: string;
            parentId: string | null;
        };
        defaultAnalyticAccount: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        status: import(".prisma/client").$Enums.Status;
        description: string | null;
        salesPrice: import("@prisma/client/runtime/library").Decimal;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        defaultAnalyticAccountId: string | null;
    })[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        parentId: string | null;
    }[]>;
    createCategory(name: string): Promise<{
        id: string;
        name: string;
        parentId: string | null;
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            parentId: string | null;
        };
        defaultAnalyticAccount: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        status: import(".prisma/client").$Enums.Status;
        description: string | null;
        salesPrice: import("@prisma/client/runtime/library").Decimal;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        defaultAnalyticAccountId: string | null;
    }>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
        category: {
            id: string;
            name: string;
            parentId: string | null;
        };
        defaultAnalyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        status: import(".prisma/client").$Enums.Status;
        description: string | null;
        salesPrice: import("@prisma/client/runtime/library").Decimal;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        defaultAnalyticAccountId: string | null;
    }>;
    archive(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        status: import(".prisma/client").$Enums.Status;
        description: string | null;
        salesPrice: import("@prisma/client/runtime/library").Decimal;
        purchasePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        defaultAnalyticAccountId: string | null;
    }>;
}
