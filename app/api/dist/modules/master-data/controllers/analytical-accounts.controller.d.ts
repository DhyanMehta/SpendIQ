import { AnalyticalAccountsService } from "../services/analytical-accounts.service";
import { CreateAnalyticalAccountDto } from "../dto/create-analytical-account.dto";
export declare class AnalyticalAccountsController {
    private readonly service;
    constructor(service: AnalyticalAccountsService);
    create(dto: CreateAnalyticalAccountDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    }>;
    findAll(): Promise<({
        parent: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        children: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        };
        children: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            parentId: string | null;
        }[];
        budgets: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            analyticAccountId: string;
            budgetedAmount: import("@prisma/client/runtime/library").Decimal;
            startDate: Date;
            endDate: Date;
            budgetType: import(".prisma/client").$Enums.BudgetType;
            status: import(".prisma/client").$Enums.BudgetStatus;
            revisionOfId: string | null;
            createdBy: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        parentId: string | null;
    }>;
}
