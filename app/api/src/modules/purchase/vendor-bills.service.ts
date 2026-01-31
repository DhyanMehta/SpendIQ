import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { BudgetsService } from "../../budgeting/services/budgets.service";
import { CreateVendorBillDto } from "./dto/create-vendor-bill.dto";
import { InvoiceType, InvoiceStatus } from "@prisma/client";

@Injectable()
export class VendorBillsService {
  constructor(
    private prisma: PrismaService,
    private budgetsService: BudgetsService,
  ) {}

  async create(createVendorBillDto: CreateVendorBillDto, userId: string) {
    // Calculate totals
    const totalAmount = createVendorBillDto.lines.reduce(
      (sum, l) => sum + l.quantity * l.unitPrice,
      0,
    );

    // Generate invoice number
    const count = await this.prisma.invoice.count({
      where: { type: InvoiceType.IN_INVOICE },
    });
    const invoiceNumber = `BILL/${new Date().getFullYear()}/${String(count + 1).padStart(4, "0")}`;

    return this.prisma.invoice.create({
      data: {
        type: InvoiceType.IN_INVOICE,
        number: invoiceNumber,
        partner: { connect: { id: createVendorBillDto.vendorId } },
        date: new Date(createVendorBillDto.billDate),
        dueDate: new Date(createVendorBillDto.dueDate),
        status: InvoiceStatus.DRAFT,
        paymentState: "NOT_PAID",
        totalAmount,
        taxAmount: 0,
        creator: { connect: { id: userId } },
        lines: {
          create: createVendorBillDto.lines.map((l) => ({
            product: l.productId ? { connect: { id: l.productId } } : undefined,
            label: l.description,
            quantity: l.quantity,
            priceUnit: l.unitPrice,
            subtotal: l.quantity * l.unitPrice,
            taxRate: 0,
            analyticAccount: l.analyticalAccountId
              ? { connect: { id: l.analyticalAccountId } }
              : undefined,
          })),
        },
      },
      include: {
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        partner: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        type: InvoiceType.IN_INVOICE,
        createdById: userId,
      },
      include: {
        partner: true,
        lines: true,
      },
      orderBy: { date: "desc" },
    });
  }

  async findOne(id: string, userId: string) {
    const bill = await this.prisma.invoice.findFirst({
      where: {
        id,
        createdById: userId,
      },
      include: {
        lines: {
          include: {
            product: true,
            analyticAccount: true, // Fixed relation name
          },
        },
        partner: true,
      },
    });
    if (!bill) throw new NotFoundException(`Vendor Bill not found`);
    return bill;
  }

  async post(id: string, userId: string) {
    const bill = await this.findOne(id, userId);
    if (bill.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException("Only Draft bills can be posted");
    }

    // 1. Check Budget Availability (Non-blocking warning logic handled by frontend before this?
    // Or we return warnings here too?
    // Requirement: "Budget Impact: Only Posted Vendor Bills affect expense budgets."
    // "Budget Warnings: ... Vendor Bill Posting if amount exceeds..."
    // Ideally user sees warning BEFORE final confirmation.
    // Let's implement a 'check' check similar to PO.

    const warnings = [];
    for (const line of bill.lines) {
      if (line.analyticAccountId) {
        const check = await this.budgetsService.checkBudgetAvailability(
          line.analyticAccountId,
          Number(line.subtotal),
          bill.date,
        );
        if (check.isExceeded) {
          warnings.push({
            lineId: line.id,
            analytic: line.analyticAccount?.name,
            message: `Exceeds budget '${check.budgetName || "N/A"}'. Available: ${check.available < 0 ? 0 : check.available}`,
          });
        }
      }
    }

    // 2. Post the Bill
    // (In a real ERP, this creates Journal Entries. Here we just set status to POSTED which triggers Actuals calc in BudgetsService)
    const updatedBill = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.POSTED },
    });

    return {
      bill: updatedBill,
      budgetWarnings: warnings,
    };
  }

  // Helper to just check budgets without posting
  async simulatePost(id: string, userId: string) {
    const bill = await this.findOne(id, userId);
    const warnings = [];
    for (const line of bill.lines) {
      if (line.analyticAccountId) {
        const check = await this.budgetsService.checkBudgetAvailability(
          line.analyticAccountId,
          Number(line.subtotal),
          bill.date,
        );
        if (check.isExceeded) {
          warnings.push({
            lineId: line.id,
            analytic: line.analyticAccount?.name,
            message: `Exceeds budget '${check.budgetName || "N/A"}'. Available: ${check.available < 0 ? 0 : check.available}`,
          });
        }
      }
    }
    return warnings;
  }
}
