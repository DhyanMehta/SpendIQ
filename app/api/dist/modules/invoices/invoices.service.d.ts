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
                salesPrice: Prisma.Decimal;
                purchasePrice: Prisma.Decimal;
                categoryId: string | null;
                defaultAnalyticAccountId: string | null;
            };
        } & {
            id: string;
            subtotal: Prisma.Decimal;
            invoiceId: string;
            productId: string | null;
            label: string;
            quantity: Prisma.Decimal;
            priceUnit: Prisma.Decimal;
            taxRate: Prisma.Decimal;
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
        totalAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
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
            number: string;
            id: string;
            type: import(".prisma/client").$Enums.InvoiceType;
            partnerId: string;
            date: Date;
            dueDate: Date;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            paymentState: import(".prisma/client").$Enums.PaymentState;
            totalAmount: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            salesOrderId: string | null;
            purchaseOrderId: string | null;
            journalEntryId: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
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
        type: import(".prisma/client").$Enums.InvoiceType;
        partnerId: string;
        date: Date;
        dueDate: Date;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        totalAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        salesOrderId: string | null;
        purchaseOrderId: string | null;
        journalEntryId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
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
