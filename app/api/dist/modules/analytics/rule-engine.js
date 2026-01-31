"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngine = void 0;
const client_1 = require("@prisma/client");
class RuleEngine {
    static applyAnalyticalRules(context, rules) {
        if (context.manualAnalyticalAccountId) {
            return {
                analyticalAccountId: context.manualAnalyticalAccountId,
                source: "MANUAL",
            };
        }
        const confirmedRules = rules.filter((rule) => rule.status === client_1.AnalyticStatus.CONFIRMED);
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
        if (context.productDefaultAnalyticalAccountId) {
            return {
                analyticalAccountId: context.productDefaultAnalyticalAccountId,
                source: "PRODUCT_DEFAULT",
            };
        }
        return {
            analyticalAccountId: null,
            source: "NONE",
        };
    }
    static findBestMatchingRule(context, rules) {
        let bestMatch = null;
        let bestMatchCount = 0;
        for (const rule of rules) {
            const matchCount = this.countMatches(context, rule);
            const totalConditions = this.countRuleConditions(rule);
            if (matchCount === totalConditions && matchCount > 0) {
                if (matchCount > bestMatchCount) {
                    bestMatch = rule;
                    bestMatchCount = matchCount;
                }
            }
        }
        return bestMatch;
    }
    static countMatches(context, rule) {
        var _a;
        let matches = 0;
        if (rule.partnerTagId) {
            if ((_a = context.partnerTags) === null || _a === void 0 ? void 0 : _a.includes(rule.partnerTagId)) {
                matches++;
            }
            else {
                return 0;
            }
        }
        if (rule.partnerId) {
            if (context.partnerId === rule.partnerId) {
                matches++;
            }
            else {
                return 0;
            }
        }
        if (rule.productCategoryId) {
            if (context.productCategoryId === rule.productCategoryId) {
                matches++;
            }
            else {
                return 0;
            }
        }
        if (rule.productId) {
            if (context.productId === rule.productId) {
                matches++;
            }
            else {
                return 0;
            }
        }
        return matches;
    }
    static countRuleConditions(rule) {
        let count = 0;
        if (rule.partnerTagId)
            count++;
        if (rule.partnerId)
            count++;
        if (rule.productCategoryId)
            count++;
        if (rule.productId)
            count++;
        return count;
    }
}
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=rule-engine.js.map