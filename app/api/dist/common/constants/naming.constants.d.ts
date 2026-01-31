export declare const AUTH: {
    readonly JWT_SUBJECT: "sub";
    readonly USER_ID: "id";
    readonly TOKEN_STORAGE_KEY: "accessToken";
    readonly AUTH_HEADER: "Authorization";
    readonly AUTH_SCHEME: "Bearer";
};
export declare const PARTNER: {
    readonly DB_FIELD: "partnerId";
    readonly VENDOR_EXTERNAL: "vendorId";
    readonly CUSTOMER_EXTERNAL: "customerId";
};
export declare const ANALYTIC_ACCOUNT: {
    readonly CANONICAL: "analyticAccountId";
    readonly LEGACY_PO_LINE: "analyticalAccountId";
};
export declare const PRICE: {
    readonly EXTERNAL: "unitPrice";
    readonly INTERNAL: "priceUnit";
};
export declare const DATE: {
    readonly DB_FIELD: "date";
    readonly BILL_EXTERNAL: "billDate";
    readonly PAYMENT_EXTERNAL: "paymentDate";
    readonly ORDER_EXTERNAL: "orderDate";
};
export declare const AMOUNT: {
    readonly TOTAL: "totalAmount";
    readonly TAX: "taxAmount";
    readonly BUDGETED: "budgetedAmount";
    readonly PAYMENT: "paymentAmount";
    readonly ALLOCATED: "allocatedAmount";
    readonly SUBTOTAL: "subtotal";
};
export declare const PAYMENT_METHOD: {
    readonly EXTERNAL: "paymentMethod";
    readonly INTERNAL: "method";
};
export declare const STATUS: {
    readonly BUDGET: {
        readonly DRAFT: "DRAFT";
        readonly CONFIRMED: "CONFIRMED";
        readonly REVISED: "REVISED";
        readonly ARCHIVED: "ARCHIVED";
    };
    readonly INVOICE: {
        readonly DRAFT: "DRAFT";
        readonly POSTED: "POSTED";
        readonly CANCELLED: "CANCELLED";
    };
    readonly PAYMENT: {
        readonly DRAFT: "DRAFT";
        readonly POSTED: "POSTED";
        readonly CANCELLED: "CANCELLED";
    };
    readonly PAYMENT_STATE: {
        readonly NOT_PAID: "NOT_PAID";
        readonly PARTIAL: "PARTIAL";
        readonly PAID: "PAID";
    };
    readonly ENTITY: {
        readonly ACTIVE: "ACTIVE";
        readonly ARCHIVED: "ARCHIVED";
    };
};
export declare const INVOICE_TYPE: {
    readonly VENDOR_BILL: "IN_INVOICE";
    readonly CUSTOMER_INVOICE: "OUT_INVOICE";
    readonly VENDOR_REFUND: "IN_REFUND";
    readonly CUSTOMER_REFUND: "OUT_REFUND";
};
export declare const PAYMENT_TYPE: {
    readonly VENDOR_PAYMENT: "OUTBOUND";
    readonly CUSTOMER_PAYMENT: "INBOUND";
};
export declare const NAMING: {
    readonly AUTH: {
        readonly JWT_SUBJECT: "sub";
        readonly USER_ID: "id";
        readonly TOKEN_STORAGE_KEY: "accessToken";
        readonly AUTH_HEADER: "Authorization";
        readonly AUTH_SCHEME: "Bearer";
    };
    readonly PARTNER: {
        readonly DB_FIELD: "partnerId";
        readonly VENDOR_EXTERNAL: "vendorId";
        readonly CUSTOMER_EXTERNAL: "customerId";
    };
    readonly ANALYTIC_ACCOUNT: {
        readonly CANONICAL: "analyticAccountId";
        readonly LEGACY_PO_LINE: "analyticalAccountId";
    };
    readonly PRICE: {
        readonly EXTERNAL: "unitPrice";
        readonly INTERNAL: "priceUnit";
    };
    readonly DATE: {
        readonly DB_FIELD: "date";
        readonly BILL_EXTERNAL: "billDate";
        readonly PAYMENT_EXTERNAL: "paymentDate";
        readonly ORDER_EXTERNAL: "orderDate";
    };
    readonly AMOUNT: {
        readonly TOTAL: "totalAmount";
        readonly TAX: "taxAmount";
        readonly BUDGETED: "budgetedAmount";
        readonly PAYMENT: "paymentAmount";
        readonly ALLOCATED: "allocatedAmount";
        readonly SUBTOTAL: "subtotal";
    };
    readonly PAYMENT_METHOD: {
        readonly EXTERNAL: "paymentMethod";
        readonly INTERNAL: "method";
    };
    readonly STATUS: {
        readonly BUDGET: {
            readonly DRAFT: "DRAFT";
            readonly CONFIRMED: "CONFIRMED";
            readonly REVISED: "REVISED";
            readonly ARCHIVED: "ARCHIVED";
        };
        readonly INVOICE: {
            readonly DRAFT: "DRAFT";
            readonly POSTED: "POSTED";
            readonly CANCELLED: "CANCELLED";
        };
        readonly PAYMENT: {
            readonly DRAFT: "DRAFT";
            readonly POSTED: "POSTED";
            readonly CANCELLED: "CANCELLED";
        };
        readonly PAYMENT_STATE: {
            readonly NOT_PAID: "NOT_PAID";
            readonly PARTIAL: "PARTIAL";
            readonly PAID: "PAID";
        };
        readonly ENTITY: {
            readonly ACTIVE: "ACTIVE";
            readonly ARCHIVED: "ARCHIVED";
        };
    };
    readonly INVOICE_TYPE: {
        readonly VENDOR_BILL: "IN_INVOICE";
        readonly CUSTOMER_INVOICE: "OUT_INVOICE";
        readonly VENDOR_REFUND: "IN_REFUND";
        readonly CUSTOMER_REFUND: "OUT_REFUND";
    };
    readonly PAYMENT_TYPE: {
        readonly VENDOR_PAYMENT: "OUTBOUND";
        readonly CUSTOMER_PAYMENT: "INBOUND";
    };
};
export default NAMING;
