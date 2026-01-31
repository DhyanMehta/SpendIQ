import { Module, forwardRef } from "@nestjs/common";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { DatabaseModule } from "../../common/database/database.module";
import { AccountingModule } from "../accounting/accounting.module";
import { BudgetingModule } from "../budgeting/budgeting.module";
import { SalesModule } from "../sales/sales.module";

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],
  imports: [
    DatabaseModule,
    forwardRef(() => AccountingModule),
    forwardRef(() => BudgetingModule),
    forwardRef(() => SalesModule),
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}
