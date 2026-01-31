import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { ConfigService } from "@nestjs/config";
import Razorpay from "razorpay";
import * as crypto from "crypto";

@Injectable()
export class PortalService {
  private razorpay: Razorpay;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Razorpay with credentials from environment
    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  private async getContactId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contact: true },
    });

    return user?.contact?.id || null;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        contact: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.contact) {
      return null;
    }

    return {
      id: user.contact.id,
      name: user.contact.name,
      email: user.contact.email,
      phone: user.contact.phone,
      type: user.contact.type,
      imageUrl: user.contact.imageUrl,
      address: {
        street: user.contact.street,
        city: user.contact.city,
        state: user.contact.state,
        country: user.contact.country,
        pincode: user.contact.pincode,
      },
      tags: user.contact.tags.map((ct) => ({
        id: ct.tag.id,
        name: ct.tag.name,
        color: ct.tag.color,
      })),
    };
  }

  async getDashboardData(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return {
        summary: {
          totalInvoices: 0,
          outstandingBalance: 0,
          totalPurchaseOrders: 0,
          totalSalesOrders: 0,
        },
        recentInvoices: [],
        recentOrders: [],
      };
    }

    // Get invoices summary
    const invoices = await this.prisma.invoice.findMany({
      where: { partnerId: contactId },
    });

    const outstandingInvoices = invoices.filter(
      (inv) => inv.paymentState !== "PAID",
    );
    const outstandingBalance = outstandingInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0,
    );

    // Get PO count
    const poCount = await this.prisma.purchaseOrder.count({
      where: { vendorId: contactId },
    });

    // Get SO count
    const soCount = await this.prisma.salesOrder.count({
      where: { customerId: contactId },
    });

    // Recent invoices (last 5)
    const recentInvoices = await this.prisma.invoice.findMany({
      where: { partnerId: contactId },
      take: 5,
      orderBy: { date: "desc" },
    });

    // Recent orders (last 5 combined PO/SO)
    const recentPOs = await this.prisma.purchaseOrder.findMany({
      where: { vendorId: contactId },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    const recentSOs = await this.prisma.salesOrder.findMany({
      where: { customerId: contactId },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return {
      summary: {
        totalInvoices: invoices.length,
        outstandingBalance,
        totalPurchaseOrders: poCount,
        totalSalesOrders: soCount,
        pendingInvoices: outstandingInvoices.length,
      },
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        dueDate: inv.dueDate,
        total: Number(inv.totalAmount),
        status: inv.paymentState,
      })),
      recentOrders: [
        ...recentPOs.map((po) => ({
          id: po.id,
          number: po.poNumber,
          type: "PO",
          date: po.createdAt,
          total: Number(po.totalAmount),
          status: po.status,
        })),
        ...recentSOs.map((so) => ({
          id: so.id,
          number: so.reference,
          type: "SO",
          date: so.createdAt,
          total: Number(so.totalAmount),
          status: so.status,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }

  async getMyInvoices(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return [];
    }

    // Get OUT_INVOICE (Customer Invoices) - these are the ones customers need to pay
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        partnerId: contactId,
        type: "OUT_INVOICE", // Only customer invoices
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        salesOrder: true, // Include linked sales order info
      },
      orderBy: { date: "desc" },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      type: inv.type,
      date: inv.date,
      dueDate: inv.dueDate,
      total: Number(inv.totalAmount),
      tax: Number(inv.taxAmount),
      status: inv.status,
      paymentState: inv.paymentState,
      salesOrderRef: inv.salesOrder?.reference || null,
      lines: inv.lines.map((line) => ({
        id: line.id,
        product: line.product?.name,
        description: line.label,
        quantity: Number(line.quantity),
        unitPrice: Number(line.priceUnit),
        amount: Number(line.subtotal),
      })),
    }));
  }

  async getMyPurchaseOrders(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return [];
    }

    const orders = await this.prisma.purchaseOrder.findMany({
      where: { vendorId: contactId },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((po) => ({
      id: po.id,
      number: po.poNumber,
      date: po.orderDate,
      total: Number(po.totalAmount),
      status: po.status,
      lines: po.lines.map((line) => ({
        id: line.id,
        product: line.product?.name,
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        amount: Number(line.subtotal),
      })),
    }));
  }

  async getMySalesOrders(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return [];
    }

    const orders = await this.prisma.salesOrder.findMany({
      where: { customerId: contactId },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((so) => ({
      id: so.id,
      number: so.reference,
      date: so.date,
      total: Number(so.totalAmount),
      status: so.status,
      lines: so.lines.map((line) => ({
        id: line.id,
        product: line.product?.name,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        amount: Number(line.subtotal),
      })),
    }));
  }

  async getMyBills(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return [];
    }

    // Bills are IN_INVOICE type invoices
    const bills = await this.prisma.invoice.findMany({
      where: {
        partnerId: contactId,
        type: "IN_INVOICE",
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return bills.map((bill) => ({
      id: bill.id,
      number: bill.number,
      date: bill.date,
      dueDate: bill.dueDate,
      total: Number(bill.totalAmount),
      tax: Number(bill.taxAmount),
      status: bill.status,
      paymentState: bill.paymentState,
      lines: bill.lines.map((line) => ({
        id: line.id,
        product: line.product?.name,
        description: line.label,
        quantity: Number(line.quantity),
        unitPrice: Number(line.priceUnit),
        amount: Number(line.subtotal),
      })),
    }));
  }

  async getMyPayments(userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return [];
    }

    const payments = await this.prisma.payment.findMany({
      where: { partnerId: contactId },
      orderBy: { date: "desc" },
    });

    return payments.map((payment) => ({
      id: payment.id,
      reference: payment.reference,
      date: payment.date,
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      type: payment.type,
    }));
  }

  async payInvoice(invoiceId: string, userId: string) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return { success: false, message: "No contact linked to user" };
    }

    // Get user and contact info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contact: true },
    });

    // Verify invoice belongs to this contact
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        partnerId: contactId,
      },
    });

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    if (invoice.paymentState === "PAID") {
      return { success: false, message: "Invoice is already paid" };
    }

    const amount = Number(invoice.totalAmount);

    // Check if Razorpay is configured
    if (!this.razorpay) {
      return {
        success: false,
        message: "Payment gateway not configured",
      };
    }

    try {
      // Create Razorpay order (amount in paise)
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `inv_${invoice.number}`,
        notes: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          userId: userId,
          contactId: contactId,
        },
      });

      return {
        success: true,
        orderId: order.id,
        amount: amount,
        amountInPaise: Math.round(amount * 100),
        currency: "INR",
        invoiceNumber: invoice.number,
        keyId: this.configService.get<string>("RAZORPAY_KEY_ID"),
        prefill: {
          name: user?.contact?.name || user?.name || "",
          email: user?.email || "",
          contact: user?.contact?.phone || "",
        },
      };
    } catch (error: any) {
      console.error("[PortalService] Razorpay order creation failed:", error);
      return {
        success: false,
        message: "Failed to create payment order",
      };
    }
  }

  async verifyPayment(
    invoiceId: string,
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const contactId = await this.getContactId(userId);

    if (!contactId) {
      return { success: false, message: "No contact linked to user" };
    }

    // Verify invoice belongs to this contact
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        partnerId: contactId,
      },
    });

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    // Verify Razorpay signature
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");
    const generatedSignature = crypto
      .createHmac("sha256", keySecret || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return { success: false, message: "Payment verification failed" };
    }

    const amount = Number(invoice.totalAmount);

    // Create payment record
    const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await this.prisma.payment.create({
      data: {
        reference: paymentRef,
        partnerId: contactId,
        date: new Date(),
        amount: amount,
        type: "INBOUND",
        method: "RAZORPAY",
        status: "POSTED",
      },
    });

    // Create payment allocation linking payment to invoice
    await this.prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amount: amount,
      },
    });

    // Update invoice payment state to PAID
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentState: "PAID" },
    });

    return {
      success: true,
      message: "Payment successful",
      paymentId: payment.id,
      paymentReference: paymentRef,
      amountPaid: amount,
      invoiceNumber: invoice.number,
    };
  }
}
