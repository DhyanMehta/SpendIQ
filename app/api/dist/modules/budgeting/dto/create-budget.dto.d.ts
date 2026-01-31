export declare enum BudgetType {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}
export declare class CreateBudgetDto {
    name: string;
    startDate: string;
    endDate: string;
    analyticAccountId: string;
    budgetType: BudgetType;
    budgetedAmount: number;
}
