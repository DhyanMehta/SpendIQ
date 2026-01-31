import { PrismaService } from "../../../common/database/prisma.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { Decimal } from "@prisma/client/runtime/library";
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateBudgetDto): Promise<{
        analyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        creator: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    findAll(status?: string, analyticAccountId?: string, userId?: string): Promise<({
        analyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        creator: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    })[]>;
    findOne(id: string): Promise<{
        analyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        revisionOf: {
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            budgetType: import(".prisma/client").$Enums.BudgetType;
            budgetedAmount: Decimal;
            status: import(".prisma/client").$Enums.BudgetStatus;
            createdAt: Date;
            updatedAt: Date;
            analyticAccountId: string;
            revisionOfId: string | null;
            createdBy: string;
        };
        revisedBy: {
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            budgetType: import(".prisma/client").$Enums.BudgetType;
            budgetedAmount: Decimal;
            status: import(".prisma/client").$Enums.BudgetStatus;
            createdAt: Date;
            updatedAt: Date;
            analyticAccountId: string;
            revisionOfId: string | null;
            createdBy: string;
        };
        creator: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    approve(id: string): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    update(id: string, dto: CreateBudgetDto): Promise<{
        analyticAccount: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        creator: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    createRevision(id: string, userId: string, dto: CreateBudgetDto): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    checkBudgetAvailability(analyticAccountId: string, amount: number, date: Date): Promise<{
        available: boolean;
        remaining: number;
        budgetId?: string;
        message?: string;
    }>;
}
