
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Medication } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface EditMedicationModalProps {
    medication: Medication | null;
    onClose: () => void;
    onUpdateMedication: (medicationData: Medication) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({ medication, onClose, onUpdateMedication, showAlert }) => {
    const [formData, setFormData] = useState<Medication>({ ...medication! });

    useEffect(() => {
        if (medication) {
            setFormData({
                ...medication,
                start_date: formatDateForInput(medication.start_date),
                end_date: formatDateForInput(medication.end_date)
            });
        }
    }, [medication]);

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
        onUpdateMedication(formData);
    };

    if (!medication) return null;

    return (
        <Modal onClose={onClose} title={`Edit ${medication.medication_name}`} size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="Medication Name" name="medication_name" value={formData.medication_name} onChange={handleChange} required icon={Icons.Pill} />
                <InputField label="Dosage" name="dosage" value={formData.dosage || ''} onChange={handleChange} placeholder="e.g., 5ml" />
                <InputField label="Route" name="route" value={formData.route || ''} onChange={handleChange} placeholder="e.g., Oral" />
                <InputField label="Start Date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} />
                <InputField label="End Date (Optional)" name="end_date" type="date" value={formData.end_date || ''} onChange={handleChange} />
                <TextAreaField label="Frequency & Instructions" name="frequency_instructions" value={formData.frequency_instructions || ''} onChange={handleChange} placeholder="e.g., Once daily at lunch" />
                <TextAreaField label="Additional Notes" name="notes_instructions" value={formData.notes_instructions || ''} onChange={handleChange} placeholder="e.g., With food" />
                
                <FormActions onCancel={onClose} submitText="Save Changes" submitIcon={Icons.CheckCircle} />
            </form>
        </Modal>
    );
};
