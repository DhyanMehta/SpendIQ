import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { JwtAuthGuard } from "../../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("accounts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.service.create(body);
  }
}
