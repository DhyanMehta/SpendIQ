import { PrismaService } from '../../common/database/prisma.service';
import { CreateVendorBillDto } from './dto/create-vendor-bill.dto';
import { UpdateVendorBillDto } from './dto/update-vendor-bill.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
export declare class VendorBillsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateVendorBillDto, userId: string): Promise<{
        purchaseOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            status: import(".prisma/client").$Enums.PurchOrderStatus;
            poNumber: string;
        };
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
    findAll(filters: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        vendorId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: ({
            purchaseOrder: {
                id: string;
                poNumber: string;
            };
            partner: {
                id: string;
                name: string;
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
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        purchaseOrder: {
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
                analyticalAccountId: string | null;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                productId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                purchaseOrderId: string;
                description: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            status: import(".prisma/client").$Enums.PurchOrderStatus;
            poNumber: string;
        };
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
        payments: ({
            payment: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
        })[];
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
    update(id: string, updateDto: UpdateVendorBillDto): Promise<{
        purchaseOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            status: import(".prisma/client").$Enums.PurchOrderStatus;
            poNumber: string;
        };
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
    postBill(id: string, userId: string): Promise<{
        budgetImpact: any[];
        purchaseOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vendorId: string;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            createdById: string | null;
            status: import(".prisma/client").$Enums.PurchOrderStatus;
            poNumber: string;
        };
        journalEntry: {
            number: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            reference: string | null;
            journalId: string | null;
            state: import(".prisma/client").$Enums.EntryState;
            createdById: string | null;
        };
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
    registerPayment(id: string, paymentDto: RegisterPaymentDto, userId: string): Promise<{
        bill: {
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
            payments: ({
                payment: {
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
                };
            } & {
                id: string;
                createdAt: Date;
                invoiceId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentId: string;
            })[];
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
        };
        payment: {
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
        };
        outstanding: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
