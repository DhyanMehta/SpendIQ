import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("sales")
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(
    @Body() createDto: CreateSalesOrderDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.salesService.create(createDto, user.id);
  }

  @Get()
  findAll(
    @Query()
    query: {
      page?: string;
      limit?: string;
      search?: string;
      status?: string;
      customerId?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    return this.salesService.findAll({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      search: query.search,
      status: query.status,
      customerId: query.customerId,
      userId: user.id,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateSalesOrderDto) {
    return this.salesService.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.salesService.remove(id);
  }

  @Post(":id/confirm")
  confirm(@Param("id") id: string) {
    return this.salesService.confirm(id);
  }

  @Post(":id/create-invoice")
  createInvoice(@Param("id") id: string) {
    // This will be implemented when InvoicesService is ready
    // For now, return a placeholder or call service method if it existed
    // return this.salesService.createInvoice(id);
    return { message: "Invoice creation logic to be linked" };
  }
}
