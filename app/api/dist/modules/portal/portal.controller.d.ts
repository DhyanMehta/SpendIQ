import { PortalService } from "./portal.service";
export declare class PortalController {
    private readonly portalService;
    constructor(portalService: PortalService);
    getDashboard(req: any): Promise<{
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
    getMyInvoices(req: any): Promise<{
        id: string;
        number: string;
        type: import(".prisma/client").$Enums.InvoiceType;
        date: Date;
        dueDate: Date;
        total: number;
        tax: number;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        paymentState: import(".prisma/client").$Enums.PaymentState;
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
    getMyPurchaseOrders(req: any): Promise<{
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
    getMySalesOrders(req: any): Promise<{
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
    getMyBills(req: any): Promise<{
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
    getMyPayments(req: any): Promise<{
        id: string;
        reference: string;
        date: Date;
        amount: number;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        type: import(".prisma/client").$Enums.PaymentType;
    }[]>;
    payInvoice(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        orderId?: undefined;
        amount?: undefined;
        amountInPaise?: undefined;
        currency?: undefined;
        invoiceNumber?: undefined;
        keyId?: undefined;
        prefill?: undefined;
    } | {
        success: boolean;
        orderId: string;
        amount: number;
        amountInPaise: number;
        currency: string;
        invoiceNumber: string;
        keyId: string;
        prefill: {
            name: string;
            email: string;
            contact: string;
        };
        message?: undefined;
    }>;
    verifyPayment(id: string, body: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        paymentId?: undefined;
        paymentReference?: undefined;
        amountPaid?: undefined;
        invoiceNumber?: undefined;
    } | {
        success: boolean;
        message: string;
        paymentId: string;
        paymentReference: string;
        amountPaid: number;
        invoiceNumber: string;
    }>;
}
