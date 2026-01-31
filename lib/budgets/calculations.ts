/**
 * Budget Computation Logic
 *
 * This module contains pure functions for budget calculations.
 * All calculations are deterministic and testable.
 *
 * IMPORTANT: Actuals are computed ONLY from POSTED transactions.
 */

import { Decimal } from "@prisma/client/runtime/library";

export interface BudgetActuals {
  budgetedAmount: number;
  actualAmount: number;
  achievedPercentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
}

/**
 * Compute budget actuals from budgeted and actual amounts
 *
 * @param budgetedAmount - The planned/budgeted amount
 * @param actualAmount - The actual amount from posted transactions
 * @returns Budget actuals with percentage, remaining, and over-budget flag
 */
export function computeBudgetActuals(
  budgetedAmount: number | Decimal,
  actualAmount: number | Decimal,
): BudgetActuals {
  // Convert Decimal to number if needed
  const budgeted =
    typeof budgetedAmount === "number"
      ? budgetedAmount
      : parseFloat(budgetedAmount.toString());

  const actual =
    typeof actualAmount === "number"
      ? actualAmount
      : parseFloat(actualAmount.toString());

  // Calculate achieved percentage
  // Avoid division by zero
  const achievedPercentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

  // Calculate remaining amount
  const remainingAmount = budgeted - actual;

  // Check if over budget
  const isOverBudget = actual > budgeted;

  return {
    budgetedAmount: budgeted,
    actualAmount: actual,
    achievedPercentage: Math.round(achievedPercentage * 100) / 100, // Round to 2 decimals
    remainingAmount: Math.round(remainingAmount * 100) / 100,
    isOverBudget,
  };
}

/**
 * Format currency for display
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format percentage for display
 *
 * @param percentage - Percentage to format
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

/**
 * Get budget status color based on achieved percentage
 *
 * @param achievedPercentage - Percentage of budget achieved
 * @returns Color code for UI
 */
export function getBudgetStatusColor(achievedPercentage: number): string {
  if (achievedPercentage >= 100) return "red"; // Over budget
  if (achievedPercentage >= 90) return "yellow"; // Warning
  if (achievedPercentage >= 75) return "orange"; // Caution
  return "green"; // On track
}

/**
 * Check if a new transaction would exceed budget
 *
 * @param budgetedAmount - The planned/budgeted amount
 * @param currentActual - Current actual amount
 * @param newTransactionAmount - Amount of new transaction
 * @returns Object with warning flag and projected total
 */
export function checkOverBudgetWarning(
  budgetedAmount: number,
  currentActual: number,
  newTransactionAmount: number,
): { willExceed: boolean; projectedTotal: number; excessAmount: number } {
  const projectedTotal = currentActual + newTransactionAmount;
  const willExceed = projectedTotal > budgetedAmount;
  const excessAmount = willExceed ? projectedTotal - budgetedAmount : 0;

  return {
    willExceed,
    projectedTotal,
    excessAmount,
  };
}
