import { PrismaService } from "../../common/database/prisma.service";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";
export declare class SalesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateSalesOrderDto, userId?: string): Promise<{
        lines: ({
            product: {
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
            };
        } & {
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        date: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        createdById: string | null;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
    }>;
    findAll(filters: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        customerId?: string;
        userId?: string;
    }): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            date: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            reference: string;
            createdById: string | null;
            status: import(".prisma/client").$Enums.SalesOrderStatus;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        lines: ({
            product: {
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
            };
        } & {
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        invoices: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            date: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            type: import(".prisma/client").$Enums.InvoiceType;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            dueDate: Date;
            paymentState: import(".prisma/client").$Enums.PaymentState;
            salesOrderId: string | null;
            purchaseOrderId: string | null;
            journalEntryId: string | null;
        }[];
        customer: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        date: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        createdById: string | null;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
    }>;
    update(id: string, updateDto: UpdateSalesOrderDto): Promise<{
        lines: ({
            product: {
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
            };
        } & {
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        date: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        createdById: string | null;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
    }>;
    confirm(id: string): Promise<{
        lines: ({
            product: {
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
            };
        } & {
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        date: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        createdById: string | null;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
    }>;
    cancel(id: string): Promise<{
        lines: {
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
        customer: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            createdById: string | null;
            type: import(".prisma/client").$Enums.ContactType;
            status: import(".prisma/client").$Enums.Status;
            phone: string | null;
            street: string | null;
            city: string | null;
            country: string | null;
            pincode: string | null;
            imageUrl: string | null;
            portalUserId: string | null;
            isPortalUser: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        date: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        createdById: string | null;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
