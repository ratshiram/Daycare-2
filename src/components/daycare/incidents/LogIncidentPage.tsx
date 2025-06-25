
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { CheckboxField } from '../ui/CheckboxField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Staff, IncidentReport } from '@/types';
import { formatDateTimeForInput } from '@/lib/customUtils';

interface LogIncidentModalProps {
    children: Child[];
    staff: Staff[];
    currentUser: any;
    onLogIncident: (incidentData: Omit<IncidentReport, 'id' | 'created_at'>) => void;
    onCancel: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const LogIncidentModal: React.FC<LogIncidentModalProps> = ({ children, onLogIncident, onCancel, showAlert }) => {
    const [formData, setFormData] = useState<Omit<IncidentReport, 'id' | 'created_at' | 'reported_by_staff_id'>>({
        child_id: null,
        incident_datetime: formatDateTimeForInput(new Date()),
        description: '',
        location: '',
        actions_taken: '',
        witnesses: '',
        parent_notified: false,
        parent_notification_datetime: null,
        status: 'Open',
        admin_follow_up_notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.child_id || !formData.incident_datetime || !formData.description) {
            showAlert("Child, Incident Time, and Description are required.", "error");
            return;
        }
        onLogIncident(formData);
    };

    return (
        <Modal onClose={onCancel} title="Log New Incident Report" size="large">
            <form onSubmit={handleSubmit} className="form-layout">
                <SelectField label="Child Involved" name="child_id" value={formData.child_id || ''} onChange={handleChange} required icon={Icons.Smile}>
                    <option value="">Select Child</option>
                    {Array.isArray(children) && children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
                </SelectField>
                <InputField label="Incident Date & Time" name="incident_datetime" type="datetime-local" value={formData.incident_datetime} onChange={handleChange} required />
                <InputField label="Location of Incident" name="location" value={formData.location || ''} onChange={handleChange} />
                <SelectField label="Status" name="status" value={formData.status || 'Open'} onChange={handleChange} required>
                    <option value="Open">Open</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                </SelectField>

                <h3 className="form-section-title">Incident Details</h3>
                <TextAreaField label="Description of Incident" name="description" value={formData.description} onChange={handleChange} required />
                <TextAreaField label="Actions Taken" name="actions_taken" value={formData.actions_taken || ''} onChange={handleChange} />
                <InputField label="Witnesses (if any)" name="witnesses" value={formData.witnesses || ''} onChange={handleChange} />

                <h3 className="form-section-title">Parent Notification</h3>
                <CheckboxField label="Parent has been notified" name="parent_notified" checked={formData.parent_notified || false} onChange={handleChange} />
                {formData.parent_notified && (
                    <InputField label="Notification Date & Time" name="parent_notification_datetime" type="datetime-local" value={formData.parent_notification_datetime || ''} onChange={handleChange} />
                )}

                <FormActions onCancel={onCancel} submitText="Log Incident" submitIcon={Icons.FilePlus} />
            </form>
        </Modal>
    );
};
