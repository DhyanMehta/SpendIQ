"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            type: 'OUTBOUND',
        };
        if (params.search) {
            where.OR = [
                { reference: { contains: params.search, mode: 'insensitive' } },
                { partner: { name: { contains: params.search, mode: 'insensitive' } } },
            ];
        }
        if (params.vendorId) {
            where.partnerId = params.vendorId;
        }
        if (params.startDate || params.endDate) {
            where.date = {};
            if (params.startDate) {
                where.date.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                where.date.lte = new Date(params.endDate);
            }
        }
        if (params.status) {
            where.status = params.status;
        }
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    partner: true,
                    allocations: {
                        include: {
                            invoice: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            data: payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                partner: true,
                allocations: {
                    include: {
                        invoice: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async getUnpaidBills(vendorId) {
        const bills = await this.prisma.invoice.findMany({
            where: {
                partnerId: vendorId,
                type: 'IN_INVOICE',
                status: 'POSTED',
                paymentState: {
                    in: ['NOT_PAID', 'PARTIAL'],
                },
            },
            include: {
                payments: true,
            },
            orderBy: { date: 'asc' },
        });
        return bills.map((bill) => {
            const totalPaid = bill.payments.reduce((sum, allocation) => sum + Number(allocation.amount), 0);
            const outstanding = Number(bill.totalAmount) - totalPaid;
            return {
                id: bill.id,
                number: bill.number,
                date: bill.date,
                dueDate: bill.dueDate,
                amountTotal: Number(bill.totalAmount),
                paidAmount: totalPaid,
                outstanding,
            };
        });
    }
    async create(dto) {
        const vendor = await this.prisma.contact.findUnique({
            where: { id: dto.vendorId },
        });
        if (!vendor) {
            throw new common_1.BadRequestException('Vendor not found');
        }
        if (vendor.type !== 'VENDOR') {
            throw new common_1.BadRequestException('Selected contact must be a VENDOR');
        }
        const totalAllocated = dto.allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
        if (Math.abs(totalAllocated - dto.paymentAmount) > 0.01) {
            throw new common_1.BadRequestException(`Total allocated (${totalAllocated}) must equal payment amount (${dto.paymentAmount})`);
        }
        for (const allocation of dto.allocations) {
            const bill = await this.prisma.invoice.findUnique({
                where: { id: allocation.billId },
                include: { payments: true },
            });
            if (!bill) {
                throw new common_1.BadRequestException(`Bill ${allocation.billId} not found`);
            }
            if (bill.status !== 'POSTED') {
                throw new common_1.BadRequestException(`Cannot pay bill ${bill.number} - it must be POSTED`);
            }
            if (bill.partnerId !== dto.vendorId) {
                throw new common_1.BadRequestException(`Bill ${bill.number} does not belong to selected vendor`);
            }
            const totalPaid = bill.payments.reduce((sum, alloc) => sum + Number(alloc.amount), 0);
            const outstanding = Number(bill.totalAmount) - totalPaid;
            if (allocation.allocatedAmount > outstanding + 0.01) {
                throw new common_1.BadRequestException(`Allocation for bill ${bill.number} (${allocation.allocatedAmount}) exceeds outstanding (${outstanding})`);
            }
        }
        const lastPayment = await this.prisma.payment.findFirst({
            where: { type: 'OUTBOUND' },
            orderBy: { reference: 'desc' },
        });
        let nextNumber = 1;
        if (lastPayment === null || lastPayment === void 0 ? void 0 : lastPayment.reference) {
            const match = lastPayment.reference.match(/PAY(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        const paymentReference = `PAY${String(nextNumber).padStart(6, '0')}`;
        const payment = await this.prisma.payment.create({
            data: {
                reference: paymentReference,
                partnerId: dto.vendorId,
                date: dto.paymentDate,
                amount: dto.paymentAmount,
                method: dto.paymentMethod,
                type: 'OUTBOUND',
                status: 'DRAFT',
            },
            include: {
                partner: true,
            },
        });
        for (const allocation of dto.allocations) {
            await this.prisma.paymentAllocation.create({
                data: {
                    paymentId: payment.id,
                    invoiceId: allocation.billId,
                    amount: allocation.allocatedAmount,
                },
            });
        }
        return this.findOne(payment.id);
    }
    async update(id, dto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.status === 'POSTED') {
            throw new common_1.BadRequestException('Cannot update posted payment');
        }
        await this.prisma.paymentAllocation.deleteMany({
            where: { paymentId: id },
        });
        if (dto.allocations) {
            const totalAllocated = dto.allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
            const paymentAmount = dto.paymentAmount || Number(payment.amount);
            if (Math.abs(totalAllocated - paymentAmount) > 0.01) {
                throw new common_1.BadRequestException(`Total allocated must equal payment amount`);
            }
            for (const allocation of dto.allocations) {
                await this.prisma.paymentAllocation.create({
                    data: {
                        paymentId: id,
                        invoiceId: allocation.billId,
                        amount: allocation.allocatedAmount,
                    },
                });
            }
        }
        const updateData = {};
        if (dto.paymentDate)
            updateData.date = dto.paymentDate;
        if (dto.paymentAmount)
            updateData.amount = dto.paymentAmount;
        if (dto.paymentMethod)
            updateData.method = dto.paymentMethod;
        await this.prisma.payment.update({
            where: { id },
            data: updateData,
        });
        return this.findOne(id);
    }
    async postPayment(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                allocations: {
                    include: {
                        invoice: {
                            include: {
                                payments: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.status === 'POSTED') {
            throw new common_1.BadRequestException('Payment already posted');
        }
        if (!payment.allocations || payment.allocations.length === 0) {
            throw new common_1.BadRequestException('Cannot post payment without allocations');
        }
        const totalAllocated = payment.allocations.reduce((sum, alloc) => sum + Number(alloc.amount), 0);
        if (Math.abs(totalAllocated - Number(payment.amount)) > 0.01) {
            throw new common_1.BadRequestException('Total allocated must equal payment amount before posting');
        }
        await this.prisma.payment.update({
            where: { id },
            data: { status: 'POSTED' },
        });
        for (const allocation of payment.allocations) {
            const bill = allocation.invoice;
            const totalPaid = bill.payments.reduce((sum, alloc) => sum + Number(alloc.amount), 0) + Number(allocation.amount);
            const outstanding = Number(bill.totalAmount) - totalPaid;
            let newPaymentState;
            if (outstanding <= 0.01) {
                newPaymentState = 'PAID';
            }
            else if (totalPaid > 0.01) {
                newPaymentState = 'PARTIAL';
            }
            else {
                newPaymentState = 'NOT_PAID';
            }
            await this.prisma.invoice.update({
                where: { id: bill.id },
                data: { paymentState: newPaymentState },
            });
        }
        await this.prisma.journalEntry.create({
            data: {
                number: `JE-PAY-${payment.reference}`,
                date: payment.date,
                reference: `Payment ${payment.reference}`,
                state: 'POSTED',
                lines: {
                    create: [
                        {
                            accountId: '00000000-0000-0000-0000-000000000001',
                            label: 'Accounts Payable',
                            debit: Number(payment.amount),
                            credit: 0,
                        },
                        {
                            accountId: '00000000-0000-0000-0000-000000000002',
                            label: payment.method === 'CASH' ? 'Cash' : 'Bank',
                            debit: 0,
                            credit: Number(payment.amount),
                        },
                    ],
                },
            },
        });
        return this.findOne(id);
    }
    async remove(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.status === 'POSTED') {
            throw new common_1.BadRequestException('Cannot delete posted payment');
        }
        await this.prisma.paymentAllocation.deleteMany({
            where: { paymentId: id },
        });
        await this.prisma.payment.delete({
            where: { id },
        });
        return { message: 'Payment deleted successfully' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map