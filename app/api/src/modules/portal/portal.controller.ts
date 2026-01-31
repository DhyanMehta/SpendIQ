import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PortalService } from "./portal.service";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("portal")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) { }

  @Get("dashboard")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getDashboard(@Request() req) {
    return this.portalService.getDashboardData(req.user.id);
  }

  @Get("invoices")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getMyInvoices(@Request() req) {
    return this.portalService.getMyInvoices(req.user.id);
  }

  @Get("purchase-orders")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getMyPurchaseOrders(@Request() req) {
    return this.portalService.getMyPurchaseOrders(req.user.id);
  }

  @Get("sales-orders")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getMySalesOrders(@Request() req) {
    return this.portalService.getMySalesOrders(req.user.id);
  }

  @Get("bills")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getMyBills(@Request() req) {
    return this.portalService.getMyBills(req.user.id);
  }

  @Get("payments")
  @Roles(Role.PORTAL_USER, Role.ADMIN)
  getMyPayments(@Request() req) {
    return this.portalService.getMyPayments(req.user.id);
  }

  @Post("invoices/:id/pay")
  @Roles(Role.PORTAL_USER)
  payInvoice(
    @Param("id") id: string,
    @Body() body: { amount?: number },
    @Request() req,
  ) {
    return this.portalService.payInvoice(id, req.user.id, body?.amount);
  }

  @Post("invoices/:id/verify-payment")
  @Roles(Role.PORTAL_USER)
  verifyPayment(
    @Param("id") id: string,
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      amount: number;
    },
    @Request() req,
  ) {
    return this.portalService.verifyPayment(
      id,
      req.user.id,
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      body.amount,
    );
  }
}
