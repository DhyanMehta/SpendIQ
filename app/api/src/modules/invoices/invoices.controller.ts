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
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("invoices")
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("type") type?: string,
    @Query("state") state?: string,
    @Query("partnerId") partnerId?: string,
  ) {
    return this.invoicesService.findAll({
      page: Number(page),
      limit: Number(limit),
      type,
      state,
      partnerId,
      userId: user.id,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(":id/post")
  post(@Param("id") id: string, @CurrentUser() user: any) {
    return this.invoicesService.post(id, user.id);
  }

  @Post(":id/payment")
  registerPayment(
    @Param("id") id: string,
    @Body()
    paymentData: {
      journalId: string;
      amount: number;
      date: Date;
      reference?: string;
    },
  ) {
    return this.invoicesService.registerPayment(id, paymentData);
  }
}
