import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticalAccountController } from "./analytical-account.controller";
import { AnalyticalAccountService } from "./analytical-account.service";
import { AutoAnalyticalRuleController } from "./auto-analytical-rule.controller";
import { AutoAnalyticalRuleService } from "./auto-analytical-rule.service";
import { PrismaService } from "../../common/database/prisma.service";

@Module({
  controllers: [
    AnalyticsController,
    AnalyticalAccountController,
    AutoAnalyticalRuleController,
  ],
  providers: [
    AnalyticsService,
    AnalyticalAccountService,
    AutoAnalyticalRuleService,
    PrismaService,
  ],
  exports: [
    AnalyticsService,
    AnalyticalAccountService,
    AutoAnalyticalRuleService,
  ],
})
export class AnalyticsModule {}
