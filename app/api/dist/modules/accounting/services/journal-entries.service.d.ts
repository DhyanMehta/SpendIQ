import { PrismaService } from "../../../common/database/prisma.service";
export declare class JournalEntriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        date: Date;
        reference?: string;
        lines: {
            accountId: string;
            partnerId?: string;
            label: string;
            debit: number;
            credit: number;
            analyticAccountId?: string;
        }[];
    }, userId?: string): Promise<{
        lines: {
            id: string;
            createdAt: Date;
            partnerId: string | null;
            analyticAccountId: string | null;
            label: string | null;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
            reconciled: boolean;
            accountId: string;
            entryId: string;
        }[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reference: string | null;
        journalId: string | null;
        state: import(".prisma/client").$Enums.EntryState;
        createdById: string | null;
    }>;
    findAll(userId?: string): Promise<({
        lines: ({
            account: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: import(".prisma/client").$Enums.AccountType;
                reconcilable: boolean;
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
            createdAt: Date;
            partnerId: string | null;
            analyticAccountId: string | null;
            label: string | null;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
            reconciled: boolean;
            accountId: string;
            entryId: string;
        })[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reference: string | null;
        journalId: string | null;
        state: import(".prisma/client").$Enums.EntryState;
        createdById: string | null;
    })[]>;
    findOne(id: string): Promise<{
        lines: ({
            account: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: import(".prisma/client").$Enums.AccountType;
                reconcilable: boolean;
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
            createdAt: Date;
            partnerId: string | null;
            analyticAccountId: string | null;
            label: string | null;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
            reconciled: boolean;
            accountId: string;
            entryId: string;
        })[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reference: string | null;
        journalId: string | null;
        state: import(".prisma/client").$Enums.EntryState;
        createdById: string | null;
    }>;
    post(id: string): Promise<{
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reference: string | null;
        journalId: string | null;
        state: import(".prisma/client").$Enums.EntryState;
        createdById: string | null;
    }>;
}
