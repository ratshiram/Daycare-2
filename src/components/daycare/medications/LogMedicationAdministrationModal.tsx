
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Medication, MedicationLog } from '@/types';
import { formatDateTimeForInput } from '@/lib/customUtils';

interface LogMedicationAdministrationModalProps {
    medicationToLog: Medication;
    childId: string;
    onClose: () => void;
    onLogAdministration: (logData: Omit<MedicationLog, 'id' | 'created_at' | 'administered_by_staff_id'>) => void;
    currentUser: any;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const LogMedicationAdministrationModal: React.FC<LogMedicationAdministrationModalProps> = ({
    medicationToLog, childId, onClose, onLogAdministration, currentUser, showAlert
}) => {
    const [formData, setFormData] = useState<Omit<MedicationLog, 'id' | 'created_at' | 'administered_by_staff_id'>>({
        medication_id: medicationToLog.id,
        child_id: childId,
        administered_at: formatDateTimeForInput(new Date()),
        actual_dosage_given: medicationToLog.dosage || '',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.actual_dosage_given) {
            showAlert("Actual Dosage is required.", "error");
            return;
        }
        if (!currentUser?.staff_id) {
            showAlert("Cannot log administration: your staff profile is not loaded.", "error");
            return;
        }
        onLogAdministration(formData);
    };

    return (
        <Modal onClose={onClose} title={`Log Dose for ${medicationToLog.medication_name}`} size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField
                    label="Administration Time"
                    name="administered_at"
                    type="datetime-local"
                    value={formData.administered_at}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Actual Dosage Given"
                    name="actual_dosage_given"
                    value={formData.actual_dosage_given}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 5ml"
                />
                <TextAreaField
                    label="Notes (Optional)"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="e.g., Child took it well."
                />
                <p className="text-sm text-muted-foreground col-span-2">
                    Logged by: {currentUser?.name || 'Loading...'}
                </p>
                <FormActions onCancel={onClose} submitText="Log Administration" submitIcon={Icons.ListChecks} />
            </form>
        </Modal>
    );
};
