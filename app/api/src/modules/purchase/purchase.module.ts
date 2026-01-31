import { Module } from "@nestjs/common";
import { PurchaseOrdersService } from "./purchase-orders.service";
import { PurchaseOrdersController } from "./purchase-orders.controller";
import { VendorBillsService } from "./vendor-bills.service";
import { VendorBillsController } from "./vendor-bills.controller";
import { DatabaseModule } from "../../common/database/database.module";
import { BudgetingModule } from "../budgeting/budgeting.module";

@Module({
  imports: [DatabaseModule, BudgetingModule],
  controllers: [PurchaseOrdersController, VendorBillsController],
  providers: [PurchaseOrdersService, VendorBillsService],
})
export class PurchaseModule {}
