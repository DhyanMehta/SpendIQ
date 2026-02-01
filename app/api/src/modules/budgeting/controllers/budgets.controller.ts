import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Patch,
  Request,
} from "@nestjs/common";
import { BudgetsService } from "../services/budgets.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { BudgetStatus, Role } from "@prisma/client";
import { JwtAuthGuard } from "../../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

/**
 * Budgets Controller
 *
 * Manages budget CRUD operations including creation, updates, approval, and revision workflow.
 * Budgets track planned spending/income for specific analytic accounts (cost centers).
 *
 * Workflow:
 * 1. Create DRAFT budget
 * 2. Edit while in DRAFT status
 * 3. Approve (DRAFT -> CONFIRMED)
 * 4. Revise CONFIRMED budget (creates new DRAFT, marks old as REVISED)
 */
@Controller("budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) { }

  /**
   * Create a new budget
   * @param req - Request containing authenticated user
   * @param dto - Budget creation data (name, dates, analyticAccountId, budgetType, amount)
   * @returns Created budget with relations
   */
  @Post()
  @Roles(Role.ADMIN)
  create(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.id, dto);
  }

  /**
   * Create a revision of an existing CONFIRMED budget
   * Marks the original budget as REVISED and creates a new DRAFT version.
   * @param req - Request containing authenticated user
   * @param id - ID of the budget to revise (must be CONFIRMED)
   * @param dto - New budget data for the revision
   * @returns Newly created budget revision
   */
  @Post(":id/revise")
  @Roles(Role.ADMIN)
  revise(
    @Request() req,
    @Param("id") id: string,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetsService.createRevision(id, req.user.id, dto);
  }

  /**
   * Approve a DRAFT budget (changes status to CONFIRMED)
   * Only DRAFT budgets can be approved. CONFIRMED budgets start tracking actuals.
   * @param id - Budget ID to approve
   * @returns Updated budget with CONFIRMED status
   */
  @Patch(":id/approve")
  @Roles(Role.ADMIN)
  approve(@Param("id") id: string) {
    return this.budgetsService.approve(id);
  }

  /**
   * Update an existing DRAFT budget
   * Only DRAFT budgets can be edited. Use /revise for CONFIRMED budgets.
   * @param id - Budget ID to update
   * @param dto - Updated budget data
   * @returns Updated budget with relations
   */
  @Put(":id")
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.update(id, dto);
  }

  /**
   * Get all budgets with optional filters
   * @param status - Filter by budget status (DRAFT, CONFIRMED, REVISED, ARCHIVED)
   * @param analyticAccountId - Filter by analytic account (cost center)
   * @returns Array of budgets matching the filters
   */
  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query("status") status?: BudgetStatus,
    @Query("analyticAccountId") analyticAccountId?: string,
  ) {
    return this.budgetsService.findAll(status, analyticAccountId, user.id);
  }

  /**
   * Get a single budget by ID
   * @param id - Budget ID
   * @returns Budget with all relations (analyticAccount, creator, revisions)
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.budgetsService.findOne(id);
  }

  /**
   * Archive a budget (changes status to ARCHIVED)
   * @param id - Budget ID to archive
   * @returns Updated budget with ARCHIVED status
   */
  @Patch(":id/archive")
  @Roles(Role.ADMIN)
  archive(@Param("id") id: string) {
    return this.budgetsService.archive(id);
  }
}
