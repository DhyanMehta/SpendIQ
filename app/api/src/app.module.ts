import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./modules/auth/auth.module";
import { MasterDataModule } from "./modules/master-data/master-data.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { ProductsModule } from "./modules/products/products.module";
import { BudgetingModule } from "./modules/budgeting/budgeting.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { PortalModule } from "./modules/portal/portal.module";
import { AccountingModule } from "./modules/accounting/accounting.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { PurchaseOrdersModule } from "./modules/purchase/purchase-orders.module";
// import { AnalyticsModule } from "./modules/analytics/analytics.module"; // Temporarily disabled - Budget model needs to be updated
import { VendorBillsModule } from "./modules/vendor-bills/vendor-bills.module";
import { PaymentsModule } from "./modules/payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    MasterDataModule,
    ContactsModule,
    ProductsModule,
    BudgetingModule,
    TransactionsModule,
    PortalModule,
    AccountingModule,
    DashboardModule,
    PurchaseOrdersModule,
    // AnalyticsModule, // Temporarily disabled - Budget model needs to be updated
    VendorBillsModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
