
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, Parent, Room } from '@/types';

interface AddChildModalProps {
    onAddChild: (childData: Omit<Child, 'id' | 'created_at'>) => void;
    onClose: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    parentsList: Parent[];
    rooms: Room[];
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ onAddChild, onClose, showAlert, parentsList, rooms }) => {
    const [formData, setFormData] = useState<Omit<Child, 'id' | 'created_at'>>({
        name: '', age: null, primary_parent_id: '', current_room_id: '', emergency_contact: '',
        allergies: '', notes: '', medical_info: {}, authorized_pickups: [], billing: {}
    });
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [selectedParentName, setSelectedParentName] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = (type === 'number') ? (value === '' ? null : parseInt(value, 10)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'medical_info' | 'billing') => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [field]: { ...prev[field], [name]: value } }));
    };

    const handleParentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setParentSearchTerm(term);
        if (term.length > 1) {
            setFilteredParents((Array.isArray(parentsList) ? parentsList : []).filter(p =>
                `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(term.toLowerCase()) ||
                (p.email || '').toLowerCase().includes(term.toLowerCase())
            ).slice(0, 5));
        } else {
            setFilteredParents([]);
        }
        if (term === '') {
            setFormData(prev => ({ ...prev, primary_parent_id: '' }));
            setSelectedParentName('');
        }
    };

    const handleSelectParent = (parent: Parent) => {
        setFormData(prev => ({ ...prev, primary_parent_id: parent.id }));
        setSelectedParentName(`${parent.first_name} ${parent.last_name} (${parent.email})`);
        setParentSearchTerm(`${parent.first_name} ${parent.last_name}`);
        setFilteredParents([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.age === null || !formData.primary_parent_id) {
            showAlert("Child's Name, Age, and Primary Parent are required.", "error");
            return;
        }
        onAddChild(formData);
    };

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

                <h3 className="form-section-title">Primary Parent/Guardian</h3>
                <div className="input-group">
                    <InputField label="Search for Parent (Name or Email)" id="parentSearch" name="parentSearch" value={parentSearchTerm} onChange={handleParentSearchChange} icon={Icons.Search} placeholder="Type to search..." />
                    {filteredParents.length > 0 && (
                        <ul className="search-results-list">{filteredParents.map(parent => (
                            <li key={parent.id} onClick={() => handleSelectParent(parent)} className="search-result-item">{`${parent.first_name} ${parent.last_name}`} ({parent.email})</li>
                        ))}</ul>
                    )}
                    {formData.primary_parent_id && selectedParentName && (<InfoMessage type="success" message={`Selected Parent: ${selectedParentName}`} icon={Icons.UserCheck} />)}
                    {!formData.primary_parent_id && parentSearchTerm.length > 1 && filteredParents.length === 0 && (<InfoMessage type="warning" message="No parent found. Add parent via 'Manage Parents' tab first." />)}
                </div>

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
