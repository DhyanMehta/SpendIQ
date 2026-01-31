import { PrismaService } from "../../common/database/prisma.service";
import { CreateAnalyticalAccountDto } from "./dto/create-analytical-account.dto";
import { UpdateAnalyticalAccountDto } from "./dto/update-analytical-account.dto";
export declare class AnalyticalAccountService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(includeArchived?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }>;
    create(dto: CreateAnalyticalAccountDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }>;
    update(id: string, dto: UpdateAnalyticalAccountDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }>;
    confirm(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }>;
    archive(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        parentId: string | null;
    }>;
}
