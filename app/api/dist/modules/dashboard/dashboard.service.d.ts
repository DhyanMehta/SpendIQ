import { PrismaService } from "../../common/database/prisma.service";
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<{
        balance: number;
        income: number;
        expense: number;
        savings: number;
        savingsRate: number;
    }>;
    getMoneyFlow(): Promise<{
        name: string;
        income: number;
        expense: number;
    }[]>;
    getRecentTransactions(): Promise<({
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
    getBudgetUtilization(userId: string): Promise<{
        name: string;
        value: number;
        color: string;
    }[]>;
}
