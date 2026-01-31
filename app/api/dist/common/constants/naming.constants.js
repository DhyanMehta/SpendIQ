"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAMING = exports.PAYMENT_TYPE = exports.INVOICE_TYPE = exports.STATUS = exports.PAYMENT_METHOD = exports.AMOUNT = exports.DATE = exports.PRICE = exports.ANALYTIC_ACCOUNT = exports.PARTNER = exports.AUTH = void 0;
exports.AUTH = {
    JWT_SUBJECT: 'sub',
    USER_ID: 'id',
    TOKEN_STORAGE_KEY: 'accessToken',
    AUTH_HEADER: 'Authorization',
    AUTH_SCHEME: 'Bearer',
};
exports.PARTNER = {
    DB_FIELD: 'partnerId',
    VENDOR_EXTERNAL: 'vendorId',
    CUSTOMER_EXTERNAL: 'customerId',
};
exports.ANALYTIC_ACCOUNT = {
    CANONICAL: 'analyticAccountId',
    LEGACY_PO_LINE: 'analyticalAccountId',
};
exports.PRICE = {
    EXTERNAL: 'unitPrice',
    INTERNAL: 'priceUnit',
};
exports.DATE = {
    DB_FIELD: 'date',
    BILL_EXTERNAL: 'billDate',
    PAYMENT_EXTERNAL: 'paymentDate',
    ORDER_EXTERNAL: 'orderDate',
};
exports.AMOUNT = {
    TOTAL: 'totalAmount',
    TAX: 'taxAmount',
    BUDGETED: 'budgetedAmount',
    PAYMENT: 'paymentAmount',
    ALLOCATED: 'allocatedAmount',
    SUBTOTAL: 'subtotal',
};
exports.PAYMENT_METHOD = {
    EXTERNAL: 'paymentMethod',
    INTERNAL: 'method',
};
exports.STATUS = {
    BUDGET: {
        DRAFT: 'DRAFT',
        CONFIRMED: 'CONFIRMED',
        REVISED: 'REVISED',
        ARCHIVED: 'ARCHIVED',
    },
    INVOICE: {
        DRAFT: 'DRAFT',
        POSTED: 'POSTED',
        CANCELLED: 'CANCELLED',
    },
    PAYMENT: {
        DRAFT: 'DRAFT',
        POSTED: 'POSTED',
        CANCELLED: 'CANCELLED',
    },
    PAYMENT_STATE: {
        NOT_PAID: 'NOT_PAID',
        PARTIAL: 'PARTIAL',
        PAID: 'PAID',
    },
    ENTITY: {
        ACTIVE: 'ACTIVE',
        ARCHIVED: 'ARCHIVED',
    },
};
exports.INVOICE_TYPE = {
    VENDOR_BILL: 'IN_INVOICE',
    CUSTOMER_INVOICE: 'OUT_INVOICE',
    VENDOR_REFUND: 'IN_REFUND',
    CUSTOMER_REFUND: 'OUT_REFUND',
};
exports.PAYMENT_TYPE = {
    VENDOR_PAYMENT: 'OUTBOUND',
    CUSTOMER_PAYMENT: 'INBOUND',
};
exports.NAMING = {
    AUTH: exports.AUTH,
    PARTNER: exports.PARTNER,
    ANALYTIC_ACCOUNT: exports.ANALYTIC_ACCOUNT,
    PRICE: exports.PRICE,
    DATE: exports.DATE,
    AMOUNT: exports.AMOUNT,
    PAYMENT_METHOD: exports.PAYMENT_METHOD,
    STATUS: exports.STATUS,
    INVOICE_TYPE: exports.INVOICE_TYPE,
    PAYMENT_TYPE: exports.PAYMENT_TYPE,
};
exports.default = exports.NAMING;
//# sourceMappingURL=naming.constants.js.map