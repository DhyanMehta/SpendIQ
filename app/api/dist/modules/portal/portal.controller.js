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
exports.PortalController = void 0;
const common_1 = require("@nestjs/common");
const portal_service_1 = require("./portal.service");
const jwt_auth_guard_1 = require("../../common/auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PortalController = class PortalController {
    constructor(portalService) {
        this.portalService = portalService;
    }
    getDashboard(req) {
        return this.portalService.getDashboardData(req.user.id);
    }
    getMyInvoices(req) {
        return this.portalService.getMyInvoices(req.user.id);
    }
    getMyPurchaseOrders(req) {
        return this.portalService.getMyPurchaseOrders(req.user.id);
    }
    getMySalesOrders(req) {
        return this.portalService.getMySalesOrders(req.user.id);
    }
    getMyBills(req) {
        return this.portalService.getMyBills(req.user.id);
    }
    getMyPayments(req) {
        return this.portalService.getMyPayments(req.user.id);
    }
    payInvoice(id, req) {
        return this.portalService.payInvoice(id, req.user.id);
    }
    verifyPayment(id, body, req) {
        return this.portalService.verifyPayment(id, req.user.id, body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
    }
};
exports.PortalController = PortalController;
__decorate([
    (0, common_1.Get)("dashboard"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)("invoices"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMyInvoices", null);
__decorate([
    (0, common_1.Get)("purchase-orders"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMyPurchaseOrders", null);
__decorate([
    (0, common_1.Get)("sales-orders"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMySalesOrders", null);
__decorate([
    (0, common_1.Get)("bills"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMyBills", null);
__decorate([
    (0, common_1.Get)("payments"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Post)("invoices/:id/pay"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "payInvoice", null);
__decorate([
    (0, common_1.Post)("invoices/:id/verify-payment"),
    (0, roles_decorator_1.Roles)(client_1.Role.PORTAL_USER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "verifyPayment", null);
exports.PortalController = PortalController = __decorate([
    (0, common_1.Controller)("portal"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [portal_service_1.PortalService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map