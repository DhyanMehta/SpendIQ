import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PurchaseOrdersService } from "./purchase-orders.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("purchase/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) { }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Request() req,
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.create(
      req.user.id,
      createPurchaseOrderDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Request() req) {
    return this.purchaseOrdersService.findAll(req.user.id);
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  update(
    @Param("id") id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Patch(":id/confirm")
  @Roles(Role.ADMIN)
  confirm(@Param("id") id: string) {
    return this.purchaseOrdersService.confirm(id);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
