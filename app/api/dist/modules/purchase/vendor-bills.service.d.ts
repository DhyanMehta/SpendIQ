import { PrismaService } from "../../common/database/prisma.service";
import { BudgetsService } from "../budgeting/services/budgets.service";
import { CreateVendorBillDto } from "./dto/create-vendor-bill.dto";
export declare class VendorBillsService {
    private prisma;
    private budgetsService;
    constructor(prisma: PrismaService, budgetsService: BudgetsService);
    create(createVendorBillDto: CreateVendorBillDto, userId: string): Promise<{
        partner: {
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
        lines: ({
            analyticAccount: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
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
        } & {
            id: string;
            analyticAccountId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
        })[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InvoiceType;
        partnerId: string;
        date: Date;
        dueDate: Date;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdById: string | null;
    }>;
    findAll(userId: string): Promise<({
        partner: {
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
        lines: {
            id: string;
            analyticAccountId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InvoiceType;
        partnerId: string;
        date: Date;
        dueDate: Date;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdById: string | null;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        partner: {
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
        lines: ({
            analyticAccount: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                parentId: string | null;
            };
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
        } & {
            id: string;
            analyticAccountId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            priceUnit: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
        })[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InvoiceType;
        partnerId: string;
        date: Date;
        dueDate: Date;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdById: string | null;
    }>;
    post(id: string, userId: string): Promise<{
        bill: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.InvoiceType;
            partnerId: string;
            date: Date;
            dueDate: Date;
            paymentState: import(".prisma/client").$Enums.PaymentState;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            salesOrderId: string | null;
            purchaseOrderId: string | null;
            journalEntryId: string | null;
            createdById: string | null;
        };
        budgetWarnings: any[];
    }>;
    simulatePost(id: string, userId: string): Promise<any[]>;
}
