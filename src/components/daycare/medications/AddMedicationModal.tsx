
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Medication } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface AddMedicationModalProps {
    childId: string;
    onClose: () => void;
    onAddMedication: (medicationData: Omit<Medication, 'id' | 'created_at'>) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ childId, onClose, onAddMedication, showAlert }) => {
    const [formData, setFormData] = useState<Omit<Medication, 'id' | 'created_at'>>({
        child_id: childId,
        medication_name: '',
        dosage: '',
        route: '',
        frequency_instructions: '',
        start_date: formatDateForInput(new Date()),
        end_date: '',
        notes_instructions: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.medication_name) {
            showAlert("Medication Name is required.", "error");
            return;
        }
        onAddMedication(formData);
    };

    return (
        <Modal onClose={onClose} title="Add New Medication" size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="Medication Name" name="medication_name" value={formData.medication_name} onChange={handleChange} required icon={Icons.Pill} />
                <InputField label="Dosage" name="dosage" value={formData.dosage || ''} onChange={handleChange} placeholder="e.g., 5ml" />
                <InputField label="Route" name="route" value={formData.route || ''} onChange={handleChange} placeholder="e.g., Oral" />
                <InputField label="Start Date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} />
                <InputField label="End Date (Optional)" name="end_date" type="date" value={formData.end_date || ''} onChange={handleChange} />
                <TextAreaField label="Frequency & Instructions" name="frequency_instructions" value={formData.frequency_instructions || ''} onChange={handleChange} placeholder="e.g., Once daily at lunch" />
                <TextAreaField label="Additional Notes" name="notes_instructions" value={formData.notes_instructions || ''} onChange={handleChange} placeholder="e.g., With food" />
                
                <FormActions onCancel={onClose} submitText="Add Medication" submitIcon={Icons.PlusCircle} />
            </form>
        </Modal>
    );
};
