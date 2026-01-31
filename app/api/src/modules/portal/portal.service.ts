import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) { }

  private async getContactId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contact: true },
    });

    return user?.contact?.id || null;
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
      (inv) => inv.paymentState !== "PAID"
    );
    const outstandingBalance = outstandingInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
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

    const invoices = await this.prisma.invoice.findMany({
      where: { partnerId: contactId },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
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

    // Mark invoice as paid (simplified - real implementation would create payment record)
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentState: "PAID" },
    });

    return { success: true, message: "Payment recorded successfully" };
  }
}
