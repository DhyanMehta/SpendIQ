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
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: string) {
    // Handle category (create if name provided, use ID otherwise)
    let categoryId = createProductDto.categoryId;

    if (createProductDto.categoryName && !categoryId) {
      // Find or create category
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

  async findAll(query: ProductQueryDto, userId?: string) {
    const where: any = {};

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

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    // Handle category update
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
  async getCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async createCategory(name: string) {
    // Check for existing
    const existing = await this.prisma.productCategory.findFirst({
      where: { name },
    });

    if (existing) {
      throw new ConflictException("Category already exists");
    }

    return this.prisma.productCategory.create({
      data: { name },
    });
  }
}
