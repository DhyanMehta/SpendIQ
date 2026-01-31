import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import {
  CreateInvoiceDto,
  CreateInvoiceLineDto,
} from "../dto/create-invoice.dto";
import { InvoiceStatus, InvoiceType } from "@prisma/client";

import { JournalEntriesService } from "../../accounting/services/journal-entries.service";

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private journalEntriesService: JournalEntriesService,
  ) {}

  async create(dto: CreateInvoiceDto, userId?: string) {
    // Calculate totals
    let totalAmount = 0;
    const linesData = dto.lines.map((line) => {
      const subtotal = line.quantity * line.priceUnit;
      totalAmount += subtotal;
      return {
        productId: line.productId,
        label: line.label,
        quantity: line.quantity,
        priceUnit: line.priceUnit,
        subtotal: subtotal,
        analyticAccountId: line.analyticAccountId,
      };
    });

    return this.prisma.invoice.create({
      data: {
        number: dto.number,
        creator: userId ? { connect: { id: userId } } : undefined,
        type: dto.type,
        partner: { connect: { id: dto.partnerId } },
        date: new Date(dto.date),
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.DRAFT,
        totalAmount: totalAmount,
        lines: { create: linesData },
      },
      include: { lines: true },
    });
  }

  async findAll(type?: InvoiceType, partnerId?: string, userId?: string) {
    return this.prisma.invoice.findMany({
      where: {
        type: type ? type : undefined,
        partnerId: partnerId ? partnerId : undefined,
        createdById: userId || undefined,
      },
      include: { partner: true },
      orderBy: { date: "desc" },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: { include: { product: true, analyticAccount: true } },
        partner: true,
      },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async post(id: string, userId?: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.POSTED) {
      throw new BadRequestException("Invoice already posted");
    }

    // 1. Find Accounts (Simplified for MVP)
    // In a real app, these come from Product/Partner settings
    const arAccount = await this.prisma.account.findFirst({
      where: { code: "1200" }, // Receivables
    });
    const salesAccount = await this.prisma.account.findFirst({
      where: { code: "4000" }, // Sales
    });

    if (!arAccount || !salesAccount) {
      throw new BadRequestException(
        "Accounting Error: Default Accounts (1200, 4000) not found. Please create them in General Ledger.",
      );
    }

    // 2. Prepare Journal Lines
    const lines = [];

    // Debit AR (Customer owes us)
    lines.push({
      accountId: arAccount.id,
      partnerId: invoice.partnerId,
      label: `Invoice ${invoice.number}`,
      debit: Number(invoice.totalAmount),
      credit: 0,
    });

    // Credit Income (Revenue) - Split by invoice lines for analytics
    for (const line of invoice.lines) {
      lines.push({
        accountId: salesAccount.id,
        partnerId: invoice.partnerId,
        label: line.label,
        debit: 0,
        credit: Number(line.subtotal),
        analyticAccountId: line.analyticAccountId, // Crucial for Budget Tracking
      });
    }

    // 3. Create Journal Entry
    const entry = await this.journalEntriesService.create(
      {
        date: invoice.date,
        reference: invoice.number || `INV/${invoice.id}`,
        lines: lines,
      },
      userId,
    );

    // 4. Update Invoice
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.POSTED,
        journalEntryId: entry.id,
      },
    });
  }
}
