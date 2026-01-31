import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { BudgetsService } from "../../budgeting/services/budgets.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { PurchOrderStatus } from "@prisma/client";

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private budgetsService: BudgetsService,
  ) {}

  async create(userId: string, dto: CreatePurchaseOrderDto) {
    // Calculate totals
    const subtotal = dto.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );
    const taxAmount = 0; // Placeholder tax logic
    const totalAmount = subtotal + taxAmount;

    // Generate PO Number (Simple sequence or UUID for MVP)
    const poNumber = `PO-${Date.now()}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: dto.vendorId,
        orderDate: new Date(dto.orderDate),
        status: PurchOrderStatus.DRAFT,
        subtotal,
        taxAmount,
        totalAmount,
        createdById: userId,
        lines: {
          create: dto.lines.map((line) => ({
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.quantity * line.unitPrice,
            analyticalAccountId: line.analyticalAccountId,
          })),
        },
      },
      include: {
        lines: true,
        vendor: true,
      },
    });
  }

  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        vendor: { select: { name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
        vendor: true,
        creator: { select: { name: true } },
      },
    });
    if (!po) throw new NotFoundException("Purchase Order not found");
    return po;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    const po = await this.findOne(id);
    if (po.status !== PurchOrderStatus.DRAFT) {
      throw new BadRequestException("Only Draft POs can be updated");
    }

    // Full overwrite of lines typically needed for PO edits or specific line patching
    // For MVP, we'll re-calculate totals and update header fields if provided.
    // Line updates are complex without specific line IDs in DTO.
    // Simplified: Update header only for MVP or full line replace (complex).

    // NOTE: This basic update mostly handles status or header info.
    // Real-world needs line management.

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        vendorId: dto.vendorId,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
      },
    });
  }

  async confirm(id: string) {
    const po = await this.findOne(id);
    if (po.status !== PurchOrderStatus.DRAFT) {
      throw new BadRequestException("Only Draft POs can be confirmed");
    }

    // Budget Warning Check
    const warnings = [];
    for (const line of po.lines) {
      if (line.analyticalAccountId) {
        const check = await this.budgetsService.checkBudgetAvailability(
          line.analyticalAccountId,
          Number(line.subtotal),
          po.orderDate,
        );
        if (check.isExceeded) {
          warnings.push({
            lineId: line.id,
            analytic: line.analyticalAccount?.name,
            message: `Exceeds budget '${check.budgetName || "N/A"}'. Available: ${check.available < 0 ? 0 : check.available}`,
          });
        } else if (!check.hasBudget) {
          warnings.push({
            lineId: line.id,
            analytic: line.analyticalAccount?.name,
            message: `No active expense budget found for this analytic account.`,
          });
        }
      }
    }

    // Confirm regardless of budget (Non-blocking)
    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchOrderStatus.CONFIRMED },
    });

    return {
      po: updatedPo,
      budgetWarnings: warnings,
    };
  }

  async remove(id: string) {
    // Only allow delete if Draft
    const po = await this.findOne(id);
    if (
      po.status !== PurchOrderStatus.DRAFT &&
      po.status !== PurchOrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Cannot delete confirmed POs. Cancel them instead.",
      );
    }
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}
