import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateAutoAnalyticalRuleDto } from "./dto/create-auto-analytical-rule.dto";
import { UpdateAutoAnalyticalRuleDto } from "./dto/update-auto-analytical-rule.dto";
import { AnalyticStatus } from "@prisma/client";

@Injectable()
export class AutoAnalyticalRuleService {
  constructor(private prisma: PrismaService) {}

  /**
   * List all auto-analytical rules (exclude archived by default)
   */
  async findAll(includeArchived = false) {
    const where: any = {};

    if (!includeArchived) {
      where.status = { not: AnalyticStatus.ARCHIVED };
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

  /**
   * Get single auto-analytical rule by ID
   */
  async findOne(id: string) {
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
      throw new NotFoundException(
        `Auto-analytical rule with ID ${id} not found`,
      );
    }

    return rule;
  }

  /**
   * Create new auto-analytical rule (status: DRAFT)
   */
  async create(dto: CreateAutoAnalyticalRuleDto, userId: string) {
    // Validate at least one match condition is provided
    if (
      !dto.partnerTagId &&
      !dto.partnerId &&
      !dto.productCategoryId &&
      !dto.productId
    ) {
      throw new BadRequestException(
        "At least one match condition must be provided",
      );
    }

    // Validate analytical account exists
    const analyticalAccount = await this.prisma.analyticalAccount.findUnique({
      where: { id: dto.analyticalAccountId },
    });

    if (!analyticalAccount) {
      throw new NotFoundException(
        `Analytical account with ID ${dto.analyticalAccountId} not found`,
      );
    }

    // Calculate priority based on number of fields matched
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
        status: AnalyticStatus.DRAFT,
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

  /**
   * Update auto-analytical rule (only allowed in DRAFT status)
   */
  async update(id: string, dto: UpdateAutoAnalyticalRuleDto) {
    const rule = await this.findOne(id);

    if (rule.status !== AnalyticStatus.DRAFT) {
      throw new BadRequestException(
        "Only DRAFT auto-analytical rules can be updated",
      );
    }

    // Validate at least one match condition remains
    const hasCondition =
      (dto.partnerTagId !== null && (dto.partnerTagId || rule.partnerTagId)) ||
      (dto.partnerId !== null && (dto.partnerId || rule.partnerId)) ||
      (dto.productCategoryId !== null &&
        (dto.productCategoryId || rule.productCategoryId)) ||
      (dto.productId !== null && (dto.productId || rule.productId));

    if (!hasCondition) {
      throw new BadRequestException(
        "At least one match condition must be provided",
      );
    }

    // Validate analytical account if changing
    if (dto.analyticalAccountId) {
      const analyticalAccount = await this.prisma.analyticalAccount.findUnique({
        where: { id: dto.analyticalAccountId },
      });

      if (!analyticalAccount) {
        throw new NotFoundException(
          `Analytical account with ID ${dto.analyticalAccountId} not found`,
        );
      }
    }

    // Recalculate priority
    const updatedData = { ...rule, ...dto };
    const priority = this.calculatePriority(updatedData);

    return this.prisma.autoAnalyticalRule.update({
      where: { id },
      data: {
        ...dto,
        priority,
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

  /**
   * Confirm auto-analytical rule (DRAFT → CONFIRMED)
   */
  async confirm(id: string) {
    const rule = await this.findOne(id);

    if (rule.status !== AnalyticStatus.DRAFT) {
      throw new BadRequestException(
        "Only DRAFT auto-analytical rules can be confirmed",
      );
    }

    return this.prisma.autoAnalyticalRule.update({
      where: { id },
      data: { status: AnalyticStatus.CONFIRMED },
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

  /**
   * Archive auto-analytical rule (CONFIRMED → ARCHIVED)
   */
  async archive(id: string) {
    const rule = await this.findOne(id);

    if (rule.status !== AnalyticStatus.CONFIRMED) {
      throw new BadRequestException(
        "Only CONFIRMED auto-analytical rules can be archived",
      );
    }

    return this.prisma.autoAnalyticalRule.update({
      where: { id },
      data: { status: AnalyticStatus.ARCHIVED },
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

  /**
   * Calculate priority based on number of match conditions
   * More specific rules (more conditions) have higher priority
   */
  private calculatePriority(data: any): number {
    let priority = 0;

    if (data.partnerTagId) priority++;
    if (data.partnerId) priority++;
    if (data.productCategoryId) priority++;
    if (data.productId) priority++;

    return priority;
  }
}
