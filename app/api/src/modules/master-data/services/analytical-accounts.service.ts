import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateAnalyticalAccountDto } from "../dto/create-analytical-account.dto";

@Injectable()
export class AnalyticalAccountsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Gets the organization ID for the user (for multi-tenant data isolation).
   */
  private async getOrganizationId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    return user?.organizationId || null;
  }

  async create(dto: CreateAnalyticalAccountDto, userId?: string) {
    return this.prisma.analyticalAccount.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  async findAll(userId?: string) {
    // Build organization-based filter
    const where: any = {};

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

    // Return tree structure or flat list?
    // For now, flat list with parent info. Frontend can build tree.
    return this.prisma.analyticalAccount.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { code: "asc" },
    });
  }

  async findOne(id: string, userId?: string) {
    // Build organization-based filter
    const where: any = { id };

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

    return this.prisma.analyticalAccount.findFirst({
      where,
      include: {
        parent: true,
        children: true,
        budgets: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });
  }

  async getTree() {
    const allAccounts = await this.findAll();
    // Simple tree builder could go here, but usually better handled on frontend
    // or specifically requested.
    // Let's filter for root nodes (no parent) and include children recursively?
    // Prisma manual recursion is tricky. Stick to flat list for this API.
    return allAccounts;
  }
}
