import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, Child, Parent } from '@/types';
import { formatDateForInput } from './customUtils';

export const generateInvoicePDF = (invoice: Invoice, child: Child, parentDetails: Parent | null) => {
    const doc = new jsPDF();
    const pageMargin = 15;
    const lineHeight = 7;
    let currentY = pageMargin;

    const daycareName = "Evergreen Tots";
    const daycareAddress = "123 Green Way, Meadowville, PV 1A2 B3C";
    const daycareContact = "Phone: (555) 123-4567 | Email: contact@evergreentots.com";

    const addText = (text: string, x: number, y: number, options: any = {}) => {
        doc.setFontSize(options.fontSize || 10);
        doc.setFont(options.fontStyle || 'normal');
        doc.text(text, x, y);
        if (options.moveY !== false) currentY += (options.customLineHeight || lineHeight);
    };

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("INVOICE", pageMargin, currentY);
    currentY += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addText(daycareName, pageMargin, currentY, {});
    addText(daycareAddress, pageMargin, currentY, {});
    addText(daycareContact, pageMargin, currentY, {});
    currentY += lineHeight;

    const rightColumnX = doc.internal.pageSize.getWidth() / 2 + 10;
    const detailsXOffset = 30;
    const initialDetailsY = currentY;

    addText("BILL TO:", pageMargin, currentY, { fontStyle: 'bold' });
    if (parentDetails) {
        addText(`${parentDetails.first_name || ''} ${parentDetails.last_name || ''}`.trim(), pageMargin, currentY, {});
        if (parentDetails.address_line1) addText(parentDetails.address_line1, pageMargin, currentY, {});
        let cityProvincePostal = [parentDetails.city, parentDetails.province_state, parentDetails.postal_code].filter(Boolean).join(', ');
        if (cityProvincePostal) addText(cityProvincePostal, pageMargin, currentY, {});
        if (parentDetails.email) addText(parentDetails.email, pageMargin, currentY, {});
    }
    addText(`For Child: ${child?.name || 'N/A'}`, pageMargin, currentY, { fontSize: 9, fontStyle: 'italic' });

    let billToLines = 2;
    if (parentDetails) {
        billToLines += (parentDetails.first_name || parentDetails.last_name ? 1 : 0);
        billToLines += (parentDetails.address_line1 ? 1 : 0);
        billToLines += ((parentDetails.city || parentDetails.province_state || parentDetails.postal_code) ? 1 : 0);
        billToLines += (parentDetails.email ? 1 : 0);
    }
    
    currentY = initialDetailsY;
    addText("Invoice #:", rightColumnX, currentY, { moveY: false, fontStyle: 'bold' });
    doc.text(invoice.invoice_number || "N/A", rightColumnX + detailsXOffset, currentY);
    currentY += lineHeight;
    addText("Issue Date:", rightColumnX, currentY, { moveY: false, fontStyle: 'bold' });
    doc.text(formatDateForInput(invoice.invoice_date) || "N/A", rightColumnX + detailsXOffset, currentY);
    currentY += lineHeight;
    addText("Due Date:", rightColumnX, currentY, { moveY: false, fontStyle: 'bold' });
    doc.text(invoice.due_date ? formatDateForInput(invoice.due_date) : "N/A", rightColumnX + detailsXOffset, currentY);
    currentY += lineHeight;
    addText("Status:", rightColumnX, currentY, { moveY: false, fontStyle: 'bold' });
    doc.text(invoice.status || "N/A", rightColumnX + detailsXOffset, currentY);
    currentY += lineHeight;

    currentY = Math.max(currentY, initialDetailsY + billToLines * lineHeight);
    currentY += lineHeight;
    
    const tableColumnStyles = { 0: { cellWidth: 'auto' }, 1: { cellWidth: 30, halign: 'right' as const }, };
    const tableHeader = [['Description', 'Amount ($)']];
    const tableBody = (invoice.items || []).map(item => [item.description, parseFloat(item.amount).toFixed(2)]);
    
    autoTable(doc, {
        startY: currentY,
        head: tableHeader,
        body: tableBody,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [135, 206, 235], textColor: 255, fontStyle: 'bold' },
        columnStyles: tableColumnStyles,
        margin: { left: pageMargin, right: pageMargin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + lineHeight;
    const totalAmountDue = parseFloat(invoice.amount_due).toFixed(2);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount Due: $${totalAmountDue}`, doc.internal.pageSize.getWidth() - pageMargin, currentY, { align: 'right' });
    currentY += lineHeight * 1.5;

    if (invoice.notes_to_parent) {
        addText("Notes:", pageMargin, currentY, { fontStyle: 'bold' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(invoice.notes_to_parent, doc.internal.pageSize.getWidth() - pageMargin * 2);
        doc.text(notesLines, pageMargin, currentY);
        currentY += notesLines.length * (lineHeight * 0.7);
    }
    currentY += lineHeight;

    let footerY = doc.internal.pageSize.getHeight() - 10;
    if (currentY > footerY - lineHeight) {
        doc.addPage();
        currentY = pageMargin;
        footerY = doc.internal.pageSize.getHeight() - 10;
    }
    addText("Thank you for your business!", pageMargin, footerY - lineHeight, { fontSize: 9, fontStyle: 'italic', moveY: false });
    addText(`Invoice generated on: ${new Date().toLocaleDateString()}`, pageMargin, footerY, { fontSize: 8, moveY: false });

    doc.save(`Invoice-${invoice.invoice_number || child?.name.replace(/\s+/g, '_') || 'details'}.pdf`);
};
