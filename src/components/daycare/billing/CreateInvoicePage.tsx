
import React, { useState, useEffect } from 'react';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Invoice } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface CreateInvoicePageProps {
    children: Child[];
    onAddInvoice: (invoiceData: Omit<Invoice, 'id' | 'created_at'>) => void;
    onCancel: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({ children, onAddInvoice, onCancel, showAlert }) => {
    const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'created_at'>>({
        child_id: '',
        invoice_number: `INV-${Date.now()}`,
        invoice_date: formatDateForInput(new Date()),
        due_date: '',
        amount_due: 0,
        status: 'Unpaid',
        items: [{ description: 'Monthly Fee', amount: 0 }],
        notes_to_parent: '',
    });

    useEffect(() => {
        const total = formData.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
        setFormData(prev => ({ ...prev, amount_due: total }));
    }, [formData.items]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
        const newItems = [...(formData.items || [])];
        const itemValue = field === 'amount' ? parseFloat(value) || 0 : value;
        (newItems[index] as any)[field] = itemValue;
        setFormData(prev => ({ ...prev, items: newItems }));
    };
    
    const addItem = () => setFormData(prev => ({ ...prev, items: [...(prev.items || []), { description: '', amount: 0 }] }));
    const removeItem = (index: number) => setFormData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.child_id) {
            showAlert("Please select a child.", "error");
            return;
        }
        if (!formData.items || formData.items.length === 0) {
            showAlert("Invoice must have at least one line item.", "error");
            return;
        }
        onAddInvoice(formData);
    };

    return (
        <div className="page-card form-page-card">
            <button onClick={onCancel} className="btn btn-secondary btn-small btn-back"><Icons.ArrowLeft size={18} /> Back to Billing</button>
            <h2 className="page-card-title form-page-title mt-4">Create New Invoice</h2>
            <form onSubmit={handleSubmit} className="form-layout">
                <SelectField label="Child" name="child_id" value={formData.child_id} onChange={handleChange} required icon={Icons.Smile}>
                    <option value="">Select Child</option>
                    {Array.isArray(children) && children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
                </SelectField>
                <InputField label="Invoice Number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} required />
                <InputField label="Invoice Date" name="invoice_date" type="date" value={formData.invoice_date} onChange={handleChange} required />
                <InputField label="Due Date" name="due_date" type="date" value={formData.due_date || ''} onChange={handleChange} />
                
                <h3 className="form-section-title">Invoice Items</h3>
                {formData.items?.map((item, index) => (
                    <div key={index} className="form-row grid grid-cols-12 gap-2 col-span-2 items-end">
                        <div className="col-span-7">
                            <InputField label={`Item ${index + 1}`} name={`description_${index}`} value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Description" />
                        </div>
                        <div className="col-span-3">
                            <InputField label="Amount" name={`amount_${index}`} type="number" value={item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} placeholder="0.00" step="0.01" />
                        </div>
                        <div className="col-span-2">
                            <button type="button" onClick={() => removeItem(index)} className="btn btn-danger btn-small w-full">Remove</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="btn btn-secondary btn-small col-span-2 justify-self-start">Add Item</button>

                <h3 className="form-section-title">Summary & Notes</h3>
                <TextAreaField label="Notes to Parent" name="notes_to_parent" value={formData.notes_to_parent || ''} onChange={handleChange} />
                <div className="md:col-span-2 text-right text-lg font-bold">Total: ${formData.amount_due.toFixed(2)}</div>
                
                <FormActions onCancel={onCancel} submitText="Create Invoice" submitIcon={Icons.PlusCircle} />
            </form>
        </div>
    );
};
