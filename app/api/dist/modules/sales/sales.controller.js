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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const create_sales_order_dto_1 = require("./dto/create-sales-order.dto");
const update_sales_order_dto_1 = require("./dto/update-sales-order.dto");
const jwt_auth_guard_1 = require("../../common/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SalesController = class SalesController {
    constructor(salesService) {
        this.salesService = salesService;
    }
    create(createDto, user) {
        return this.salesService.create(createDto, user.id);
    }
    findAll(query, user) {
        return this.salesService.findAll({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
            search: query.search,
            status: query.status,
            customerId: query.customerId,
            userId: user.id,
        });
    }
    findOne(id) {
        return this.salesService.findOne(id);
    }
    update(id, updateDto) {
        return this.salesService.update(id, updateDto);
    }
    remove(id) {
        return this.salesService.remove(id);
    }
    confirm(id) {
        return this.salesService.confirm(id);
    }
    createInvoice(id) {
        return { message: "Invoice creation logic to be linked" };
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_order_dto_1.CreateSalesOrderDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sales_order_dto_1.UpdateSalesOrderDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/confirm"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(":id/create-invoice"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createInvoice", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)("sales"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map