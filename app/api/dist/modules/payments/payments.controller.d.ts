import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(page?: string, limit?: string, search?: string, vendorId?: string, startDate?: string, endDate?: string, status?: string): Promise<{
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
            allocations: ({
                invoice: {
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
                };
            } & {
                id: string;
                createdAt: Date;
                invoiceId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            date: Date;
            method: string;
            reference: string;
            createdById: string | null;
            type: import(".prisma/client").$Enums.PaymentType;
            status: import(".prisma/client").$Enums.PaymentStatus;
            journalEntryId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnpaidBills(vendorId: string): Promise<{
        id: string;
        number: string;
        date: Date;
        dueDate: Date;
        amountTotal: number;
        paidAmount: number;
        outstanding: number;
    }[]>;
    findOne(id: string): Promise<{
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
        allocations: ({
            invoice: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        date: Date;
        method: string;
        reference: string;
        createdById: string | null;
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        journalEntryId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(createPaymentDto: CreatePaymentDto): Promise<{
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
        allocations: ({
            invoice: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        date: Date;
        method: string;
        reference: string;
        createdById: string | null;
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        journalEntryId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<{
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
        allocations: ({
            invoice: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        date: Date;
        method: string;
        reference: string;
        createdById: string | null;
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        journalEntryId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    postPayment(id: string): Promise<{
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
        allocations: ({
            invoice: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        date: Date;
        method: string;
        reference: string;
        createdById: string | null;
        type: import(".prisma/client").$Enums.PaymentType;
        status: import(".prisma/client").$Enums.PaymentStatus;
        journalEntryId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
