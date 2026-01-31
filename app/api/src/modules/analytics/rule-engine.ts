import { AutoAnalyticalRule, AnalyticStatus } from "@prisma/client";

/**
 * Context for a transaction line that needs analytic assignment
 */
export interface TransactionLineContext {
  partnerId?: string;
  partnerTags?: string[]; // Array of tag IDs from the partner
  productId?: string;
  productCategoryId?: string;
  manualAnalyticalAccountId?: string;
  productDefaultAnalyticalAccountId?: string;
}

/**
 * Result of rule matching
 */
export interface RuleMatchResult {
  analyticalAccountId: string | null;
  ruleId?: string;
  source: "MANUAL" | "AUTO_RULE" | "PRODUCT_DEFAULT" | "NONE";
  matchedFields?: number;
  ruleName?: string;
}

/**
 * Rule engine for automatic analytical account assignment
 *
 * Priority logic:
 * 1. Manual analytic (if provided) - highest priority
 * 2. Most specific confirmed rule (most fields matched)
 * 3. Product default analytic
 * 4. None (allowed)
 */
export class RuleEngine {
  /**
   * Apply analytical rules to determine which analytic account to use
   */
  static applyAnalyticalRules(
    context: TransactionLineContext,
    rules: AutoAnalyticalRule[],
  ): RuleMatchResult {
    // Priority 1: Manual analytic always wins
    if (context.manualAnalyticalAccountId) {
      return {
        analyticalAccountId: context.manualAnalyticalAccountId,
        source: "MANUAL",
      };
    }

    // Priority 2: Find most specific confirmed rule
    const confirmedRules = rules.filter(
      (rule) => rule.status === AnalyticStatus.CONFIRMED,
    );

    const matchedRule = this.findBestMatchingRule(context, confirmedRules);

    if (matchedRule) {
      return {
        analyticalAccountId: matchedRule.analyticalAccountId,
        ruleId: matchedRule.id,
        source: "AUTO_RULE",
        matchedFields: matchedRule.priority,
        ruleName: matchedRule.name,
      };
    }

    // Priority 3: Product default analytic
    if (context.productDefaultAnalyticalAccountId) {
      return {
        analyticalAccountId: context.productDefaultAnalyticalAccountId,
        source: "PRODUCT_DEFAULT",
      };
    }

    // Priority 4: No analytic (allowed)
    return {
      analyticalAccountId: null,
      source: "NONE",
    };
  }

  /**
   * Find the best matching rule based on specificity
   * Returns the rule with the most matched fields (highest priority)
   */
  private static findBestMatchingRule(
    context: TransactionLineContext,
    rules: AutoAnalyticalRule[],
  ): AutoAnalyticalRule | null {
    let bestMatch: AutoAnalyticalRule | null = null;
    let bestMatchCount = 0;

    for (const rule of rules) {
      const matchCount = this.countMatches(context, rule);

      // A rule matches if ALL its conditions are met
      const totalConditions = this.countRuleConditions(rule);

      if (matchCount === totalConditions && matchCount > 0) {
        // This rule matches! Check if it's more specific than current best
        if (matchCount > bestMatchCount) {
          bestMatch = rule;
          bestMatchCount = matchCount;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Count how many conditions in the rule match the context
   */
  private static countMatches(
    context: TransactionLineContext,
    rule: AutoAnalyticalRule,
  ): number {
    let matches = 0;

    // Check partner tag match
    if (rule.partnerTagId) {
      if (context.partnerTags?.includes(rule.partnerTagId)) {
        matches++;
      } else {
        return 0; // Condition not met, rule doesn't match
      }
    }

    // Check partner match
    if (rule.partnerId) {
      if (context.partnerId === rule.partnerId) {
        matches++;
      } else {
        return 0; // Condition not met, rule doesn't match
      }
    }

    // Check product category match
    if (rule.productCategoryId) {
      if (context.productCategoryId === rule.productCategoryId) {
        matches++;
      } else {
        return 0; // Condition not met, rule doesn't match
      }
    }

    // Check product match
    if (rule.productId) {
      if (context.productId === rule.productId) {
        matches++;
      } else {
        return 0; // Condition not met, rule doesn't match
      }
    }

    return matches;
  }

  /**
   * Count total number of conditions in a rule
   */
  private static countRuleConditions(rule: AutoAnalyticalRule): number {
    let count = 0;

    if (rule.partnerTagId) count++;
    if (rule.partnerId) count++;
    if (rule.productCategoryId) count++;
    if (rule.productId) count++;

    return count;
  }
}
