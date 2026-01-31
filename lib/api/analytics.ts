/**
 * Analytics API Client Functions
 *
 * Provides functions for interacting with the Analytics API endpoints
 */

import apiClient from "./client";
import type {
  AnalyticalAccount,
  AutoAnalyticalRule,
  CreateAnalyticalAccountDto,
  UpdateAnalyticalAccountDto,
  CreateAutoAnalyticalRuleDto,
  UpdateAutoAnalyticalRuleDto,
} from "../types/analytics";

// ============================================================================
// Analytical Account API Functions
// ============================================================================

/**
 * Get all analytical accounts
 * @param includeArchived - Whether to include archived accounts
 * @returns Promise resolving to array of analytical accounts
 */
export const getAnalyticalAccounts = async (
  includeArchived = false,
): Promise<AnalyticalAccount[]> => {
  const response = await apiClient.get("/analytical-accounts", {
    params: { includeArchived },
  });
  return response.data;
};

/**
 * Get a single analytical account by ID
 * @param id - Analytical account ID
 * @returns Promise resolving to analytical account
 */
export const getAnalyticalAccount = async (
  id: string,
): Promise<AnalyticalAccount> => {
  const response = await apiClient.get(`/analytical-accounts/${id}`);
  return response.data;
};

/**
 * Create a new analytical account
 * @param data - Analytical account creation data
 * @returns Promise resolving to created analytical account
 */
export const createAnalyticalAccount = async (
  data: CreateAnalyticalAccountDto,
): Promise<AnalyticalAccount> => {
  const response = await apiClient.post("/analytical-accounts", data);
  return response.data;
};

/**
 * Update an existing analytical account (only allowed in DRAFT status)
 * @param id - Analytical account ID
 * @param data - Analytical account update data
 * @returns Promise resolving to updated analytical account
 */
export const updateAnalyticalAccount = async (
  id: string,
  data: UpdateAnalyticalAccountDto,
): Promise<AnalyticalAccount> => {
  const response = await apiClient.patch(`/analytical-accounts/${id}`, data);
  return response.data;
};

/**
 * Confirm an analytical account (DRAFT → CONFIRMED)
 * @param id - Analytical account ID
 * @returns Promise resolving to confirmed analytical account
 */
export const confirmAnalyticalAccount = async (
  id: string,
): Promise<AnalyticalAccount> => {
  const response = await apiClient.patch(`/analytical-accounts/${id}/confirm`);
  return response.data;
};

/**
 * Archive an analytical account (CONFIRMED → ARCHIVED)
 * @param id - Analytical account ID
 * @returns Promise resolving to archived analytical account
 */
export const archiveAnalyticalAccount = async (
  id: string,
): Promise<AnalyticalAccount> => {
  const response = await apiClient.patch(`/analytical-accounts/${id}/archive`);
  return response.data;
};

// ============================================================================
// Auto-Analytical Rule API Functions
// ============================================================================

/**
 * Get all auto-analytical rules
 * @param includeArchived - Whether to include archived rules
 * @returns Promise resolving to array of auto-analytical rules
 */
export const getAutoAnalyticalRules = async (
  includeArchived = false,
): Promise<AutoAnalyticalRule[]> => {
  const response = await apiClient.get("/auto-analytical-rules", {
    params: { includeArchived },
  });
  return response.data;
};

/**
 * Get a single auto-analytical rule by ID
 * @param id - Auto-analytical rule ID
 * @returns Promise resolving to auto-analytical rule
 */
export const getAutoAnalyticalRule = async (
  id: string,
): Promise<AutoAnalyticalRule> => {
  const response = await apiClient.get(`/auto-analytical-rules/${id}`);
  return response.data;
};

/**
 * Create a new auto-analytical rule
 * @param data - Auto-analytical rule creation data
 * @returns Promise resolving to created auto-analytical rule
 */
export const createAutoAnalyticalRule = async (
  data: CreateAutoAnalyticalRuleDto,
): Promise<AutoAnalyticalRule> => {
  const response = await apiClient.post("/auto-analytical-rules", data);
  return response.data;
};

/**
 * Update an existing auto-analytical rule (only allowed in DRAFT status)
 * @param id - Auto-analytical rule ID
 * @param data - Auto-analytical rule update data
 * @returns Promise resolving to updated auto-analytical rule
 */
export const updateAutoAnalyticalRule = async (
  id: string,
  data: UpdateAutoAnalyticalRuleDto,
): Promise<AutoAnalyticalRule> => {
  const response = await apiClient.patch(`/auto-analytical-rules/${id}`, data);
  return response.data;
};

/**
 * Confirm an auto-analytical rule (DRAFT → CONFIRMED)
 * @param id - Auto-analytical rule ID
 * @returns Promise resolving to confirmed auto-analytical rule
 */
export const confirmAutoAnalyticalRule = async (
  id: string,
): Promise<AutoAnalyticalRule> => {
  const response = await apiClient.patch(
    `/auto-analytical-rules/${id}/confirm`,
  );
  return response.data;
};

/**
 * Archive an auto-analytical rule (CONFIRMED → ARCHIVED)
 * @param id - Auto-analytical rule ID
 * @returns Promise resolving to archived auto-analytical rule
 */
export const archiveAutoAnalyticalRule = async (
  id: string,
): Promise<AutoAnalyticalRule> => {
  const response = await apiClient.patch(
    `/auto-analytical-rules/${id}/archive`,
  );
  return response.data;
};
