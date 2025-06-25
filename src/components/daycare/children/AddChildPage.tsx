
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Parent, Room } from '@/types';

interface AddChildModalProps {
    onAddChild: (childData: Omit<Child, 'id' | 'created_at' | 'primary_parent' | 'parent_2'>) => void;
    onClose: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    parentsList: Parent[];
    rooms: Room[];
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ onAddChild, onClose, showAlert, parentsList, rooms }) => {
    const [formData, setFormData] = useState<Omit<Child, 'id' | 'created_at' | 'primary_parent' | 'parent_2'>>({
        name: '', age: null, current_room_id: '', primary_parent_id: '', parent_2_id: '', emergency_contact: '',
        allergies: '', notes: '', medical_info: {}, authorized_pickups: [], billing: {}
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = (type === 'number') ? (value === '' ? null : parseInt(value, 10)) : value;

        if (name === 'primary_parent_id' && value === formData.parent_2_id) {
            setFormData(prev => ({ ...prev, parent_2_id: '', [name]: val }));
        } else if (name === 'parent_2_id' && value === formData.primary_parent_id) {
            showAlert("Primary and Parent 2 cannot be the same.", "warning");
        }
        else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'medical_info' | 'billing') => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [field]: { ...prev[field], [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.age === null) {
            showAlert("Child's Name and Age are required.", "error"); return;
        }
        if (!formData.primary_parent_id) {
            showAlert("A primary parent must be selected.", "error"); return;
        }
        
        onAddChild(formData);
    };

    const availableOtherParents = parentsList.filter(p => p.id !== formData.primary_parent_id);

    return (
        <Modal onClose={onClose} title="Add New Child" size="large">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <h3 className="form-section-title">Child Information</h3>
                <InputField label="Child's Full Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Child's Age" id="age" name="age" type="number" value={formData.age === null ? '' : formData.age} onChange={handleChange} required />
                <SelectField label="Assign to Room" id="current_room_id" name="current_room_id" value={formData.current_room_id || ''} onChange={handleChange} icon={Icons.Building}>
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
                <SelectField label="Parent 2 (Optional)" name="parent_2_id" value={formData.parent_2_id || ''} onChange={handleChange} icon={Icons.UserCog}>
                    <option value="">Select a Parent</option>
                    {availableOtherParents.map(parent => (
                        <option key={parent.id} value={parent.id}>{`${parent.first_name} ${parent.last_name}`}</option>
                    ))}
                </SelectField>

                <h3 className="form-section-title">Additional Child Information</h3>
                <InputField label="Emergency Contact (Name & Phone)" id="emergency_contact" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} />
                <TextAreaField label="Allergies" id="allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} />
                <TextAreaField label="General Notes" id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} />

                <h3 className="form-section-title">Medical Information</h3>
                <InputField label="Doctor's Name" name="doctorName" value={formData.medical_info.doctorName || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />
                <InputField label="Doctor's Phone" name="doctorPhone" value={formData.medical_info.doctorPhone || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />
                <TextAreaField label="Known Conditions" name="conditions" value={formData.medical_info.conditions || ''} onChange={(e) => handleJsonChange(e, 'medical_info')} />

                <FormActions onCancel={onClose} submitText="Add Child" submitIcon={Icons.PlusCircle} />
            </form>
        </Modal>
    );
};

    