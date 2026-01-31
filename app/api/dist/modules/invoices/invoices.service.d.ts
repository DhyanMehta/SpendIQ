import { PrismaService } from "../../common/database/prisma.service";
import { JournalEntriesService } from "../accounting/services/journal-entries.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { SalesService } from "../sales/sales.service";
import { Prisma } from "@prisma/client";
export declare class InvoicesService {
    private readonly prisma;
    private readonly journalEntriesService;
    private readonly salesService;
    constructor(prisma: PrismaService, journalEntriesService: JournalEntriesService, salesService: SalesService);
    create(createDto: CreateInvoiceDto, userId?: string): Promise<{
        lines: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                createdById: string | null;
                status: import(".prisma/client").$Enums.Status;
                description: string | null;
                salesPrice: Prisma.Decimal;
                purchasePrice: Prisma.Decimal;
                categoryId: string | null;
                defaultAnalyticAccountId: string | null;
            };
        } & {
            id: string;
            analyticAccountId: string | null;
            priceUnit: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            label: string;
            invoiceId: string;
            productId: string | null;
            quantity: Prisma.Decimal;
            taxRate: Prisma.Decimal;
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
        totalAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        createdById: string | null;
        type: import(".prisma/client").$Enums.InvoiceType;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        dueDate: Date;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
    }>;
    findAll(filters: {
        page: number;
        limit: number;
        type?: string;
        state?: string;
        partnerId?: string;
        userId?: string;
    }): Promise<{
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
            totalAmount: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
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
    update(id: string, updateDto: UpdateInvoiceDto): Promise<any>;
    post(id: string, userId?: string): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        date: Date;
        totalAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        createdById: string | null;
        type: import(".prisma/client").$Enums.InvoiceType;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        dueDate: Date;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
    }>;
    registerPayment(id: string, data: {
        journalId: string;
        amount: number;
        date: Date;
        reference?: string;
    }): Promise<{
        payment: any;
        invoice: any;
    }>;
}
