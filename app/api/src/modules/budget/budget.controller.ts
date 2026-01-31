import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { BudgetService } from "./budget.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
import { FilterBudgetDto } from "./dto/filter-budget.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Budget Master is ADMIN-ONLY
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  /**
   * GET /budgets
   * List all budgets with optional filters
   */
  @Get()
  async findAll(@Query() filters: FilterBudgetDto) {
    return this.budgetService.findAll(filters);
  }

  /**
   * GET /budgets/:id
   * Get a single budget by ID
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.budgetService.findOne(id);
  }

  /**
   * POST /budgets
   * Create a new budget
   */
  @Post()
  async create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetService.create(createBudgetDto, req.user.userId);
  }

  /**
   * PUT /budgets/:id
   * Update a budget (only DRAFT budgets)
   */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(id, updateBudgetDto);
  }

  /**
   * POST /budgets/:id/confirm
   * Confirm a budget (change status to CONFIRMED)
   */
  @Post(":id/confirm")
  async confirm(@Param("id") id: string) {
    return this.budgetService.confirm(id);
  }

  /**
   * POST /budgets/:id/revise
   * Create a revision of a budget
   */
  @Post(":id/revise")
  async revise(@Param("id") id: string, @Request() req) {
    return this.budgetService.revise(id, req.user.userId);
  }

  /**
   * DELETE /budgets/:id/archive
   * Archive a budget
   */
  @Delete(":id/archive")
  async archive(@Param("id") id: string) {
    return this.budgetService.archive(id);
  }

  /**
   * GET /budgets/:id/drill-down
   * Get drill-down transactions for a budget
   */
  @Get(":id/drill-down")
  async getDrillDown(@Param("id") id: string) {
    return this.budgetService.getDrillDown(id);
  }

  /**
   * POST /budgets/check-over-budget
   * Check if a transaction would exceed budget
   */
  @Post("check-over-budget")
  async checkOverBudget(
    @Body() body: { analyticAccountId: string; amount: number },
  ) {
    return this.budgetService.checkOverBudget(
      body.analyticAccountId,
      body.amount,
    );
  }
}
