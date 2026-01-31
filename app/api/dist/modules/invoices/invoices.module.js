"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesModule = void 0;
const common_1 = require("@nestjs/common");
const invoices_controller_1 = require("./invoices.controller");
const invoices_service_1 = require("./invoices.service");
const database_module_1 = require("../../common/database/database.module");
const accounting_module_1 = require("../accounting/accounting.module");
const budgeting_module_1 = require("../budgeting/budgeting.module");
const sales_module_1 = require("../sales/sales.module");
let InvoicesModule = class InvoicesModule {
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = __decorate([
    (0, common_1.Module)({
        controllers: [invoices_controller_1.InvoicesController],
        providers: [invoices_service_1.InvoicesService],
        imports: [
            database_module_1.DatabaseModule,
            (0, common_1.forwardRef)(() => accounting_module_1.AccountingModule),
            (0, common_1.forwardRef)(() => budgeting_module_1.BudgetingModule),
            (0, common_1.forwardRef)(() => sales_module_1.SalesModule),
        ],
        exports: [invoices_service_1.InvoicesService],
    })
], InvoicesModule);
//# sourceMappingURL=invoices.module.js.map