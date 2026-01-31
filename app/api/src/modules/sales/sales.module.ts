import { Module } from "@nestjs/common";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { InvoicesModule } from "../invoices/invoices.module";
import { DatabaseModule } from "../../common/database/database.module";

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [DatabaseModule, InvoicesModule],
  exports: [SalesService],
})
export class SalesModule {}
