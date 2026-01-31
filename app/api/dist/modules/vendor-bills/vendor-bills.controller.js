"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorBillsController = void 0;
const common_1 = require("@nestjs/common");
const vendor_bills_service_1 = require("./vendor-bills.service");
const create_vendor_bill_dto_1 = require("./dto/create-vendor-bill.dto");
const update_vendor_bill_dto_1 = require("./dto/update-vendor-bill.dto");
const register_payment_dto_1 = require("./dto/register-payment.dto");
const jwt_auth_guard_1 = require("../../common/auth/jwt-auth.guard");
let VendorBillsController = class VendorBillsController {
    constructor(vendorBillsService) {
        this.vendorBillsService = vendorBillsService;
    }
    create(createDto, req) {
        return this.vendorBillsService.create(createDto, req.user.id);
    }
    findAll(page, limit, search, status, vendorId, startDate, endDate) {
        return this.vendorBillsService.findAll({
            page: page ? +page : 1,
            limit: limit ? +limit : 10,
            search,
            status,
            vendorId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    findOne(id) {
        return this.vendorBillsService.findOne(id);
    }
    update(id, updateDto) {
        return this.vendorBillsService.update(id, updateDto);
    }
    post(id, req) {
        return this.vendorBillsService.postBill(id, req.user.id);
    }
    registerPayment(id, paymentDto, req) {
        return this.vendorBillsService.registerPayment(id, paymentDto, req.user.id);
    }
    remove(id) {
        return this.vendorBillsService.remove(id);
    }
};
exports.VendorBillsController = VendorBillsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_bill_dto_1.CreateVendorBillDto, Object]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('vendorId')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_bill_dto_1.UpdateVendorBillDto]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/post'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "post", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, register_payment_dto_1.RegisterPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorBillsController.prototype, "remove", null);
exports.VendorBillsController = VendorBillsController = __decorate([
    (0, common_1.Controller)('vendor-bills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vendor_bills_service_1.VendorBillsService])
], VendorBillsController);
//# sourceMappingURL=vendor-bills.controller.js.map