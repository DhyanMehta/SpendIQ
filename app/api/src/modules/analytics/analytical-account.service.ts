import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateAnalyticalAccountDto } from "./dto/create-analytical-account.dto";
import { UpdateAnalyticalAccountDto } from "./dto/update-analytical-account.dto";
import { AnalyticStatus } from "@prisma/client";

@Injectable()
export class AnalyticalAccountService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper to get organization ID for a user
   */
  private async getOrganizationId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });
    return user?.organizationId || userId;
  }

  /**
   * List all analytical accounts (exclude archived by default)
   * Filtered by user's organization for data isolation
   */
  async findAll(userId: string, includeArchived = false) {
    const organizationId = await this.getOrganizationId(userId);
    const where: any = {
      creator: { organizationId },
    };

    if (!includeArchived) {
      where.status = { not: AnalyticStatus.ARCHIVED };
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

  /**
   * Get single analytical account by ID
   */
  async findOne(id: string) {
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
      throw new NotFoundException(`Analytical account with ID ${id} not found`);
    }

    return account;
  }

  /**
   * Create new analytical account (status: DRAFT)
   */
  async create(dto: CreateAnalyticalAccountDto, userId: string) {
    // Check if code is unique
    const existing = await this.prisma.analyticalAccount.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Analytical account with code "${dto.code}" already exists`,
      );
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.analyticalAccount.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent analytical account with ID ${dto.parentId} not found`,
        );
      }
    }

    return this.prisma.analyticalAccount.create({
      data: {
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId,
        status: AnalyticStatus.DRAFT,
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

  /**
   * Update analytical account (only allowed in DRAFT status)
   */
  async update(id: string, dto: UpdateAnalyticalAccountDto) {
    const account = await this.findOne(id);

    if (account.status !== AnalyticStatus.DRAFT) {
      throw new BadRequestException(
        "Only DRAFT analytical accounts can be updated",
      );
    }

    // Check code uniqueness if changing
    if (dto.code && dto.code !== account.code) {
      const existing = await this.prisma.analyticalAccount.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new BadRequestException(
          `Analytical account with code "${dto.code}" already exists`,
        );
      }
    }

    // Validate parent if changing
    if (dto.parentId !== undefined && dto.parentId !== account.parentId) {
      if (dto.parentId) {
        const parent = await this.prisma.analyticalAccount.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent analytical account with ID ${dto.parentId} not found`,
          );
        }

        // Prevent circular reference
        if (dto.parentId === id) {
          throw new BadRequestException(
            "An analytical account cannot be its own parent",
          );
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

  /**
   * Confirm analytical account (DRAFT → CONFIRMED)
   */
  async confirm(id: string) {
    const account = await this.findOne(id);

    if (account.status !== AnalyticStatus.DRAFT) {
      throw new BadRequestException(
        "Only DRAFT analytical accounts can be confirmed",
      );
    }

    return this.prisma.analyticalAccount.update({
      where: { id },
      data: { status: AnalyticStatus.CONFIRMED },
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

  /**
   * Archive analytical account (CONFIRMED → ARCHIVED)
   */
  async archive(id: string) {
    const account = await this.findOne(id);

    if (account.status !== AnalyticStatus.CONFIRMED) {
      throw new BadRequestException(
        "Only CONFIRMED analytical accounts can be archived",
      );
    }

    return this.prisma.analyticalAccount.update({
      where: { id },
      data: { status: AnalyticStatus.ARCHIVED },
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
}
