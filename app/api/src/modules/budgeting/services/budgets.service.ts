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

/**
 * Budgets Service
 *
 * Handles all budget-related business logic including:
 * - Creating new budgets linked to analytic accounts
 * - Updating draft budgets
 * - Approving budgets (DRAFT -> CONFIRMED)
 * - Creating revisions of confirmed budgets
 *
 * Budget Workflow:
 * DRAFT -> CONFIRMED -> REVISED (when revision created)
 *                    -> ARCHIVED (manual)
 */
@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new budget
   *
   * Creates a budget in DRAFT status linked to a specific analytic account.
   * Budgets track planned amounts for income or expense categories.
   *
   * @param userId - ID of the user creating the budget
   * @param dto - Budget creation data
   * @returns Created budget with relations
   *
   * @example
   * create('user-123', {
   *   name: 'Marketing Q1',
   *   startDate: '2024-01-01',
   *   endDate: '2024-03-31',
   *   analyticAccountId: 'analytic-123',
   *   budgetType: 'EXPENSE',
   *   budgetedAmount: 50000
   * })
   */
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

  /**
   * Find all budgets with optional filters
   *
   * @param status - Optional filter by budget status
   * @param analyticAccountId - Optional filter by analytic account
   * @returns Array of budgets with relations, ordered by creation date desc
   */
  async findAll(status?: string, analyticAccountId?: string, userId?: string) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        status: status as BudgetStatus,
        analyticAccountId: analyticAccountId || undefined,
        createdBy: userId || undefined,
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

  /**
   * Find a single budget by ID
   *
   * @param id - Budget ID
   * @returns Budget with all relations including revision chain
   * @throws NotFoundException if budget doesn't exist
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
    if (!budget) throw new NotFoundException("Budget not found");
    return budget;
  }

  /**
   * Approve a draft budget
   *
   * Changes status from DRAFT to CONFIRMED.
   * Confirmed budgets cannot be edited directly - use createRevision instead.
   *
   * @param id - Budget ID to approve
   * @returns Updated budget with CONFIRMED status
   */
  async approve(id: string) {
    return this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.CONFIRMED },
    });
  }

  /**
   * Update an existing draft budget
   *
   * Only DRAFT budgets can be updated. For CONFIRMED budgets,
   * use the createRevision method instead.
   *
   * @param id - Budget ID to update
   * @param dto - Updated budget data
   * @returns Updated budget with relations
   * @throws BadRequestException if budget is not in DRAFT status
   */
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

  /**
   * Create a revision of a confirmed budget
   *
   * This method:
   * 1. Creates a new budget in DRAFT status linked to the original
   * 2. Marks the original budget as REVISED (read-only)
   *
   * Only CONFIRMED budgets can be revised. DRAFT budgets should
   * be edited directly using the update method.
   *
   * @param id - ID of the budget to revise (must be CONFIRMED)
   * @param userId - ID of the user creating the revision
   * @param dto - New budget data for the revision
   * @returns Newly created revision budget
   * @throws BadRequestException if original is not CONFIRMED
   */
  async createRevision(id: string, userId: string, dto: CreateBudgetDto) {
    const oldBudget = await this.findOne(id);

    if (oldBudget.status !== BudgetStatus.CONFIRMED) {
      throw new BadRequestException(
        "Can only revise confirmed budgets. Edit the draft directly.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create new budget version linked to the original
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

      // Mark old budget as REVISED (read-only historical record)
      await tx.budget.update({
        where: { id: oldBudget.id },
        data: { status: BudgetStatus.REVISED },
      });

      return newBudget;
    });
  }

  /**
   * Check budget availability for a transaction
   * 
   * Checks if there is an active budget for the given analytic account
   * and if the amount can be accommodated within the remaining budget.
   * 
   * @param analyticAccountId - ID of the analytic account
   * @param amount - Amount to check against the budget
   * @param date - Date of the transaction
   * @returns Object containing whether budget is available and remaining amount
   */
  async checkBudgetAvailability(
    analyticAccountId: string,
    amount: number,
    date: Date,
  ): Promise<{ available: boolean; remaining: number; budgetId?: string; message?: string }> {
    // Find active budget for the analytic account that covers the date
    const budget = await this.prisma.budget.findFirst({
      where: {
        analyticAccountId,
        status: BudgetStatus.CONFIRMED,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (!budget) {
      return { available: true, remaining: 0, message: "No budget configured for this category" };
    }

    // Calculate actual spent amount from posted invoices
    const actualSpent = await this.prisma.invoiceLine.aggregate({
      where: {
        analyticAccountId,
        invoice: {
          status: "POSTED",
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
      },
      _sum: {
        subtotal: true,
      },
    });

    const spent = Number(actualSpent._sum.subtotal || 0);
    const budgetedAmount = Number(budget.budgetedAmount);
    const remaining = budgetedAmount - spent;

    return {
      available: remaining >= amount,
      remaining,
      budgetId: budget.id,
      message: remaining >= amount 
        ? `Budget available: ₹${remaining.toFixed(2)} remaining`
        : `Budget exceeded: Only ₹${remaining.toFixed(2)} available, requested ₹${amount.toFixed(2)}`,
    };
  }
}
