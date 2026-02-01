"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const config_1 = require("@nestjs/config");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
let PortalService = class PortalService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const keyId = this.configService.get("RAZORPAY_KEY_ID");
        const keySecret = this.configService.get("RAZORPAY_KEY_SECRET");
        if (keyId && keySecret) {
            this.razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
    }
    async getContactId(userId) {
        var _a;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { contact: true },
        });
        return ((_a = user === null || user === void 0 ? void 0 : user.contact) === null || _a === void 0 ? void 0 : _a.id) || null;
    }
    async getDashboardData(userId) {
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
        const invoices = await this.prisma.invoice.findMany({
            where: { partnerId: contactId },
        });
        const outstandingInvoices = invoices.filter((inv) => inv.paymentState !== "PAID");
        const outstandingBalance = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const poCount = await this.prisma.purchaseOrder.count({
            where: { vendorId: contactId },
        });
        const soCount = await this.prisma.salesOrder.count({
            where: { customerId: contactId },
        });
        const recentInvoices = await this.prisma.invoice.findMany({
            where: { partnerId: contactId },
            take: 5,
            orderBy: { date: "desc" },
        });
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
    async getMyInvoices(userId) {
        const contactId = await this.getContactId(userId);
        if (!contactId) {
            return [];
        }
        const invoices = await this.prisma.invoice.findMany({
            where: {
                partnerId: contactId,
                type: "OUT_INVOICE",
            },
            include: {
                lines: {
                    include: {
                        product: true,
                    },
                },
                salesOrder: true,
                payments: {
                    include: {
                        payment: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });
        return invoices.map((inv) => {
            var _a;
            const totalAmount = Number(inv.totalAmount);
            const paidViaCash = inv.payments
                .filter((pa) => pa.payment.method === "CASH" && pa.payment.status === "POSTED")
                .reduce((sum, pa) => sum + Number(pa.amount), 0);
            const paidViaBank = inv.payments
                .filter((pa) => ["BANK_TRANSFER", "RAZORPAY"].includes(pa.payment.method) && pa.payment.status === "POSTED")
                .reduce((sum, pa) => sum + Number(pa.amount), 0);
            const totalPaid = paidViaCash + paidViaBank;
            const amountDue = totalAmount - totalPaid;
            let calculatedPaymentState;
            if (amountDue <= 0) {
                calculatedPaymentState = "PAID";
            }
            else if (amountDue < totalAmount) {
                calculatedPaymentState = "PARTIAL";
            }
            else {
                calculatedPaymentState = "NOT_PAID";
            }
            return {
                id: inv.id,
                number: inv.number,
                type: inv.type,
                date: inv.date,
                dueDate: inv.dueDate,
                total: totalAmount,
                tax: Number(inv.taxAmount),
                status: inv.status,
                paymentState: calculatedPaymentState,
                paidViaCash,
                paidViaBank,
                totalPaid,
                amountDue: Math.max(0, amountDue),
                salesOrderRef: ((_a = inv.salesOrder) === null || _a === void 0 ? void 0 : _a.reference) || null,
                lines: inv.lines.map((line) => {
                    var _a;
                    return ({
                        id: line.id,
                        product: (_a = line.product) === null || _a === void 0 ? void 0 : _a.name,
                        description: line.label,
                        quantity: Number(line.quantity),
                        unitPrice: Number(line.priceUnit),
                        amount: Number(line.subtotal),
                    });
                }),
            };
        });
    }
    async getMyPurchaseOrders(userId) {
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
            lines: po.lines.map((line) => {
                var _a;
                return ({
                    id: line.id,
                    product: (_a = line.product) === null || _a === void 0 ? void 0 : _a.name,
                    description: line.description,
                    quantity: Number(line.quantity),
                    unitPrice: Number(line.unitPrice),
                    amount: Number(line.subtotal),
                });
            }),
        }));
    }
    async getMySalesOrders(userId) {
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
            lines: so.lines.map((line) => {
                var _a;
                return ({
                    id: line.id,
                    product: (_a = line.product) === null || _a === void 0 ? void 0 : _a.name,
                    quantity: Number(line.quantity),
                    unitPrice: Number(line.unitPrice),
                    amount: Number(line.subtotal),
                });
            }),
        }));
    }
    async getMyBills(userId) {
        const contactId = await this.getContactId(userId);
        if (!contactId) {
            return [];
        }
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
            lines: bill.lines.map((line) => {
                var _a;
                return ({
                    id: line.id,
                    product: (_a = line.product) === null || _a === void 0 ? void 0 : _a.name,
                    description: line.label,
                    quantity: Number(line.quantity),
                    unitPrice: Number(line.priceUnit),
                    amount: Number(line.subtotal),
                });
            }),
        }));
    }
    async getMyPayments(userId) {
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
    async payInvoice(invoiceId, userId, paymentAmount) {
        var _a, _b;
        const contactId = await this.getContactId(userId);
        if (!contactId) {
            return { success: false, message: "No contact linked to user" };
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { contact: true },
        });
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                partnerId: contactId,
            },
            include: {
                payments: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!invoice) {
            return { success: false, message: "Invoice not found" };
        }
        if (invoice.paymentState === "PAID") {
            return { success: false, message: "Invoice is already paid" };
        }
        const totalPaid = invoice.payments
            .filter((pa) => pa.payment.status === "POSTED")
            .reduce((sum, pa) => sum + Number(pa.amount), 0);
        const totalAmount = Number(invoice.totalAmount);
        const amountDue = totalAmount - totalPaid;
        let amount = paymentAmount !== null && paymentAmount !== void 0 ? paymentAmount : amountDue;
        if (amount <= 0) {
            return { success: false, message: "Invalid payment amount" };
        }
        if (amount > amountDue) {
            return {
                success: false,
                message: `Payment amount (${amount}) exceeds amount due (${amountDue})`
            };
        }
        if (!this.razorpay) {
            return {
                success: false,
                message: "Payment gateway not configured",
            };
        }
        try {
            const order = await this.razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: `inv_${invoice.number}_${Date.now()}`,
                notes: {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.number,
                    userId: userId,
                    contactId: contactId,
                    paymentAmount: amount.toString(),
                    isPartialPayment: (amount < amountDue).toString(),
                },
            });
            return {
                success: true,
                orderId: order.id,
                amount: amount,
                amountInPaise: Math.round(amount * 100),
                currency: "INR",
                invoiceNumber: invoice.number,
                invoiceTotal: totalAmount,
                totalPaid: totalPaid,
                amountDue: amountDue,
                isPartialPayment: amount < amountDue,
                keyId: this.configService.get("RAZORPAY_KEY_ID"),
                prefill: {
                    name: ((_a = user === null || user === void 0 ? void 0 : user.contact) === null || _a === void 0 ? void 0 : _a.name) || (user === null || user === void 0 ? void 0 : user.name) || "",
                    email: (user === null || user === void 0 ? void 0 : user.email) || "",
                    contact: ((_b = user === null || user === void 0 ? void 0 : user.contact) === null || _b === void 0 ? void 0 : _b.phone) || "",
                },
            };
        }
        catch (error) {
            console.error("[PortalService] Razorpay order creation failed:", error);
            return {
                success: false,
                message: "Failed to create payment order",
            };
        }
    }
    async verifyPayment(invoiceId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentAmount) {
        const contactId = await this.getContactId(userId);
        if (!contactId) {
            return { success: false, message: "No contact linked to user" };
        }
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                partnerId: contactId,
            },
            include: {
                payments: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!invoice) {
            return { success: false, message: "Invoice not found" };
        }
        const keySecret = this.configService.get("RAZORPAY_KEY_SECRET");
        const generatedSignature = crypto
            .createHmac("sha256", keySecret || "")
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");
        if (generatedSignature !== razorpaySignature) {
            return { success: false, message: "Payment verification failed" };
        }
        const amount = paymentAmount;
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
        await this.prisma.paymentAllocation.create({
            data: {
                paymentId: payment.id,
                invoiceId: invoice.id,
                amount: amount,
            },
        });
        const previousPaid = invoice.payments
            .filter((pa) => pa.payment.status === "POSTED")
            .reduce((sum, pa) => sum + Number(pa.amount), 0);
        const totalPaidNow = previousPaid + amount;
        const invoiceTotal = Number(invoice.totalAmount);
        const amountDueNow = invoiceTotal - totalPaidNow;
        let newPaymentState;
        if (amountDueNow <= 0) {
            newPaymentState = "PAID";
        }
        else if (amountDueNow < invoiceTotal) {
            newPaymentState = "PARTIAL";
        }
        else {
            newPaymentState = "NOT_PAID";
        }
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { paymentState: newPaymentState },
        });
        return {
            success: true,
            message: newPaymentState === "PAID"
                ? "Payment successful - Invoice fully paid"
                : "Payment successful - Partial payment recorded",
            paymentId: payment.id,
            paymentReference: paymentRef,
            amountPaid: amount,
            invoiceNumber: invoice.number,
            invoiceTotal: invoiceTotal,
            totalPaid: totalPaidNow,
            amountDue: Math.max(0, amountDueNow),
            paymentState: newPaymentState,
        };
    }
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PortalService);
//# sourceMappingURL=portal.service.js.map