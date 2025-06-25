
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Invoice, Child } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';

interface AdminBillingPageProps {
    invoices: Invoice[];
    loading: boolean;
    children: Child[];
    onOpenCreateInvoiceModal: (() => void) | null;
    onViewInvoiceDetails: (invoice: Invoice) => void;
}

export const AdminBillingPage: React.FC<AdminBillingPageProps> = ({ invoices, loading, children, onOpenCreateInvoiceModal, onViewInvoiceDetails }) => {
    if (loading && (!Array.isArray(invoices) || invoices.length === 0)) return <Loading />;

    const childNameMap = Array.isArray(children) ? children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
    }, {} as Record<string, string>) : {};

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Billing & Invoices</h2>
                {onOpenCreateInvoiceModal && (
                    <button onClick={onOpenCreateInvoiceModal} className="btn btn-primary btn-small">
                        <Icons.PlusCircle size={18} /> <span className="hidden sm:inline">New Invoice</span>
                    </button>
                )}
            </div>
            {(!loading && (!Array.isArray(invoices) || invoices.length === 0)) ? (
                <InfoMessage message="No invoices found." icon={Icons.DollarSign} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Invoice #</th>
                                <th className="th-cell">Child</th>
                                <th className="th-cell th-sm-hidden">Amount</th>
                                <th className="th-cell th-md-hidden">Due Date</th>
                                <th className="th-cell th-sm-hidden">Status</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(invoices) && invoices.map(invoice => (
                                <tr key={invoice.id} className="table-row">
                                    <td className="td-cell font-semibold">{invoice.invoice_number}</td>
                                    <td className="td-cell">{childNameMap[invoice.child_id] || 'N/A'}</td>
                                    <td className="td-cell th-sm-hidden">${Number(invoice.amount_due).toFixed(2)}</td>
                                    <td className="td-cell th-md-hidden">{invoice.due_date ? formatDateForInput(invoice.due_date) : 'N/A'}</td>
                                    <td className="td-cell td-sm-hidden">
                                        <span className={`status-badge status-badge-${invoice.status?.toLowerCase()}`}>{invoice.status}</span>
                                    </td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onViewInvoiceDetails(invoice)} className="btn-icon table-action-button" title="View Details">
                                            <Icons.Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
