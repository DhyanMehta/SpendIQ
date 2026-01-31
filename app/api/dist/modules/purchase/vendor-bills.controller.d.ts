import { VendorBillsService } from "./vendor-bills.service";
import { CreateVendorBillDto } from "./dto/create-vendor-bill.dto";
export declare class VendorBillsController {
    private readonly vendorBillsService;
    constructor(vendorBillsService: VendorBillsService);
    create(createDto: CreateVendorBillDto, user: {
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
            analyticAccount: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                parentId: string | null;
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
    findAll(user: {
        id: string;
    }): Promise<({
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
        lines: {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            analyticAccountId: string | null;
        }[];
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
    })[]>;
    findOne(id: string, user: {
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
            analyticAccount: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                parentId: string | null;
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
    postBill(id: string, user: {
        id: string;
    }): Promise<{
        bill: {
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
        };
        budgetWarnings: any[];
    }>;
}
