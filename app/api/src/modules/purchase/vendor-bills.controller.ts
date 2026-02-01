import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { VendorBillsService } from "./vendor-bills.service";
import { CreateVendorBillDto } from "./dto/create-vendor-bill.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

// Assuming global auth or adding guards later as per `PurchaseOrdersController` pattern
@Controller("purchase/bills")
export class VendorBillsController {
  constructor(private readonly vendorBillsService: VendorBillsService) { }

  @Post()
  create(
    @Body() createDto: CreateVendorBillDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.vendorBillsService.create(createDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.vendorBillsService.findAll(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.vendorBillsService.findOne(id, user.id);
  }

  @Post(":id/post")
  postBill(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.vendorBillsService.post(id, user.id);
  }
}
