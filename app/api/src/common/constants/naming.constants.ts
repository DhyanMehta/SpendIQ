/**
 * @fileoverview Canonical Naming Constants for SpendIQ Backend
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * This file is the SINGLE SOURCE OF TRUTH for all naming conventions.
 * When editing any file in the backend, use these constants to ensure
 * consistent naming. Add new constants here before using them elsewhere.
 * ============================================================================
 *
 * This file defines the canonical names for all concepts in the SpendIQ
 * backend. The purpose is to eliminate naming inconsistencies where the
 * same logical concept has multiple variable names across the codebase.
 *
 * RULES:
 * 1. Each concept has EXACTLY ONE canonical name
 * 2. External API may use semantic names (vendorId for vendor APIs)
 * 3. Internal code must map to database field names
 * 4. All mappings are documented with @external and @internal tags
 *
 * @module common/constants/naming
 */

/**
 * Authentication and Authorization naming conventions
 *
 * JWT tokens use the standard "sub" claim for user ID.
 * After validation, the user object uses "id" property.
 *
 * @example
 * // In JWT payload
 * const payload = { sub: user.id, email: user.email, role: user.role };
 *
 * // After validation (in req.user)
 * const userId = req.user.id; // NOT req.user.userId or req.user.sub
 */
export const AUTH = {
    /** JWT standard claim for subject (user ID) */
    JWT_SUBJECT: 'sub',

    /** User ID property after JWT validation */
    USER_ID: 'id',

    /** LocalStorage key for access token (frontend) */
    TOKEN_STORAGE_KEY: 'accessToken',

    /** Authorization header format */
    AUTH_HEADER: 'Authorization',
    AUTH_SCHEME: 'Bearer',
} as const;

/**
 * Partner/Contact reference naming conventions
 *
 * The database uses "partnerId" for all contact references in transactions.
 * However, external APIs use semantic names for clarity:
 * - "vendorId" for vendor-specific endpoints (bills, POs, vendor payments)
 * - "customerId" for customer-specific endpoints (sales, customer invoices)
 *
 * @example
 * // DTO (external API)
 * class CreateVendorBillDto {
 *   vendorId: string; // Semantic name for clarity
 * }
 *
 * // Service (mapping to database)
 * await prisma.invoice.create({
 *   data: {
 *     partnerId: dto.vendorId, // Map to canonical DB field
 *   }
 * });
 */
export const PARTNER = {
    /** @internal Database field name for all partner references */
    DB_FIELD: 'partnerId',

    /** @external API field for vendor-specific endpoints */
    VENDOR_EXTERNAL: 'vendorId',

    /** @external API field for customer-specific endpoints */
    CUSTOMER_EXTERNAL: 'customerId',
} as const;

/**
 * Analytic Account reference naming conventions
 *
 * IMPORTANT: The database schema has an inconsistency:
 * - Most models use "analyticAccountId" (Budget, InvoiceLine, JournalEntryLine)
 * - PurchaseOrderLine uses "analyticalAccountId" (with extra 'al')
 *
 * CANONICAL NAME: "analyticAccountId" (without the extra 'al')
 * The PurchaseOrderLine schema needs a migration to fix this.
 *
 * @example
 * // Correct (canonical)
 * analyticAccountId: string;
 *
 * // Legacy (PurchaseOrderLine only - needs migration)
 * analyticalAccountId: string;
 */
export const ANALYTIC_ACCOUNT = {
    /** @canonical Standard field name (use this for new code) */
    CANONICAL: 'analyticAccountId',

    /** @deprecated Legacy name in PurchaseOrderLine - needs migration */
    LEGACY_PO_LINE: 'analyticalAccountId',
} as const;

/**
 * Price field naming conventions
 *
 * External APIs (DTOs) use "unitPrice" for clarity.
 * The InvoiceLine database model uses "priceUnit".
 * Services must map between these at the boundary.
 *
 * @example
 * // DTO
 * class LineDto {
 *   unitPrice: number;
 * }
 *
 * // Mapping to database
 * await prisma.invoiceLine.create({
 *   data: {
 *     priceUnit: dto.unitPrice, // Map external to internal
 *   }
 * });
 */
export const PRICE = {
    /** @external DTO field name for unit price */
    EXTERNAL: 'unitPrice',

    /** @internal Database field name (InvoiceLine.priceUnit) */
    INTERNAL: 'priceUnit',
} as const;

/**
 * Date field naming conventions
 *
 * Database uses "date" for transaction dates.
 * External APIs use semantic names for clarity:
 * - "billDate" for vendor bills
 * - "paymentDate" for payments
 * - "orderDate" for purchase orders
 *
 * @example
 * // DTO
 * class CreateVendorBillDto {
 *   billDate: Date;
 * }
 *
 * // Mapping to database
 * await prisma.invoice.create({
 *   data: {
 *     date: dto.billDate, // Map semantic to canonical
 *   }
 * });
 */
export const DATE = {
    /** @internal Database field for transaction date */
    DB_FIELD: 'date',

    /** @external Vendor bill date in DTO */
    BILL_EXTERNAL: 'billDate',

    /** @external Payment date in DTO */
    PAYMENT_EXTERNAL: 'paymentDate',

    /** @external Order date in DTO */
    ORDER_EXTERNAL: 'orderDate',
} as const;

/**
 * Amount field naming conventions
 *
 * Different contexts use different amount field names.
 * These are all intentionally different (not inconsistent).
 */
export const AMOUNT = {
    /** Total transaction amount */
    TOTAL: 'totalAmount',

    /** Tax amount */
    TAX: 'taxAmount',

    /** Budgeted amount for budget records */
    BUDGETED: 'budgetedAmount',

    /** Payment amount in payment DTOs */
    PAYMENT: 'paymentAmount',

    /** Allocated amount in payment allocations */
    ALLOCATED: 'allocatedAmount',

    /** Line subtotal */
    SUBTOTAL: 'subtotal',
} as const;

/**
 * Payment method field naming conventions
 *
 * External APIs use "paymentMethod" for clarity.
 * Database uses "method" for brevity.
 *
 * @example
 * // DTO
 * class CreatePaymentDto {
 *   paymentMethod: string; // CASH, BANK, UPI
 * }
 *
 * // Mapping to database
 * await prisma.payment.create({
 *   data: {
 *     method: dto.paymentMethod,
 *   }
 * });
 */
export const PAYMENT_METHOD = {
    /** @external DTO field name */
    EXTERNAL: 'paymentMethod',

    /** @internal Database field name */
    INTERNAL: 'method',
} as const;

/**
 * Status and state field naming conventions
 *
 * Different models use different status enums.
 * This documents the canonical values for each.
 */
export const STATUS = {
    /** Budget statuses */
    BUDGET: {
        DRAFT: 'DRAFT',
        CONFIRMED: 'CONFIRMED',
        REVISED: 'REVISED',
        ARCHIVED: 'ARCHIVED',
    },

    /** Invoice statuses */
    INVOICE: {
        DRAFT: 'DRAFT',
        POSTED: 'POSTED',
        CANCELLED: 'CANCELLED',
    },

    /** Payment statuses */
    PAYMENT: {
        DRAFT: 'DRAFT',
        POSTED: 'POSTED',
        CANCELLED: 'CANCELLED',
    },

    /** Payment states (separate from status) */
    PAYMENT_STATE: {
        NOT_PAID: 'NOT_PAID',
        PARTIAL: 'PARTIAL',
        PAID: 'PAID',
    },

    /** Contact/Product statuses */
    ENTITY: {
        ACTIVE: 'ACTIVE',
        ARCHIVED: 'ARCHIVED',
    },
} as const;

/**
 * Invoice type constants
 *
 * Maps semantic names to database enum values.
 */
export const INVOICE_TYPE = {
    /** Vendor bill (we owe money) */
    VENDOR_BILL: 'IN_INVOICE',

    /** Customer invoice (they owe us) */
    CUSTOMER_INVOICE: 'OUT_INVOICE',

    /** Vendor credit note */
    VENDOR_REFUND: 'IN_REFUND',

    /** Customer credit note */
    CUSTOMER_REFUND: 'OUT_REFUND',
} as const;

/**
 * Payment type constants
 *
 * Maps semantic names to database enum values.
 */
export const PAYMENT_TYPE = {
    /** Vendor payment (we pay them) */
    VENDOR_PAYMENT: 'OUTBOUND',

    /** Customer payment (they pay us) */
    CUSTOMER_PAYMENT: 'INBOUND',
} as const;

/**
 * Export all constants as a single namespace for easy importing
 *
 * @example
 * import { NAMING } from '../common/constants/naming.constants';
 * const field = NAMING.PARTNER.DB_FIELD; // 'partnerId'
 */
export const NAMING = {
    AUTH,
    PARTNER,
    ANALYTIC_ACCOUNT,
    PRICE,
    DATE,
    AMOUNT,
    PAYMENT_METHOD,
    STATUS,
    INVOICE_TYPE,
    PAYMENT_TYPE,
} as const;

export default NAMING;
