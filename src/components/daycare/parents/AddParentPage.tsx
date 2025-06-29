
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Parent } from '@/types';

interface AddParentModalProps {
    onAddParent: (parentData: Omit<Parent, 'id' | 'created_at'>) => void;
    onClose: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const AddParentModal: React.FC<AddParentModalProps> = ({ onAddParent, onClose, showAlert }) => {
    const [formData, setFormData] = useState<Omit<Parent, 'id' | 'created_at'>>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address_line1: '',
        city: '',
        province_state: '',
        postal_code: '',
    });

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
        onAddParent(formData);
    };

    return (
        <Modal onClose={onClose} title="Add New Parent" size="medium">
            <form onSubmit={handleSubmit} className="form-layout">
                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required icon={Icons.UserCircle2} />
                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Icons.Mail} />
                <InputField label="Phone Number" name="phone_number" type="tel" value={formData.phone_number || ''} onChange={handleChange} icon={Icons.Phone} />
                <h3 className="form-section-title">Address Information</h3>
                <InputField label="Address Line 1" name="address_line1" value={formData.address_line1 || ''} onChange={handleChange} />
                <InputField label="City" name="city" value={formData.city || ''} onChange={handleChange} />
                <InputField label="Province/State" name="province_state" value={formData.province_state || ''} onChange={handleChange} />
                <InputField label="Postal Code" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} />

                <FormActions onCancel={onClose} submitText="Add Parent" submitIcon={Icons.UserPlus} />
            </form>
        </Modal>
    );
};
