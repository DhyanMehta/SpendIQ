import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
import { FilterBudgetDto } from "./dto/filter-budget.dto";
import { BudgetStatus, BudgetType, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new budget in DRAFT status
   */
  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    const {
      name,
      startDate,
      endDate,
      analyticAccountId,
      budgetType,
      budgetedAmount,
    } = createBudgetDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException("End date must be after start date");
    }

    // Validate analytic account exists
    const analyticAccount = await this.prisma.analyticalAccount.findUnique({
      where: { id: analyticAccountId },
    });

    if (!analyticAccount) {
      throw new NotFoundException(
        `Analytic account with ID ${analyticAccountId} not found`,
      );
    }

    // Create budget
    const budget = await this.prisma.budget.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        analyticAccountId,
        budgetType,
        budgetedAmount: new Decimal(budgetedAmount),
        status: BudgetStatus.DRAFT,
        createdBy: userId,
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

    return this.formatBudgetResponse(budget);
  }

  /**
   * Find all budgets with filters
   */
  async findAll(filters: FilterBudgetDto) {
    const {
      search,
      status,
      budgetType,
      analyticAccountId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const where: Prisma.BudgetWhereInput = {};

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filter by status (default: exclude ARCHIVED)
    if (status) {
      where.status = status;
    } else {
      where.status = {
        not: BudgetStatus.ARCHIVED,
      };
    }

    // Filter by budget type
    if (budgetType) {
      where.budgetType = budgetType;
    }

    // Filter by analytic account
    if (analyticAccountId) {
      where.analyticAccountId = analyticAccountId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.AND = [];

      if (startDate) {
        where.AND.push({
          startDate: {
            gte: new Date(startDate),
          },
        });
      }

      if (endDate) {
        where.AND.push({
          endDate: {
            lte: new Date(endDate),
          },
        });
      }
    }

    const skip = (page - 1) * limit;

    const [budgets, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.budget.count({ where }),
    ]);

    // Compute actuals for CONFIRMED budgets
    const budgetsWithActuals = await Promise.all(
      budgets.map(async (budget) => {
        if (budget.status === BudgetStatus.CONFIRMED) {
          const actuals = await this.computeActuals(budget.id);
          return { ...this.formatBudgetResponse(budget), ...actuals };
        }
        return this.formatBudgetResponse(budget);
      }),
    );

    return {
      data: budgetsWithActuals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one budget by ID
   */
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

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Compute actuals for CONFIRMED budgets
    if (budget.status === BudgetStatus.CONFIRMED) {
      const actuals = await this.computeActuals(id);
      return { ...this.formatBudgetResponse(budget), ...actuals };
    }

    return this.formatBudgetResponse(budget);
  }

  /**
   * Update a budget (only DRAFT budgets can be edited)
   */
  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    // Only DRAFT budgets can be edited
    if (budget.status !== BudgetStatus.DRAFT) {
      throw new ForbiddenException("Only DRAFT budgets can be edited");
    }

    const { startDate, endDate, budgetedAmount, ...rest } = updateBudgetDto;

    const updateData: Prisma.BudgetUpdateInput = { ...rest };

    if (startDate) {
      updateData.startDate = new Date(startDate);
    }

    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    if (budgetedAmount !== undefined) {
      updateData.budgetedAmount = new Decimal(budgetedAmount);
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        throw new BadRequestException("End date must be after start date");
      }
    }

    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: updateData,
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

    return this.formatBudgetResponse(updatedBudget);
  }

  /**
   * Confirm a budget (change status to CONFIRMED, lock editing)
   */
  async confirm(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException("Only DRAFT budgets can be confirmed");
    }

    const confirmedBudget = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.CONFIRMED,
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

    // Compute actuals
    const actuals = await this.computeActuals(id);

    return { ...this.formatBudgetResponse(confirmedBudget), ...actuals };
  }

  /**
   * Revise a budget (create new version, mark old as REVISED)
   */
  async revise(id: string, userId: string) {
    const oldBudget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!oldBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    if (oldBudget.status !== BudgetStatus.CONFIRMED) {
      throw new BadRequestException("Only CONFIRMED budgets can be revised");
    }

    // Create new budget with copied fields
    const newBudget = await this.prisma.budget.create({
      data: {
        name: `${oldBudget.name} (Rev ${new Date().toLocaleDateString("en-GB")})`,
        startDate: oldBudget.startDate,
        endDate: oldBudget.endDate,
        analyticAccountId: oldBudget.analyticAccountId,
        budgetType: oldBudget.budgetType,
        budgetedAmount: oldBudget.budgetedAmount,
        status: BudgetStatus.DRAFT,
        revisionOfId: oldBudget.id,
        createdBy: userId,
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
        revisionOf: true,
      },
    });

    // Mark old budget as REVISED
    await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.REVISED,
      },
    });

    return this.formatBudgetResponse(newBudget);
  }

  /**
   * Archive a budget
   */
  async archive(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const archivedBudget = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.ARCHIVED,
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

    return this.formatBudgetResponse(archivedBudget);
  }

  /**
   * Compute actual amount from posted transactions
   *
   * CRITICAL: Only reads from POSTED invoices, never drafts
   */
  async computeActuals(budgetId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    // Query posted invoice lines for this analytic account and period
    const result = await this.prisma.$queryRaw<
      Array<{ total: Decimal | null }>
    >`
      SELECT COALESCE(SUM(
        CASE 
          WHEN i.type IN ('OUT_INVOICE', 'IN_REFUND') THEN il.subtotal
          WHEN i.type IN ('IN_INVOICE', 'OUT_REFUND') THEN -il.subtotal
          ELSE 0
        END
      ), 0) as total
      FROM invoice_lines il
      JOIN invoices i ON il."invoiceId" = i.id
      WHERE il."analyticAccountId" = ${budget.analyticAccountId}
        AND i.status = 'POSTED'
        AND i.date >= ${budget.startDate}
        AND i.date <= ${budget.endDate}
    `;

    const actualAmount = result[0]?.total
      ? parseFloat(result[0].total.toString())
      : 0;

    const budgetedAmount = parseFloat(budget.budgetedAmount.toString());

    // Calculate metrics
    const achievedPercentage =
      budgetedAmount > 0 ? (actualAmount / budgetedAmount) * 100 : 0;

    const remainingAmount = budgetedAmount - actualAmount;
    const isOverBudget = actualAmount > budgetedAmount;

    return {
      actualAmount: Math.round(actualAmount * 100) / 100,
      achievedPercentage: Math.round(achievedPercentage * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      isOverBudget,
    };
  }

  /**
   * Get drill-down transactions for a budget
   */
  async getDrillDown(budgetId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: "POSTED",
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        lines: {
          some: {
            analyticAccountId: budget.analyticAccountId,
          },
        },
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
        lines: {
          where: {
            analyticAccountId: budget.analyticAccountId,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date.toISOString(),
      partnerId: invoice.partnerId,
      partner: invoice.partner,
      amount: parseFloat(invoice.totalAmount.toString()),
      type: invoice.type,
      lines: invoice.lines.map((line) => ({
        id: line.id,
        label: line.label,
        quantity: parseFloat(line.quantity.toString()),
        priceUnit: parseFloat(line.priceUnit.toString()),
        subtotal: parseFloat(line.subtotal.toString()),
      })),
    }));
  }

  /**
   * Check if a new transaction would exceed budget
   */
  async checkOverBudget(analyticAccountId: string, amount: number) {
    // Find active budgets for this analytic account
    const now = new Date();

    const budgets = await this.prisma.budget.findMany({
      where: {
        analyticAccountId,
        status: BudgetStatus.CONFIRMED,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
    });

    const warnings = [];

    for (const budget of budgets) {
      const actuals = await this.computeActuals(budget.id);
      const projectedTotal = actuals.actualAmount + amount;
      const budgetedAmount = parseFloat(budget.budgetedAmount.toString());

      if (projectedTotal > budgetedAmount) {
        warnings.push({
          budgetId: budget.id,
          budgetName: budget.name,
          budgetedAmount,
          currentActual: actuals.actualAmount,
          projectedTotal,
          excessAmount: projectedTotal - budgetedAmount,
        });
      }
    }

    return warnings;
  }

  /**
   * Format budget response
   */
  private formatBudgetResponse(budget: any) {
    return {
      ...budget,
      budgetedAmount: parseFloat(budget.budgetedAmount.toString()),
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
    };
  }
}
