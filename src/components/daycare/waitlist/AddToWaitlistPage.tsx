
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { WaitlistEntry } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface AddOrEditWaitlistModalProps {
    onAddOrUpdateWaitlistEntry: (entryData: Omit<WaitlistEntry, 'id' | 'created_at'>, isEditing: boolean) => void;
    onCancel: () => void;
    initialData: WaitlistEntry | null;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const AddOrEditWaitlistModal: React.FC<AddOrEditWaitlistModalProps> = ({ onAddOrUpdateWaitlistEntry, onCancel, initialData, showAlert }) => {
    const isEditing = !!initialData;

    const [formData, setFormData] = useState<Omit<WaitlistEntry, 'id' | 'created_at'>>({
        child_name: '',
        child_dob: '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        requested_start_date: '',
        notes: '',
        status: 'Pending',
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                child_name: initialData.child_name,
                child_dob: initialData.child_dob ? formatDateForInput(initialData.child_dob) : '',
                parent_name: initialData.parent_name,
                parent_email: initialData.parent_email || '',
                parent_phone: initialData.parent_phone || '',
                requested_start_date: initialData.requested_start_date ? formatDateForInput(initialData.requested_start_date) : '',
                notes: initialData.notes || '',
                status: initialData.status || 'Pending',
            });
        } else {
            setFormData({
                child_name: '',
                child_dob: '',
                parent_name: '',
                parent_email: '',
                parent_phone: '',
                requested_start_date: '',
                notes: '',
                status: 'Pending',
            });
        }
    }, [isEditing, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.child_name || !formData.parent_name) {
            showAlert("Child Name and Parent Name are required.", "error");
            return;
        }
        onAddOrUpdateWaitlistEntry(formData, isEditing);
    };

    return (
        <Modal onClose={onCancel} title={isEditing ? 'Edit Waitlist Entry' : 'Add to Waitlist'} size="medium">
            <form onSubmit={handleSubmit} className="form-layout">
                <h3 className="form-section-title">Child Information</h3>
                <InputField label="Child's Full Name" name="child_name" value={formData.child_name} onChange={handleChange} required icon={Icons.Smile} />
                <InputField label="Child's Date of Birth" name="child_dob" type="date" value={formData.child_dob || ''} onChange={handleChange} />
                
                <h3 className="form-section-title">Parent Information</h3>
                <InputField label="Parent's Full Name" name="parent_name" value={formData.parent_name} onChange={handleChange} required icon={Icons.UserCircle2} />
                <InputField label="Parent's Email" name="parent_email" type="email" value={formData.parent_email || ''} onChange={handleChange} icon={Icons.Mail} />
                <InputField label="Parent's Phone" name="parent_phone" type="tel" value={formData.parent_phone || ''} onChange={handleChange} icon={Icons.Phone} />

                <h3 className="form-section-title">Request Details</h3>
                <InputField label="Requested Start Date" name="requested_start_date" type="date" value={formData.requested_start_date || ''} onChange={handleChange} />
                <SelectField label="Status" name="status" value={formData.status || 'Pending'} onChange={handleChange} required>
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Withdrawn">Withdrawn</option>
                </SelectField>
                <TextAreaField label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
                
                <FormActions 
                    onCancel={onCancel} 
                    submitText={isEditing ? 'Save Changes' : 'Add to Waitlist'} 
                    submitIcon={isEditing ? Icons.CheckCircle : Icons.PlusCircle} 
                />
            </form>
        </Modal>
    );
};
