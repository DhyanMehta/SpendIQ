export declare enum BudgetTypeFilter {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
    ALL = "ALL"
}
export declare enum StatusFilter {
    WITHIN_BUDGET = "WITHIN_BUDGET",
    OVER_BUDGET = "OVER_BUDGET",
    ALL = "ALL"
}
export declare class AnalyticsFiltersDto {
    startDate: string;
    endDate: string;
    analyticAccountId?: string;
    budgetType?: BudgetTypeFilter;
    status?: StatusFilter;
}
