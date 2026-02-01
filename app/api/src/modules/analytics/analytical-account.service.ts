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

    // Debug logging
    console.log("[AnalyticalAccountService] findAll called");
    console.log("[AnalyticalAccountService] userId:", userId);
    console.log("[AnalyticalAccountService] organizationId:", organizationId);

    // Fetch all accounts with creator info
    const allAccounts = await this.prisma.analyticalAccount.findMany({
      include: {
        parent: true,
        children: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            organizationId: true,
          },
        },
      },
      orderBy: [{ code: "asc" }],
    });

    console.log(
      "[AnalyticalAccountService] Total accounts in DB:",
      allAccounts.length,
    );

    // Filter by organization in memory
    const filteredAccounts = allAccounts.filter((account) => {
      // If account has no creator, skip it
      if (!account.creator) {
        console.log(
          "[AnalyticalAccountService] Account",
          account.code,
          "has no creator",
        );
        return false;
      }

      // Check if creator's organizationId matches
      const creatorOrgId = account.creator.organizationId || account.creator.id;
      const matches = creatorOrgId === organizationId;

      console.log(
        "[AnalyticalAccountService] Account",
        account.code,
        "creator org:",
        creatorOrgId,
        "user org:",
        organizationId,
        "matches:",
        matches,
      );

      // Apply archived filter if needed
      if (!includeArchived && account.status === "ARCHIVED") {
        return false;
      }

      return matches;
    });

    console.log(
      "[AnalyticalAccountService] Filtered to",
      filteredAccounts.length,
      "accounts",
    );

    return filteredAccounts;
  }

  /**
   * Get single analytical account by ID
   */
  async findOne(id: string, userId?: string) {
    const where: any = { id };

    // Add organization filtering if userId provided
    if (userId) {
      const organizationId = await this.getOrganizationId(userId);
      if (organizationId) {
        where.OR = [
          { createdById: organizationId },
          { creator: { organizationId: organizationId } },
        ];
      } else {
        where.createdById = userId;
      }
    }

    const account = await this.prisma.analyticalAccount.findFirst({
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
