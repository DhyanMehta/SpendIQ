import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { AnalyticalAccountsService } from "./services/analytical-accounts.service";
import { AutoAnalyticalService } from "./services/auto-analytical.service";
import { PrismaService } from "../../common/database/prisma.service";
import { AnalyticalAccountsController } from "./controllers/analytical-accounts.controller";
import { AutoAnalyticalRulesController } from "./controllers/auto-analytical-rules.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticalAccountsController, AutoAnalyticalRulesController],
  providers: [AnalyticalAccountsService, AutoAnalyticalService, PrismaService],
  exports: [AnalyticalAccountsService, AutoAnalyticalService],
})
export class MasterDataModule {}
