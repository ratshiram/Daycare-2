
import React from 'react';
import { Modal } from '../ui/Modal';
import { Icons } from '@/components/Icons';
import type { Invoice, Child, Parent } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import { generateInvoicePDF } from '@/lib/pdf';

interface ViewInvoiceDetailsModalProps {
    invoice: Invoice | null;
    child: Child | undefined;
    parentDetails: Parent | null;
    onClose: () => void;
}

export const ViewInvoiceDetailsModal: React.FC<ViewInvoiceDetailsModalProps> = ({ invoice, child, parentDetails, onClose }) => {
    if (!invoice || !child) return null;

    const handleDownloadPdf = () => {
        if (invoice && child) {
            const primaryParent = child.child_parents?.find(cp => cp.is_primary)?.parents || parentDetails;
            generateInvoicePDF(invoice, child, primaryParent);
        }
    };
    
    return (
        <Modal onClose={onClose} title={`Invoice #${invoice.invoice_number}`} size="large">
            <div className="invoice-details-container p-4">
                <header className="invoice-header-section border-b pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Evergreen Tots</h2>
                        <p>123 Green Way, Meadowville</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-2xl font-bold">INVOICE</h3>
                        <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
                        <p><strong>Status:</strong> <span className={`status-badge status-badge-${invoice.status?.toLowerCase()}`}>{invoice.status}</span></p>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="invoice-section-title">BILL TO</h4>
                        <p className="font-semibold">{`${parentDetails?.first_name || ''} ${parentDetails?.last_name || ''}`.trim()}</p>
                        <p>{parentDetails?.address_line1 || 'N/A'}</p>
                        <p>{`${parentDetails?.city || ''}, ${parentDetails?.province_state || ''} ${parentDetails?.postal_code || ''}`.trim()}</p>
                        <p><strong>For Child:</strong> {child.name}</p>
                    </div>
                    <div className="text-right md:text-left">
                        <p><strong>Issue Date:</strong> {formatDateForInput(invoice.invoice_date)}</p>
                        <p><strong>Due Date:</strong> {invoice.due_date ? formatDateForInput(invoice.due_date) : 'N/A'}</p>
                    </div>
                </section>
                
                <section>
                    <table className="w-full text-left mb-8">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.items || []).map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2 text-right">${Number(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-end items-center mb-8">
                    <div className="text-right">
                        <p className="text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">${Number(invoice.amount_due).toFixed(2)}</p>
                    </div>
                </section>

                {invoice.notes_to_parent && (
                    <section className="mb-8">
                        <h4 className="invoice-section-title">Notes</h4>
                        <p className="text-sm text-muted-foreground">{invoice.notes_to_parent}</p>
                    </section>
                )}

                <div className="modal-footer flex justify-end gap-2 pt-4 border-t">
                    <button onClick={handleDownloadPdf} className="btn btn-primary">
                        <Icons.Download size={18} /> Download PDF
                    </button>
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                </div>
            </div>
        </Modal>
    );
};
