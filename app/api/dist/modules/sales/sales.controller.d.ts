import { SalesService } from "./sales.service";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createDto: CreateSalesOrderDto, user: {
        id: string;
    }): Promise<{
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
        } & {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
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
        date: Date;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        reference: string;
        customerId: string;
    }>;
    findAll(query: {
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
        customerId?: string;
    }, user: {
        id: string;
    }): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            date: Date;
            status: import(".prisma/client").$Enums.SalesOrderStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            reference: string;
            customerId: string;
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
        } & {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        invoices: {
            number: string;
            id: string;
            type: import(".prisma/client").$Enums.InvoiceType;
            partnerId: string;
            date: Date;
            dueDate: Date;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            paymentState: import(".prisma/client").$Enums.PaymentState;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            salesOrderId: string | null;
            purchaseOrderId: string | null;
            journalEntryId: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
        }[];
        customer: {
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
        date: Date;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        reference: string;
        customerId: string;
    }>;
    update(id: string, updateDto: UpdateSalesOrderDto): Promise<{
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
        } & {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
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
        date: Date;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        reference: string;
        customerId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    confirm(id: string): Promise<{
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
        } & {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        customer: {
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
        date: Date;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        reference: string;
        customerId: string;
    }>;
    createInvoice(id: string, user: {
        id: string;
    }): Promise<{
        partner: {
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
        } & {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            analyticAccountId: string | null;
        })[];
        salesOrder: {
            id: string;
            date: Date;
            status: import(".prisma/client").$Enums.SalesOrderStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            reference: string;
            customerId: string;
        };
    } & {
        number: string;
        id: string;
        type: import(".prisma/client").$Enums.InvoiceType;
        partnerId: string;
        date: Date;
        dueDate: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
    }>;
}
