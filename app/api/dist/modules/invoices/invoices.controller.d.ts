import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto, user: any): Promise<{
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
    findAll(user: any, page?: string, limit?: string, type?: string, state?: string, partnerId?: string): Promise<{
        data: ({
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
        })[];
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<any>;
    post(id: string, user: any): Promise<{
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
    registerPayment(id: string, paymentData: {
        journalId: string;
        amount: number;
        date: Date;
        reference?: string;
    }): Promise<{
        payment: any;
        invoice: any;
    }>;
}
