import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Parent } from '@/types';

interface EditParentModalProps {
    parent: Parent | null;
    onClose: () => void;
    onUpdateParent: (parentData: Parent) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const EditParentModal: React.FC<EditParentModalProps> = ({ parent, onClose, onUpdateParent, showAlert }) => {
    const [formData, setFormData] = useState<Parent>({ ...parent! });

    useEffect(() => {
        if (parent) {
            setFormData({ ...parent });
        }
    }, [parent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.first_name || !formData.last_name || !formData.email) {
            showAlert("First Name, Last Name, and Email are required.", "error");
            return;
        }
        onUpdateParent(formData);
    };

    if (!parent) return null;

    return (
        <Modal onClose={onClose} title={`Edit ${parent.first_name || ''} ${parent.last_name || ''}`} size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required icon={Icons.UserCircle2} />
                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Icons.Mail} />
                <InputField label="Phone Number" name="phone_number" type="tel" value={formData.phone_number || ''} onChange={handleChange} icon={Icons.Phone} />
                <h3 className="form-section-title">Address Information</h3>
                <InputField label="Address Line 1" name="address_line1" value={formData.address_line1 || ''} onChange={handleChange} />
                <InputField label="City" name="city" value={formData.city || ''} onChange={handleChange} />
                <InputField label="Province/State" name="province_state" value={formData.province_state || ''} onChange={handleChange} />
                <InputField label="Postal Code" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} />

                <FormActions onCancel={onClose} submitText="Save Changes" submitIcon={Icons.CheckCircle} />
            </form>
        </Modal>
    );
};
