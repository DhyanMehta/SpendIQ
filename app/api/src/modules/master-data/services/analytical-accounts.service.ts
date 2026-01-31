import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateAnalyticalAccountDto } from "../dto/create-analytical-account.dto";

@Injectable()
export class AnalyticalAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnalyticalAccountDto) {
    return this.prisma.analyticalAccount.create({
      data: dto,
    });
  }

  async findAll() {
    // Return tree structure or flat list?
    // For now, flat list with parent info. Frontend can build tree.
    return this.prisma.analyticalAccount.findMany({
      include: { parent: true, children: true },
      orderBy: { code: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.analyticalAccount.findUnique({
      where: { id },
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
