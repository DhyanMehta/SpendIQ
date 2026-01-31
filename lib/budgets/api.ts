/**
 * Budget API Client
 *
 * Frontend API client for budget operations
 */

import { apiRequest } from "../api";

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  analyticAccountId: string;
  analyticAccount?: {
    id: string;
    code: string;
    name: string;
  };
  budgetType: "INCOME" | "EXPENSE";
  budgetedAmount: number;
  status: "DRAFT" | "CONFIRMED" | "REVISED" | "ARCHIVED";
  revisionOfId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Computed fields (only for CONFIRMED budgets)
  actualAmount?: number;
  achievedPercentage?: number;
  remainingAmount?: number;
  isOverBudget?: boolean;
}

export interface CreateBudgetData {
  name: string;
  startDate: string;
  endDate: string;
  analyticAccountId: string;
  budgetType: "INCOME" | "EXPENSE";
  budgetedAmount: number;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  status?: "DRAFT" | "CONFIRMED" | "REVISED" | "ARCHIVED";
}

export interface BudgetFilters {
  search?: string;
  status?: "DRAFT" | "CONFIRMED" | "REVISED" | "ARCHIVED";
  budgetType?: "INCOME" | "EXPENSE";
  analyticAccountId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BudgetTransaction {
  id: string;
  number: string;
  date: string;
  partnerId: string;
  partner: {
    id: string;
    name: string;
  };
  amount: number;
  type: string;
}

/**
 * Fetch all budgets with optional filters
 */
export async function fetchBudgets(filters?: BudgetFilters): Promise<Budget[]> {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.budgetType) params.append("budgetType", filters.budgetType);
  if (filters?.analyticAccountId)
    params.append("analyticAccountId", filters.analyticAccountId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/budgets?${queryString}` : "/budgets";

  return apiRequest(url);
}

/**
 * Fetch a single budget by ID
 */
export async function fetchBudget(id: string): Promise<Budget> {
  return apiRequest(`/budgets/${id}`);
}

/**
 * Create a new budget
 */
export async function createBudget(data: CreateBudgetData): Promise<Budget> {
  return apiRequest("/budgets", {
    method: "POST",
    body: data,
  });
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  data: UpdateBudgetData,
): Promise<Budget> {
  return apiRequest(`/budgets/${id}`, {
    method: "PUT",
    body: data,
  });
}

/**
 * Confirm a budget (change status to CONFIRMED)
 */
export async function confirmBudget(id: string): Promise<Budget> {
  return apiRequest(`/budgets/${id}/confirm`, {
    method: "POST",
  });
}

/**
 * Revise a budget (create new version, mark old as REVISED)
 */
export async function reviseBudget(id: string): Promise<Budget> {
  return apiRequest(`/budgets/${id}/revise`, {
    method: "POST",
  });
}

/**
 * Archive a budget
 */
export async function archiveBudget(id: string): Promise<Budget> {
  return apiRequest(`/budgets/${id}/archive`, {
    method: "DELETE",
  });
}

/**
 * Get drill-down transactions for a budget
 */
export async function fetchBudgetDrillDown(
  id: string,
): Promise<BudgetTransaction[]> {
  return apiRequest(`/budgets/${id}/drill-down`);
}
