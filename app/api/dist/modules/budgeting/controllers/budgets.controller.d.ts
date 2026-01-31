import { BudgetsService } from "../services/budgets.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { BudgetStatus } from "@prisma/client";
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    create(req: any, dto: CreateBudgetDto): Promise<{
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
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    revise(req: any, id: string, dto: CreateBudgetDto): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        budgetType: import(".prisma/client").$Enums.BudgetType;
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
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
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
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
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
    findAll(user: {
        id: string;
    }, status?: BudgetStatus, analyticAccountId?: string): Promise<({
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
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
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
            budgetedAmount: import("@prisma/client/runtime/library").Decimal;
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
            budgetedAmount: import("@prisma/client/runtime/library").Decimal;
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
        budgetedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BudgetStatus;
        createdAt: Date;
        updatedAt: Date;
        analyticAccountId: string;
        revisionOfId: string | null;
        createdBy: string;
    }>;
}
