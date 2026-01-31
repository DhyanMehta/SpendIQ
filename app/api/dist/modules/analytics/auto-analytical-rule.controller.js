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
exports.AutoAnalyticalRuleController = void 0;
const common_1 = require("@nestjs/common");
const auto_analytical_rule_service_1 = require("./auto-analytical-rule.service");
const create_auto_analytical_rule_dto_1 = require("./dto/create-auto-analytical-rule.dto");
const update_auto_analytical_rule_dto_1 = require("./dto/update-auto-analytical-rule.dto");
const jwt_auth_guard_1 = require("../../common/auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AutoAnalyticalRuleController = class AutoAnalyticalRuleController {
    constructor(autoAnalyticalRuleService) {
        this.autoAnalyticalRuleService = autoAnalyticalRuleService;
    }
    findAll(includeArchived) {
        return this.autoAnalyticalRuleService.findAll(includeArchived === "true");
    }
    findOne(id) {
        return this.autoAnalyticalRuleService.findOne(id);
    }
    create(dto, req) {
        return this.autoAnalyticalRuleService.create(dto, req.user.userId);
    }
    update(id, dto) {
        return this.autoAnalyticalRuleService.update(id, dto);
    }
    confirm(id) {
        return this.autoAnalyticalRuleService.confirm(id);
    }
    archive(id) {
        return this.autoAnalyticalRuleService.archive(id);
    }
};
exports.AutoAnalyticalRuleController = AutoAnalyticalRuleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("includeArchived")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auto_analytical_rule_dto_1.CreateAutoAnalyticalRuleDto, Object]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_auto_analytical_rule_dto_1.UpdateAutoAnalyticalRuleDto]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/confirm"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(":id/archive"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoAnalyticalRuleController.prototype, "archive", null);
exports.AutoAnalyticalRuleController = AutoAnalyticalRuleController = __decorate([
    (0, common_1.Controller)("auto-analytical-rules"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [auto_analytical_rule_service_1.AutoAnalyticalRuleService])
], AutoAnalyticalRuleController);
//# sourceMappingURL=auto-analytical-rule.controller.js.map