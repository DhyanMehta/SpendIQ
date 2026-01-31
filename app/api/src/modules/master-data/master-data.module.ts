import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { AnalyticalAccountsService } from "./services/analytical-accounts.service";
import { PrismaService } from "../../common/database/prisma.service";
import { AnalyticalAccountsController } from "./controllers/analytical-accounts.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticalAccountsController],
  providers: [AnalyticalAccountsService, PrismaService],
  exports: [AnalyticalAccountsService],
})
export class MasterDataModule {}
