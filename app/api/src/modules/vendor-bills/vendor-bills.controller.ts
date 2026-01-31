import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { VendorBillsService } from './vendor-bills.service';
import { CreateVendorBillDto } from './dto/create-vendor-bill.dto';
import { UpdateVendorBillDto } from './dto/update-vendor-bill.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@Controller('vendor-bills')
@UseGuards(JwtAuthGuard)
export class VendorBillsController {
  constructor(private readonly vendorBillsService: VendorBillsService) {}

  @Post()
  create(@Body() createDto: CreateVendorBillDto, @Request() req: any) {
    return this.vendorBillsService.create(createDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.vendorBillsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      search,
      status,
      vendorId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorBillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateVendorBillDto) {
    return this.vendorBillsService.update(id, updateDto);
  }

  @Post(':id/post')
  post(@Param('id') id: string, @Request() req: any) {
    return this.vendorBillsService.postBill(id, req.user.id);
  }

  @Post(':id/payment')
  registerPayment(@Param('id') id: string, @Body() paymentDto: RegisterPaymentDto, @Request() req: any) {
    return this.vendorBillsService.registerPayment(id, paymentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorBillsService.remove(id);
  }
}
