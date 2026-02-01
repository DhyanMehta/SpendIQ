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
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
// import { VendorBillsModule } from "./modules/vendor-bills/vendor-bills.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { SalesModule } from "./modules/sales/sales.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { UsersModule } from "./modules/users/users.module";

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

    PurchaseModule, // Centralized Purchase Module
    AnalyticsModule,
    // VendorBillsModule, // Merged into PurchaseModule or to be refactored
    PaymentsModule,
    SalesModule,
    InvoicesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
