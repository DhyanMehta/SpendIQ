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
exports.AnalyticalAccountController = void 0;
const common_1 = require("@nestjs/common");
const analytical_account_service_1 = require("./analytical-account.service");
const create_analytical_account_dto_1 = require("./dto/create-analytical-account.dto");
const update_analytical_account_dto_1 = require("./dto/update-analytical-account.dto");
const jwt_auth_guard_1 = require("../../common/auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticalAccountController = class AnalyticalAccountController {
    constructor(analyticalAccountService) {
        this.analyticalAccountService = analyticalAccountService;
    }
    findAll(includeArchived) {
        return this.analyticalAccountService.findAll(includeArchived === "true");
    }
    findOne(id) {
        return this.analyticalAccountService.findOne(id);
    }
    create(dto, req) {
        return this.analyticalAccountService.create(dto, req.user.userId);
    }
    update(id, dto) {
        return this.analyticalAccountService.update(id, dto);
    }
    confirm(id) {
        return this.analyticalAccountService.confirm(id);
    }
    archive(id) {
        return this.analyticalAccountService.archive(id);
    }
};
exports.AnalyticalAccountController = AnalyticalAccountController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("includeArchived")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_analytical_account_dto_1.CreateAnalyticalAccountDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_analytical_account_dto_1.UpdateAnalyticalAccountDto]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/confirm"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(":id/archive"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticalAccountController.prototype, "archive", null);
exports.AnalyticalAccountController = AnalyticalAccountController = __decorate([
    (0, common_1.Controller)("analytical-accounts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [analytical_account_service_1.AnalyticalAccountService])
], AnalyticalAccountController);
//# sourceMappingURL=analytical-account.controller.js.map