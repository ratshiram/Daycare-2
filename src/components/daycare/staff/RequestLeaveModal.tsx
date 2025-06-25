
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { StaffLeaveRequest } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface RequestLeaveModalProps {
    onClose: () => void;
    onSubmitRequest: (requestData: Omit<StaffLeaveRequest, 'id' | 'created_at' | 'staff_id' | 'status'>) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ onClose, onSubmitRequest, showAlert }) => {
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date) {
            showAlert("Start Date and End Date are required.", "error");
            return;
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            showAlert("Start Date cannot be after End Date.", "error");
            return;
        }
        onSubmitRequest(formData);
    };

    return (
        <Modal onClose={onClose} title="Request Time Off" size="medium">
            <form onSubmit={handleSubmit} className="form-layout">
                <InputField 
                    label="Start Date" 
                    name="start_date" 
                    type="date" 
                    value={formData.start_date} 
                    onChange={handleChange} 
                    required 
                    min={formatDateForInput(new Date())}
                />
                <InputField 
                    label="End Date" 
                    name="end_date" 
                    type="date" 
                    value={formData.end_date} 
                    onChange={handleChange} 
                    required 
                    min={formData.start_date || formatDateForInput(new Date())}
                />
                <div className="md:col-span-2">
                    <TextAreaField 
                        label="Reason for Leave (Optional)" 
                        name="reason" 
                        value={formData.reason} 
                        onChange={handleChange} 
                        rows={4}
                    />
                </div>
                <FormActions onCancel={onClose} submitText="Submit Request" submitIcon={Icons.Plane} />
            </form>
        </Modal>
    );
};

    