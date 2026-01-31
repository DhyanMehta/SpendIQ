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
import { AnalyticalAccountService } from "./analytical-account.service";
import { CreateAnalyticalAccountDto } from "./dto/create-analytical-account.dto";
import { UpdateAnalyticalAccountDto } from "./dto/update-analytical-account.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("analytical-accounts")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Admin-only access
export class AnalyticalAccountController {
  constructor(
    private readonly analyticalAccountService: AnalyticalAccountService,
  ) {}

  @Get()
  findAll(@Query("includeArchived") includeArchived?: string) {
    return this.analyticalAccountService.findAll(includeArchived === "true");
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.analyticalAccountService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAnalyticalAccountDto, @Request() req: any) {
    return this.analyticalAccountService.create(dto, req.user.userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAnalyticalAccountDto) {
    return this.analyticalAccountService.update(id, dto);
  }

  @Patch(":id/confirm")
  confirm(@Param("id") id: string) {
    return this.analyticalAccountService.confirm(id);
  }

  @Patch(":id/archive")
  archive(@Param("id") id: string) {
    return this.analyticalAccountService.archive(id);
  }
}
