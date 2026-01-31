import { InvoicesService } from "../services/invoices.service";
import { CreateInvoiceDto } from "../dto/create-invoice.dto";
import { InvoiceType } from "@prisma/client";
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(dto: CreateInvoiceDto, user: {
        id: string;
    }): Promise<{
        lines: {
            id: string;
            analyticAccountId: string | null;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            label: string;
            invoiceId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
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
    }>;
    post(id: string, user: {
        id: string;
    }): Promise<{
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
    }>;
    findAll(type?: InvoiceType, partnerId?: string, user?: {
        id: string;
    }): Promise<({
        partner: {
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
    })[]>;
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
            analyticAccount: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
        } & {
            id: string;
            analyticAccountId: string | null;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            label: string;
            invoiceId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        })[];
        partner: {
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
    }>;
}
