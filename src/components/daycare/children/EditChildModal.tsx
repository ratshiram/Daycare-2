
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Parent, Room } from '@/types';

interface EditChildModalProps {
    child: Child | null;
    onClose: () => void;
    onUpdateChild: (updatedChildData: Child) => void;
    parentsList: Parent[];
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    rooms: Room[];
}

export const EditChildModal: React.FC<EditChildModalProps> = ({ child, onClose, onUpdateChild, parentsList, showAlert, rooms }) => {
    const [formData, setFormData] = useState<Child>({ ...child! });

    useEffect(() => {
        if (child) {
            setFormData({
                ...child,
                age: (child.age === null || child.age === undefined) ? null : child.age,
                medical_info: child.medical_info || {},
                billing: child.billing || {},
            });
        }
    }, [child]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? null : parseInt(value, 10)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'medical_info' | 'billing') => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [field]: { ...prev[field], [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.age === null) {
            showAlert("Name and Age are required.", "error"); return;
        }
        if (!formData.primary_parent_id) {
            showAlert("A primary parent must be selected.", "error"); return;
        }
        onUpdateChild({ ...formData, id: child!.id });
    };

    if (!child) return null;

    return (
        <Modal onClose={onClose} title={`Edit ${child.name || 'Child'}`} size="large">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="Full Name" id="edit_name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Age" id="edit_age" name="age" type="number" value={formData.age === null ? '' : formData.age} onChange={handleChange} required />
                <SelectField label="Assigned Room" id="edit_current_room_id" name="current_room_id" value={formData.current_room_id || ''} onChange={handleChange} icon={Icons.Building}>
                    <option value="">Select a Room (Optional)</option>
                    {Array.isArray(rooms) && rooms.map(room => (<option key={room.id} value={room.id}>{room.name}</option>))}
                </SelectField>

                <h3 className="form-section-title">Parent/Guardian</h3>
                 <SelectField label="Primary Parent" name="primary_parent_id" value={formData.primary_parent_id || ''} onChange={handleChange} required icon={Icons.UserCog}>
                    <option value="">Select a Parent</option>
                    {Array.isArray(parentsList) && parentsList.map(parent => (
                        <option key={parent.id} value={parent.id}>{`${parent.first_name} ${parent.last_name}`}</option>
                    ))}
                </SelectField>

                <InputField label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} />
                <TextAreaField label="Allergies" id="edit_allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} />
                <TextAreaField label="Notes" id="edit_notes" name="notes" value={formData.notes || ''} onChange={handleChange} />

                <h3 className="form-section-title">Medical Information</h3>
                <InputField label="Doctor's Name" name="doctorName" value={formData.medical_info?.doctorName || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />
                <InputField label="Doctor's Phone" name="doctorPhone" value={formData.medical_info?.doctorPhone || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />
                <TextAreaField label="Known Conditions" name="conditions" value={formData.medical_info?.conditions || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />

                <h3 className="form-section-title">Billing</h3>
                <InputField label="Monthly Fee" name="monthly_fee" type="number" value={formData.billing?.monthly_fee || ''} onChange={(e) => handleJsonChange(e, 'billing')} />

                <FormActions onCancel={onClose} submitText="Save Changes" submitIcon={Icons.CheckCircle} />
            </form>
        </Modal>
    );
};

    
