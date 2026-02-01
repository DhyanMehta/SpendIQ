import { Module } from "@nestjs/common";
import { JournalEntriesService } from "./services/journal-entries.service";
import { JournalEntriesController } from "./controllers/journal-entries.controller";
import { AccountsService } from "./services/accounts.service";
import { AccountsController } from "./controllers/accounts.controller";
import { PrismaService } from "../../common/database/prisma.service";

@Module({
  controllers: [JournalEntriesController, AccountsController],
  providers: [JournalEntriesService, AccountsService, PrismaService],
  exports: [JournalEntriesService, AccountsService],
})
export class AccountingModule {}
