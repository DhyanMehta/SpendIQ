"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const analytical_account_controller_1 = require("./analytical-account.controller");
const analytical_account_service_1 = require("./analytical-account.service");
const auto_analytical_rule_controller_1 = require("./auto-analytical-rule.controller");
const auto_analytical_rule_service_1 = require("./auto-analytical-rule.service");
const prisma_service_1 = require("../../common/database/prisma.service");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            analytics_controller_1.AnalyticsController,
            analytical_account_controller_1.AnalyticalAccountController,
            auto_analytical_rule_controller_1.AutoAnalyticalRuleController,
        ],
        providers: [
            analytics_service_1.AnalyticsService,
            analytical_account_service_1.AnalyticalAccountService,
            auto_analytical_rule_service_1.AutoAnalyticalRuleService,
            prisma_service_1.PrismaService,
        ],
        exports: [
            analytics_service_1.AnalyticsService,
            analytical_account_service_1.AnalyticalAccountService,
            auto_analytical_rule_service_1.AutoAnalyticalRuleService,
        ],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map