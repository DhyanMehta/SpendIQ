import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { Status } from "@prisma/client";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Gets the organization ID for the user (for multi-tenant data isolation).
   * All users in the same organization share the same data.
   */
  private async getOrganizationId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    return user?.organizationId || null;
  }

  async create(createProductDto: CreateProductDto, userId?: string) {
    // Get organization for data isolation
    const organizationId = userId ? await this.getOrganizationId(userId) : null;

    // Handle category (create if name provided, use ID otherwise)
    let categoryId = createProductDto.categoryId;

    if (createProductDto.categoryName && !categoryId) {
      // Find or create category scoped to organization
      let category = await this.prisma.productCategory.findFirst({
        where: {
          name: createProductDto.categoryName,
          organizationId: organizationId,
        },
      });

      if (!category) {
        category = await this.prisma.productCategory.create({
          data: {
            name: createProductDto.categoryName,
            organizationId: organizationId,
            createdById: userId,
          },
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

  async findAll(query: ProductQueryDto, userId?: string) {
    // Get organization for data isolation
    const organizationId = userId ? await this.getOrganizationId(userId) : null;

    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }

    // Filter by organization for data isolation
    if (organizationId) {
      where.createdById = organizationId;
    } else if (userId) {
      // Fallback to user-based filtering if no organization
      where.createdById = userId;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    } else {
      // Default: only show active products
      where.status = Status.ACTIVE;
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

  async findOne(id: string) {
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
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId?: string,
  ) {
    await this.findOne(id);

    // Get organization for data isolation
    const organizationId = userId ? await this.getOrganizationId(userId) : null;

    // Handle category update
    let categoryId = updateProductDto.categoryId;

    if (updateProductDto.categoryName && !categoryId) {
      // Find or create category scoped to organization
      let category = await this.prisma.productCategory.findFirst({
        where: {
          name: updateProductDto.categoryName,
          organizationId: organizationId,
        },
      });

      if (!category) {
        category = await this.prisma.productCategory.create({
          data: {
            name: updateProductDto.categoryName,
            organizationId: organizationId,
            createdById: userId,
          },
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

  async archive(id: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        status: Status.ARCHIVED,
      },
    });
  }

  // Category management
  async getCategories(userId?: string) {
    // Get organization for data isolation
    const organizationId = userId ? await this.getOrganizationId(userId) : null;

    const where: any = {};

    // Filter categories by organization for data isolation
    if (organizationId) {
      where.organizationId = organizationId;
    }
    return this.prisma.productCategory.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });
  }

  async createCategory(name: string, userId?: string) {
    // Get organization for data isolation
    const organizationId = userId ? await this.getOrganizationId(userId) : null;

    // Check for existing category in this organization
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        name,
        organizationId: organizationId,
      },
    });

    if (existing) {
      throw new ConflictException("Category already exists");
    }

    return this.prisma.productCategory.create({
      data: {
        name,
        organizationId: organizationId,
        createdById: userId,
      },
    });
  }
}
