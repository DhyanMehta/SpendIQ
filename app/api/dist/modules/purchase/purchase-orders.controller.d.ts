import { PurchaseOrdersService } from "./purchase-orders.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(req: any, createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<{
        lines: {
            id: string;
            purchaseOrderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            analyticalAccountId: string | null;
        }[];
        vendor: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.Status;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            type: import(".prisma/client").$Enums.ContactType;
            createdById: string | null;
            phone: string | null;
            street: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<({
        _count: {
            lines: number;
        };
        vendor: {
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        creator: {
            name: string;
        };
        lines: ({
            product: {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.Status;
                createdAt: Date;
                updatedAt: Date;
                createdById: string | null;
                description: string | null;
                salesPrice: import("@prisma/client/runtime/library").Decimal;
                purchasePrice: import("@prisma/client/runtime/library").Decimal;
                categoryId: string | null;
                defaultAnalyticAccountId: string | null;
            };
            analyticalAccount: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            id: string;
            purchaseOrderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            analyticalAccountId: string | null;
        })[];
        vendor: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.Status;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            type: import(".prisma/client").$Enums.ContactType;
            createdById: string | null;
            phone: string | null;
            street: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    confirm(id: string): Promise<{
        po: {
            id: string;
            status: import(".prisma/client").$Enums.PurchOrderStatus;
            createdAt: Date;
            updatedAt: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            poNumber: string;
            vendorId: string;
            orderDate: Date;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        };
        budgetWarnings: any[];
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        createdAt: Date;
        updatedAt: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
}
