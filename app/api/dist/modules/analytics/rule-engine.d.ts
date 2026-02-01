import { AutoAnalyticalRule } from "@prisma/client";
export interface TransactionLineContext {
    partnerId?: string;
    partnerTags?: string[];
    productId?: string;
    productCategoryId?: string;
    manualAnalyticalAccountId?: string;
    productDefaultAnalyticalAccountId?: string;
}
export interface RuleMatchResult {
    analyticalAccountId: string | null;
    ruleId?: string;
    source: "MANUAL" | "AUTO_RULE" | "PRODUCT_DEFAULT" | "NONE";
    matchedFields?: number;
    ruleName?: string;
}
export declare class RuleEngine {
    static applyAnalyticalRules(context: TransactionLineContext, rules: AutoAnalyticalRule[]): RuleMatchResult;
    private static findBestMatchingRule;
    private static countMatches;
    private static countRuleConditions;
}
