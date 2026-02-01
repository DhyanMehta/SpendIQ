import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface LineItem {
    product?: { name: string } | null;
    description?: string;
    quantity: number | string;
    unitPrice: number | string;
    subtotal: number | string;
}

interface DocumentData {
    type: "INVOICE" | "PURCHASE_ORDER" | "SALES_ORDER";
    number: string;
    date: string;
    dueDate?: string;
    status: string;
    partner: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    lines: LineItem[];
    subtotal?: number;
    taxAmount?: number;
    totalAmount: number;
    notes?: string;
}

const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const generatePDF = (data: DocumentData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
    const textColor: [number, number, number] = [31, 41, 55];
    const grayColor: [number, number, number] = [107, 114, 128];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, "F");

    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SpendIQ", 14, 25);

    // Document Type
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const typeLabel = data.type === "INVOICE" ? "Invoice" :
        data.type === "PURCHASE_ORDER" ? "Purchase Order" : "Sales Order";
    doc.text(typeLabel, pageWidth - 14, 20, { align: "right" });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.number, pageWidth - 14, 30, { align: "right" });

    // Document Info Section
    let yPos = 55;

    // Left side - Partner Info
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const partnerLabel = data.type === "PURCHASE_ORDER" ? "Vendor" : "Customer";
    doc.text(`${partnerLabel}:`, 14, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(data.partner.name, 14, yPos + 7);

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    let partnerY = yPos + 14;
    if (data.partner.email) {
        doc.text(data.partner.email, 14, partnerY);
        partnerY += 5;
    }
    if (data.partner.phone) {
        doc.text(data.partner.phone, 14, partnerY);
        partnerY += 5;
    }
    if (data.partner.address) {
        const addressLines = doc.splitTextToSize(data.partner.address, 80);
        doc.text(addressLines, 14, partnerY);
    }

    // Right side - Document Details
    const rightX = pageWidth - 14;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);

    const details = [
        { label: "Date:", value: formatDate(data.date) },
        ...(data.dueDate ? [{ label: "Due Date:", value: formatDate(data.dueDate) }] : []),
        { label: "Status:", value: data.status },
    ];

    details.forEach((detail, index) => {
        const y = yPos + (index * 8);
        doc.setFont("helvetica", "bold");
        doc.text(detail.label, rightX - 50, y);
        doc.setFont("helvetica", "normal");
        doc.text(detail.value, rightX, y, { align: "right" });
    });

    // Line Items Table
    yPos = 100;

    const tableHeaders = ["#", "Product", "Quantity", "Unit Price", "Amount"];
    const tableData = data.lines.map((line, index) => [
        (index + 1).toString(),
        line.product?.name || line.description || "-",
        typeof line.quantity === "number" ? line.quantity.toString() : line.quantity,
        formatCurrency(line.unitPrice),
        formatCurrency(line.subtotal),
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: textColor,
        },
        columnStyles: {
            0: { cellWidth: 15, halign: "center" },
            1: { cellWidth: "auto" },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 35, halign: "right" },
            4: { cellWidth: 35, halign: "right" },
        },
        margin: { left: 14, right: 14 },
    });

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 14;

    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    let totalsY = finalY;

    if (data.subtotal !== undefined) {
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal:", totalsX - 50, totalsY);
        doc.text(formatCurrency(data.subtotal), totalsX, totalsY, { align: "right" });
        totalsY += 8;
    }

    if (data.taxAmount !== undefined && data.taxAmount > 0) {
        doc.text("Tax:", totalsX - 50, totalsY);
        doc.text(formatCurrency(data.taxAmount), totalsX, totalsY, { align: "right" });
        totalsY += 8;
    }

    // Total
    doc.setFillColor(240, 240, 240);
    doc.rect(totalsX - 80, totalsY - 5, 80, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total:", totalsX - 50, totalsY + 3);
    doc.text(formatCurrency(data.totalAmount), totalsX, totalsY + 3, { align: "right" });

    // Notes
    if (data.notes) {
        const notesY = totalsY + 25;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        doc.text("Notes:", 14, notesY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        const noteLines = doc.splitTextToSize(data.notes, pageWidth - 28);
        doc.text(noteLines, 14, notesY + 7);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text("Generated by SpendIQ", pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(new Date().toLocaleString(), pageWidth / 2, pageHeight - 5, { align: "center" });

    // Save the PDF
    const fileName = `${typeLabel.replace(" ", "_")}_${data.number}.pdf`;
    doc.save(fileName);
};

// Helper functions to prepare data from different document types
export const prepareInvoiceData = (invoice: any): DocumentData => ({
    type: "INVOICE",
    number: invoice.number,
    date: invoice.date,
    dueDate: invoice.dueDate,
    status: invoice.status,
    partner: {
        name: invoice.partner?.name || invoice.customer?.name || "-",
        email: invoice.partner?.email || invoice.customer?.email,
        phone: invoice.partner?.phone || invoice.customer?.phone,
        address: [
            invoice.partner?.street || invoice.customer?.street,
            invoice.partner?.city || invoice.customer?.city,
            invoice.partner?.state || invoice.customer?.state,
            invoice.partner?.pincode || invoice.customer?.pincode,
        ].filter(Boolean).join(", "),
    },
    lines: invoice.lines || [],
    subtotal: invoice.subtotal ? Number(invoice.subtotal) : undefined,
    taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : undefined,
    totalAmount: Number(invoice.totalAmount),
});

export const preparePurchaseOrderData = (po: any): DocumentData => ({
    type: "PURCHASE_ORDER",
    number: po.poNumber,
    date: po.orderDate,
    status: po.status,
    partner: {
        name: po.vendor?.name || "-",
        email: po.vendor?.email,
        phone: po.vendor?.phone,
        address: [
            po.vendor?.street,
            po.vendor?.city,
            po.vendor?.state,
            po.vendor?.pincode,
        ].filter(Boolean).join(", "),
    },
    lines: po.lines || [],
    subtotal: po.subtotal ? Number(po.subtotal) : undefined,
    taxAmount: po.taxAmount ? Number(po.taxAmount) : undefined,
    totalAmount: Number(po.totalAmount),
});

export const prepareSalesOrderData = (so: any): DocumentData => ({
    type: "SALES_ORDER",
    number: so.reference,
    date: so.date,
    status: so.status,
    partner: {
        name: so.customer?.name || "-",
        email: so.customer?.email,
        phone: so.customer?.phone,
        address: [
            so.customer?.street,
            so.customer?.city,
            so.customer?.state,
            so.customer?.pincode,
        ].filter(Boolean).join(", "),
    },
    lines: so.lines || [],
    totalAmount: Number(so.totalAmount),
});
