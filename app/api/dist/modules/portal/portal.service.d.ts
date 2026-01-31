import { PrismaService } from "../../common/database/prisma.service";
import { ConfigService } from "@nestjs/config";
export declare class PortalService {
    private readonly prisma;
    private readonly configService;
    private razorpay;
    constructor(prisma: PrismaService, configService: ConfigService);
    private getContactId;
    getDashboardData(userId: string): Promise<{
        summary: {
            totalInvoices: number;
            outstandingBalance: number;
            totalPurchaseOrders: number;
            totalSalesOrders: number;
            pendingInvoices?: undefined;
        };
        recentInvoices: any[];
        recentOrders: any[];
    } | {
        summary: {
            totalInvoices: number;
            outstandingBalance: number;
            totalPurchaseOrders: number;
            totalSalesOrders: number;
            pendingInvoices: number;
        };
        recentInvoices: {
            id: string;
            number: string;
            date: Date;
            dueDate: Date;
            total: number;
            status: import(".prisma/client").$Enums.PaymentState;
        }[];
        recentOrders: {
            id: string;
            number: string;
            type: string;
            date: Date;
            total: number;
            status: import(".prisma/client").$Enums.SalesOrderStatus;
        }[];
    }>;
    getMyInvoices(userId: string): Promise<{
        id: string;
        number: string;
        type: import(".prisma/client").$Enums.InvoiceType;
        date: Date;
        dueDate: Date;
        total: number;
        tax: number;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        paymentState: "NOT_PAID" | "PARTIAL" | "PAID";
        paidViaCash: number;
        paidViaBank: number;
        totalPaid: number;
        amountDue: number;
        salesOrderRef: string;
        lines: {
            id: string;
            product: string;
            description: string;
            quantity: number;
            unitPrice: number;
            amount: number;
        }[];
    }[]>;
    getMyPurchaseOrders(userId: string): Promise<{
        id: string;
        number: string;
        date: Date;
        total: number;
        status: import(".prisma/client").$Enums.PurchOrderStatus;
        lines: {
            id: string;
            product: string;
            description: string;
            quantity: number;
            unitPrice: number;
            amount: number;
        }[];
    }[]>;
    getMySalesOrders(userId: string): Promise<{
        id: string;
        number: string;
        date: Date;
        total: number;
        status: import(".prisma/client").$Enums.SalesOrderStatus;
        lines: {
            id: string;
            product: string;
            quantity: number;
            unitPrice: number;
            amount: number;
        }[];
    }[]>;
    getMyBills(userId: string): Promise<{
        id: string;
        number: string;
        date: Date;
        dueDate: Date;
        total: number;
        tax: number;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        paymentState: import(".prisma/client").$Enums.PaymentState;
        lines: {
            id: string;
            product: string;
            description: string;
            quantity: number;
            unitPrice: number;
            amount: number;
        }[];
    }[]>;
    getMyPayments(userId: string): Promise<{
        id: string;
        reference: string;
        date: Date;
        amount: number;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        type: import(".prisma/client").$Enums.PaymentType;
    }[]>;
    payInvoice(invoiceId: string, userId: string, paymentAmount?: number): Promise<{
        success: boolean;
        message: string;
        orderId?: undefined;
        amount?: undefined;
        amountInPaise?: undefined;
        currency?: undefined;
        invoiceNumber?: undefined;
        invoiceTotal?: undefined;
        totalPaid?: undefined;
        amountDue?: undefined;
        isPartialPayment?: undefined;
        keyId?: undefined;
        prefill?: undefined;
    } | {
        success: boolean;
        orderId: string;
        amount: number;
        amountInPaise: number;
        currency: string;
        invoiceNumber: string;
        invoiceTotal: number;
        totalPaid: number;
        amountDue: number;
        isPartialPayment: boolean;
        keyId: string;
        prefill: {
            name: string;
            email: string;
            contact: string;
        };
        message?: undefined;
    }>;
    verifyPayment(invoiceId: string, userId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, paymentAmount: number): Promise<{
        success: boolean;
        message: string;
        paymentId?: undefined;
        paymentReference?: undefined;
        amountPaid?: undefined;
        invoiceNumber?: undefined;
        invoiceTotal?: undefined;
        totalPaid?: undefined;
        amountDue?: undefined;
        paymentState?: undefined;
    } | {
        success: boolean;
        message: string;
        paymentId: string;
        paymentReference: string;
        amountPaid: number;
        invoiceNumber: string;
        invoiceTotal: number;
        totalPaid: number;
        amountDue: number;
        paymentState: "NOT_PAID" | "PARTIAL" | "PAID";
    }>;
}
