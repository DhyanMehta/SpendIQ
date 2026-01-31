import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { Decimal } from "@prisma/client/runtime/library";

// Local enum until Prisma Client is regenerated
enum BudgetStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  REVISED = "REVISED",
  ARCHIVED = "ARCHIVED",
}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        analyticAccountId: dto.analyticAccountId,
        budgetType: dto.budgetType,
        budgetedAmount: new Decimal(dto.budgetedAmount),
        createdBy: userId,
        status: BudgetStatus.DRAFT,
      },
      include: {
        analyticAccount: true,
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

  async findAll(status?: string, analyticAccountId?: string) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        status: status as any,
        analyticAccountId: analyticAccountId || undefined,
      },
      include: {
        analyticAccount: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return budgets;
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        analyticAccount: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        revisionOf: true,
        revisedBy: true,
      },
    });
    if (!budget) throw new NotFoundException("Budget not found");
    return budget;
  }

  async approve(id: string) {
    return this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.CONFIRMED },
    });
  }

  async update(id: string, dto: CreateBudgetDto) {
    const existingBudget = await this.findOne(id);

    if (existingBudget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException(
        "Can only update draft budgets. Use revise endpoint for confirmed budgets.",
      );
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        analyticAccountId: dto.analyticAccountId,
        budgetType: dto.budgetType,
        budgetedAmount: new Decimal(dto.budgetedAmount),
      },
      include: {
        analyticAccount: true,
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

  async createRevision(id: string, userId: string, dto: CreateBudgetDto) {
    const oldBudget = await this.findOne(id);

    if (oldBudget.status !== BudgetStatus.CONFIRMED) {
      throw new BadRequestException(
        "Can only revise confirmed budgets. Edit the draft directly.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create new budget version
      const newBudget = await tx.budget.create({
        data: {
          name: `${dto.name} (Rev ${new Date().toLocaleDateString()})`,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          analyticAccountId: dto.analyticAccountId,
          budgetType: dto.budgetType,
          budgetedAmount: new Decimal(dto.budgetedAmount),
          createdBy: userId,
          status: BudgetStatus.DRAFT,
          revisionOfId: oldBudget.id,
        },
      });

      // Mark old budget as REVISED
      await tx.budget.update({
        where: { id: oldBudget.id },
        data: { status: BudgetStatus.REVISED },
      });

      return newBudget;
    });
  }
}
