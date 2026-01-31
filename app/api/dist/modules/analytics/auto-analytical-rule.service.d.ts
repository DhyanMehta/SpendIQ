import { PrismaService } from "../../common/database/prisma.service";
import { CreateAutoAnalyticalRuleDto } from "./dto/create-auto-analytical-rule.dto";
import { UpdateAutoAnalyticalRuleDto } from "./dto/update-auto-analytical-rule.dto";
export declare class AutoAnalyticalRuleService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(includeArchived?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }>;
    create(dto: CreateAutoAnalyticalRuleDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }>;
    update(id: string, dto: UpdateAutoAnalyticalRuleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }>;
    confirm(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }>;
    archive(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        targetAccountId: string;
        active: boolean;
    }>;
    private calculatePriority;
}
