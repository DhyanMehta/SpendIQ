import { PrismaService } from "../../common/database/prisma.service";
import { BudgetsService } from "../budgeting/services/budgets.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
export declare class PurchaseOrdersService {
    private prisma;
    private budgetsService;
    constructor(prisma: PrismaService, budgetsService: BudgetsService);
    create(userId: string, dto: CreatePurchaseOrderDto): Promise<{
        lines: {
            id: string;
            purchaseOrderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            analyticalAccountId: string | null;
        }[];
        vendor: {
            id: string;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            name: string;
            email: string;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        lines: ({
            product: {
                id: string;
                status: import(".prisma/client").$Enums.Status;
                createdAt: Date;
                updatedAt: Date;
                createdById: string | null;
                name: string;
                description: string | null;
                salesPrice: import("@prisma/client/runtime/library").Decimal;
                purchasePrice: import("@prisma/client/runtime/library").Decimal;
                categoryId: string | null;
                defaultAnalyticAccountId: string | null;
            };
            analyticalAccount: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                parentId: string | null;
            };
        } & {
            id: string;
            purchaseOrderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            analyticalAccountId: string | null;
        })[];
        creator: {
            name: string;
        };
        vendor: {
            id: string;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            name: string;
            email: string;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdatePurchaseOrderDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
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
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            poNumber: string;
            vendorId: string;
            orderDate: Date;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        };
        budgetWarnings: any[];
    }>;
    cancel(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        poNumber: string;
        vendorId: string;
        orderDate: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
}
