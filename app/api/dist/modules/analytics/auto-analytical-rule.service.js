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
exports.AutoAnalyticalRuleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let AutoAnalyticalRuleService = class AutoAnalyticalRuleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(includeArchived = false) {
        const where = {};
        if (!includeArchived) {
            where.status = { not: client_1.AnalyticStatus.ARCHIVED };
        }
        return this.prisma.autoAnalyticalRule.findMany({
            where,
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ status: "asc" }, { priority: "desc" }, { name: "asc" }],
        });
    }
    async findOne(id) {
        const rule = await this.prisma.autoAnalyticalRule.findUnique({
            where: { id },
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Auto-analytical rule with ID ${id} not found`);
        }
        return rule;
    }
    async create(dto, userId) {
        if (!dto.partnerTagId &&
            !dto.partnerId &&
            !dto.productCategoryId &&
            !dto.productId) {
            throw new common_1.BadRequestException("At least one match condition must be provided");
        }
        const analyticalAccount = await this.prisma.analyticalAccount.findUnique({
            where: { id: dto.analyticalAccountId },
        });
        if (!analyticalAccount) {
            throw new common_1.NotFoundException(`Analytical account with ID ${dto.analyticalAccountId} not found`);
        }
        const priority = this.calculatePriority(dto);
        return this.prisma.autoAnalyticalRule.create({
            data: {
                name: dto.name,
                partnerTagId: dto.partnerTagId,
                partnerId: dto.partnerId,
                productCategoryId: dto.productCategoryId,
                productId: dto.productId,
                analyticalAccountId: dto.analyticalAccountId,
                priority,
                status: client_1.AnalyticStatus.DRAFT,
                createdById: userId,
            },
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
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
        const rule = await this.findOne(id);
        if (rule.status !== client_1.AnalyticStatus.DRAFT) {
            throw new common_1.BadRequestException("Only DRAFT auto-analytical rules can be updated");
        }
        const hasCondition = (dto.partnerTagId !== null && (dto.partnerTagId || rule.partnerTagId)) ||
            (dto.partnerId !== null && (dto.partnerId || rule.partnerId)) ||
            (dto.productCategoryId !== null &&
                (dto.productCategoryId || rule.productCategoryId)) ||
            (dto.productId !== null && (dto.productId || rule.productId));
        if (!hasCondition) {
            throw new common_1.BadRequestException("At least one match condition must be provided");
        }
        if (dto.analyticalAccountId) {
            const analyticalAccount = await this.prisma.analyticalAccount.findUnique({
                where: { id: dto.analyticalAccountId },
            });
            if (!analyticalAccount) {
                throw new common_1.NotFoundException(`Analytical account with ID ${dto.analyticalAccountId} not found`);
            }
        }
        const updatedData = Object.assign(Object.assign({}, rule), dto);
        const priority = this.calculatePriority(updatedData);
        return this.prisma.autoAnalyticalRule.update({
            where: { id },
            data: Object.assign(Object.assign({}, dto), { priority }),
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
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
        const rule = await this.findOne(id);
        if (rule.status !== client_1.AnalyticStatus.DRAFT) {
            throw new common_1.BadRequestException("Only DRAFT auto-analytical rules can be confirmed");
        }
        return this.prisma.autoAnalyticalRule.update({
            where: { id },
            data: { status: client_1.AnalyticStatus.CONFIRMED },
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
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
        const rule = await this.findOne(id);
        if (rule.status !== client_1.AnalyticStatus.CONFIRMED) {
            throw new common_1.BadRequestException("Only CONFIRMED auto-analytical rules can be archived");
        }
        return this.prisma.autoAnalyticalRule.update({
            where: { id },
            data: { status: client_1.AnalyticStatus.ARCHIVED },
            include: {
                partnerTag: true,
                partner: true,
                productCategory: true,
                product: true,
                analyticalAccount: true,
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
    calculatePriority(data) {
        let priority = 0;
        if (data.partnerTagId)
            priority++;
        if (data.partnerId)
            priority++;
        if (data.productCategoryId)
            priority++;
        if (data.productId)
            priority++;
        return priority;
    }
};
exports.AutoAnalyticalRuleService = AutoAnalyticalRuleService;
exports.AutoAnalyticalRuleService = AutoAnalyticalRuleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoAnalyticalRuleService);
//# sourceMappingURL=auto-analytical-rule.service.js.map