"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./modules/auth/auth.module");
const master_data_module_1 = require("./modules/master-data/master-data.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const products_module_1 = require("./modules/products/products.module");
const budgeting_module_1 = require("./modules/budgeting/budgeting.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const portal_module_1 = require("./modules/portal/portal.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const purchase_module_1 = require("./modules/purchase/purchase.module");
const payments_module_1 = require("./modules/payments/payments.module");
const sales_module_1 = require("./modules/sales/sales.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const users_module_1 = require("./modules/users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule,
            master_data_module_1.MasterDataModule,
            contacts_module_1.ContactsModule,
            products_module_1.ProductsModule,
            budgeting_module_1.BudgetingModule,
            transactions_module_1.TransactionsModule,
            portal_module_1.PortalModule,
            accounting_module_1.AccountingModule,
            dashboard_module_1.DashboardModule,
            dashboard_module_1.DashboardModule,
            purchase_module_1.PurchaseModule,
            payments_module_1.PaymentsModule,
            sales_module_1.SalesModule,
            invoices_module_1.InvoicesModule,
            users_module_1.UsersModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map