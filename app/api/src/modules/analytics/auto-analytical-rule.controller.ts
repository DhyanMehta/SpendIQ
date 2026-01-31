import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AutoAnalyticalRuleService } from "./auto-analytical-rule.service";
import { CreateAutoAnalyticalRuleDto } from "./dto/create-auto-analytical-rule.dto";
import { UpdateAutoAnalyticalRuleDto } from "./dto/update-auto-analytical-rule.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("auto-analytical-rules")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Admin-only access
export class AutoAnalyticalRuleController {
  constructor(
    private readonly autoAnalyticalRuleService: AutoAnalyticalRuleService,
  ) {}

  @Get()
  findAll(@Query("includeArchived") includeArchived?: string) {
    return this.autoAnalyticalRuleService.findAll(includeArchived === "true");
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.autoAnalyticalRuleService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAutoAnalyticalRuleDto, @Request() req: any) {
    return this.autoAnalyticalRuleService.create(dto, req.user.userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAutoAnalyticalRuleDto) {
    return this.autoAnalyticalRuleService.update(id, dto);
  }

  @Patch(":id/confirm")
  confirm(@Param("id") id: string) {
    return this.autoAnalyticalRuleService.confirm(id);
  }

  @Patch(":id/archive")
  archive(@Param("id") id: string) {
    return this.autoAnalyticalRuleService.archive(id);
  }
}
