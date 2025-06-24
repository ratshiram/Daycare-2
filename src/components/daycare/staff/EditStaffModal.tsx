import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Staff, Room } from '@/types';

interface EditStaffModalProps {
    staffMember: Staff | null;
    onClose: () => void;
    onUpdateStaff: (staffData: Staff) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    rooms: Room[];
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staffMember, onClose, onUpdateStaff, showAlert, rooms }) => {
    const [formData, setFormData] = useState<Staff>({ ...staffMember! });

    useEffect(() => {
        if (staffMember) {
            setFormData({ ...staffMember });
        }
    }, [staffMember]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'role' && value !== 'teacher' && { main_room_id: '' })
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role) {
            showAlert("Name and Role are required.", "error");
            return;
        }
        if (formData.role === 'teacher' && !formData.main_room_id) {
            showAlert("A Main Room must be selected for a teacher.", "error");
            return;
        }
        onUpdateStaff({ ...formData, id: staffMember!.id });
    };

    if (!staffMember) return null;

    return (
        <Modal onClose={onClose} title={`Edit ${staffMember.name || 'Staff Member'}`} size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required icon={Icons.UserCircle2} />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={Icons.Mail} />
                <SelectField label="Role" name="role" value={formData.role} onChange={handleChange} required icon={Icons.Award}>
                    <option value="teacher">Teacher</option>
                    <option value="assistant">Assistant</option>
                    <option value="admin">Admin</option>
                </SelectField>
                {(formData.role === 'teacher') && (
                    <SelectField
                        label="Main Room" name="main_room_id" value={formData.main_room_id || ''} onChange={handleChange}
                        required={(formData.role === 'teacher')}
                        icon={Icons.Building}>
                        <option value="">Select Main Room</option>
                        {Array.isArray(rooms) && rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </SelectField>
                )}
                <InputField label="Contact Phone" name="contact_phone" type="tel" value={formData.contact_phone || ''} onChange={handleChange} icon={Icons.Phone} />
                <TextAreaField label="Qualifications" name="qualifications" value={formData.qualifications || ''} onChange={handleChange} />
                <InputField label="Emergency Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleChange} />
                <InputField label="Emergency Contact Phone" name="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone || ''} onChange={handleChange} />
                <TextAreaField label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
                <FormActions onCancel={onClose} submitText="Save Changes" submitIcon={Icons.CheckCircle} />
            </form>
        </Modal>
    );
};
