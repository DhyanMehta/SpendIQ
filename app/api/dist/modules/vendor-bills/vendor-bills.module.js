"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorBillsModule = void 0;
const common_1 = require("@nestjs/common");
const vendor_bills_service_1 = require("./vendor-bills.service");
const vendor_bills_controller_1 = require("./vendor-bills.controller");
const database_module_1 = require("../../common/database/database.module");
let VendorBillsModule = class VendorBillsModule {
};
exports.VendorBillsModule = VendorBillsModule;
exports.VendorBillsModule = VendorBillsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [vendor_bills_controller_1.VendorBillsController],
        providers: [vendor_bills_service_1.VendorBillsService],
        exports: [vendor_bills_service_1.VendorBillsService],
    })
], VendorBillsModule);
//# sourceMappingURL=vendor-bills.module.js.map