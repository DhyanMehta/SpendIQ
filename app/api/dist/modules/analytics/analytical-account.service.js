"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let AnalyticalAccountService = class AnalyticalAccountService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(includeArchived = false) {
        const where = {};
        if (!includeArchived) {
            where.status = { not: client_1.AnalyticStatus.ARCHIVED };
        }
        return this.prisma.analyticalAccount.findMany({
            where,
            include: {
                parent: true,
                children: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ status: "asc" }, { code: "asc" }],
        });
    }
    async findOne(id) {
        const account = await this.prisma.analyticalAccount.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Analytical account with ID ${id} not found`);
        }
        return account;
    }
    async create(dto, userId) {
        const existing = await this.prisma.analyticalAccount.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Analytical account with code "${dto.code}" already exists`);
        }
        if (dto.parentId) {
            const parent = await this.prisma.analyticalAccount.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`Parent analytical account with ID ${dto.parentId} not found`);
            }
        }
        return this.prisma.analyticalAccount.create({
            data: {
                code: dto.code,
                name: dto.name,
                parentId: dto.parentId,
                status: client_1.AnalyticStatus.DRAFT,
                createdById: userId,
            },
            include: {
                parent: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async update(id, dto) {
        const account = await this.findOne(id);
        if (account.status !== client_1.AnalyticStatus.DRAFT) {
            throw new common_1.BadRequestException("Only DRAFT analytical accounts can be updated");
        }
        if (dto.code && dto.code !== account.code) {
            const existing = await this.prisma.analyticalAccount.findUnique({
                where: { code: dto.code },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Analytical account with code "${dto.code}" already exists`);
            }
        }
        if (dto.parentId !== undefined && dto.parentId !== account.parentId) {
            if (dto.parentId) {
                const parent = await this.prisma.analyticalAccount.findUnique({
                    where: { id: dto.parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException(`Parent analytical account with ID ${dto.parentId} not found`);
                }
                if (dto.parentId === id) {
                    throw new common_1.BadRequestException("An analytical account cannot be its own parent");
                }
            }
        }
        return this.prisma.analyticalAccount.update({
            where: { id },
            data: dto,
            include: {
                parent: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async confirm(id) {
        const account = await this.findOne(id);
        if (account.status !== client_1.AnalyticStatus.DRAFT) {
            throw new common_1.BadRequestException("Only DRAFT analytical accounts can be confirmed");
        }
        return this.prisma.analyticalAccount.update({
            where: { id },
            data: { status: client_1.AnalyticStatus.CONFIRMED },
            include: {
                parent: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async archive(id) {
        const account = await this.findOne(id);
        if (account.status !== client_1.AnalyticStatus.CONFIRMED) {
            throw new common_1.BadRequestException("Only CONFIRMED analytical accounts can be archived");
        }
        return this.prisma.analyticalAccount.update({
            where: { id },
            data: { status: client_1.AnalyticStatus.ARCHIVED },
            include: {
                parent: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
};
exports.AnalyticalAccountService = AnalyticalAccountService;
exports.AnalyticalAccountService = AnalyticalAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticalAccountService);
//# sourceMappingURL=analytical-account.service.js.map