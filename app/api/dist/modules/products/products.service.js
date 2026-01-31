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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto, userId) {
        let categoryId = createProductDto.categoryId;
        if (createProductDto.categoryName && !categoryId) {
            let category = await this.prisma.productCategory.findFirst({
                where: { name: createProductDto.categoryName },
            });
            if (!category) {
                category = await this.prisma.productCategory.create({
                    data: { name: createProductDto.categoryName },
                });
            }
            categoryId = category.id;
        }
        const product = await this.prisma.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description,
                salesPrice: createProductDto.salesPrice,
                purchasePrice: createProductDto.purchasePrice,
                categoryId,
                defaultAnalyticAccountId: createProductDto.defaultAnalyticAccountId,
                createdById: userId,
            },
            include: {
                category: true,
                defaultAnalyticAccount: true,
            },
        });
        return product;
    }
    async findAll(query, userId) {
        const where = {};
        if (query.search) {
            where.name = { contains: query.search, mode: "insensitive" };
        }
        if (userId) {
            where.createdById = userId;
        }
        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }
        if (query.status) {
            where.status = query.status;
        }
        else {
            where.status = client_1.Status.ACTIVE;
        }
        return this.prisma.product.findMany({
            where,
            include: {
                category: true,
                defaultAnalyticAccount: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                defaultAnalyticAccount: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException("Product not found");
        }
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        let categoryId = updateProductDto.categoryId;
        if (updateProductDto.categoryName && !categoryId) {
            let category = await this.prisma.productCategory.findFirst({
                where: { name: updateProductDto.categoryName },
            });
            if (!category) {
                category = await this.prisma.productCategory.create({
                    data: { name: updateProductDto.categoryName },
                });
            }
            categoryId = category.id;
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                name: updateProductDto.name,
                description: updateProductDto.description,
                salesPrice: updateProductDto.salesPrice,
                purchasePrice: updateProductDto.purchasePrice,
                categoryId,
                defaultAnalyticAccountId: updateProductDto.defaultAnalyticAccountId,
                status: updateProductDto.status,
            },
            include: {
                category: true,
                defaultAnalyticAccount: true,
            },
        });
        return updated;
    }
    async archive(id) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                status: client_1.Status.ARCHIVED,
            },
        });
    }
    async getCategories() {
        return this.prisma.productCategory.findMany({
            orderBy: {
                name: "asc",
            },
        });
    }
    async createCategory(name) {
        const existing = await this.prisma.productCategory.findFirst({
            where: { name },
        });
        if (existing) {
            throw new common_1.ConflictException("Category already exists");
        }
        return this.prisma.productCategory.create({
            data: { name },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map