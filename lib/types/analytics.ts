/**
 * Analytics TypeScript types for frontend
 */

export enum AnalyticStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  ARCHIVED = "ARCHIVED",
}

export interface AnalyticalAccount {
  id: string;
  code: string;
  name: string;
  status: AnalyticStatus;
  parentId: string | null;
  parent?: AnalyticalAccount | null;
  children?: AnalyticalAccount[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AutoAnalyticalRule {
  id: string;
  name: string;
  status: AnalyticStatus;

  // Match conditions (optional)
  partnerTagId: string | null;
  partnerTag?: {
    id: string;
    name: string;
    color: string | null;
  } | null;

  partnerId: string | null;
  partner?: {
    id: string;
    name: string;
    email: string | null;
  } | null;

  productCategoryId: string | null;
  productCategory?: {
    id: string;
    name: string;
  } | null;

  productId: string | null;
  product?: {
    id: string;
    name: string;
    sku: string | null;
  } | null;

  // Output
  analyticalAccountId: string;
  analyticalAccount?: AnalyticalAccount;

  // Auto-calculated
  priority: number;

  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// DTOs for API calls
export interface CreateAnalyticalAccountDto {
  code: string;
  name: string;
  parentId?: string;
}

export interface UpdateAnalyticalAccountDto {
  code?: string;
  name?: string;
  parentId?: string | null;
}

export interface CreateAutoAnalyticalRuleDto {
  name: string;
  partnerTagId?: string;
  partnerId?: string;
  productCategoryId?: string;
  productId?: string;
  analyticalAccountId: string;
}

export interface UpdateAutoAnalyticalRuleDto {
  name?: string;
  partnerTagId?: string | null;
  partnerId?: string | null;
  productCategoryId?: string | null;
  productId?: string | null;
  analyticalAccountId?: string;
}
