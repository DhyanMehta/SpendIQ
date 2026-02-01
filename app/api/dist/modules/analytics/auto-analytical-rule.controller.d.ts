import { AutoAnalyticalRuleService } from "./auto-analytical-rule.service";
import { CreateAutoAnalyticalRuleDto } from "./dto/create-auto-analytical-rule.dto";
import { UpdateAutoAnalyticalRuleDto } from "./dto/update-auto-analytical-rule.dto";
export declare class AutoAnalyticalRuleController {
    private readonly autoAnalyticalRuleService;
    constructor(autoAnalyticalRuleService: AutoAnalyticalRuleService);
    findAll(includeArchived?: string): Promise<{
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
    create(dto: CreateAutoAnalyticalRuleDto, req: any): Promise<{
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
}
