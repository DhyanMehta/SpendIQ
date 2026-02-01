import { Controller, Get, Post, Body, Param, UseGuards, Request } from "@nestjs/common";
import { AnalyticalAccountsService } from "../services/analytical-accounts.service";
import { CreateAnalyticalAccountDto } from "../dto/create-analytical-account.dto";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";

@Controller("analytical-accounts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticalAccountsController {
  constructor(private readonly service: AnalyticalAccountsService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateAnalyticalAccountDto, @Request() req: any) {
    return this.service.create(dto, req?.user?.userId || req?.user?.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req?.user?.userId || req?.user?.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req: any) {
    return this.service.findOne(id, req?.user?.userId || req?.user?.id);
  }
}
