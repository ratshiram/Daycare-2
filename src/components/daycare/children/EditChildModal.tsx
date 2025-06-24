import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { InfoMessage } from '../ui/InfoMessage';
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
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [selectedParentName, setSelectedParentName] = useState('');

    useEffect(() => {
        if (child) {
            setFormData({
                ...child,
                age: (child.age === null || child.age === undefined) ? null : child.age,
                medical_info: child.medical_info || {},
                billing: child.billing || {},
            });
            if (child.primary_parent_id && Array.isArray(parentsList) && parentsList.length > 0) {
                const linkedParent = parentsList.find(p => p.id === child.primary_parent_id);
                if (linkedParent) {
                    const name = `${linkedParent.first_name} ${linkedParent.last_name}`;
                    setSelectedParentName(`${name} (${linkedParent.email})`);
                    setParentSearchTerm(name);
                }
            } else if (child.parents) {
                const name = `${child.parents.first_name || ''} ${child.parents.last_name || ''}`;
                setSelectedParentName(`${name} (${child.parents.email || ''})`.trim());
                setParentSearchTerm(name.trim());
            }
        }
    }, [child, parentsList]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? null : parseInt(value, 10)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'medical_info' | 'billing') => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [field]: { ...prev[field], [name]: value } }));
    };

    const handleParentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setParentSearchTerm(term);
        if (term.length > 1 && Array.isArray(parentsList)) {
            setFilteredParents(parentsList.filter(p =>
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
        if (!formData.name || formData.age === null) {
            showAlert("Name and Age are required.", "error");
            return;
        }
        if (!formData.primary_parent_id) {
            showAlert("A Primary Parent must be selected.", "error");
            return;
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

                <h3 className="form-section-title">Primary Parent/Guardian</h3>
                <div className="input-group">
                    <InputField label="Search/Change Parent (Name or Email)" id="parentSearchEdit" name="parentSearchEdit" value={parentSearchTerm} onChange={handleParentSearchChange} icon={Icons.Search} placeholder="Type to search..." />
                    {filteredParents.length > 0 && (<ul className="search-results-list">{filteredParents.map(p => (<li key={p.id} onClick={() => handleSelectParent(p)} className="search-result-item">{`${p.first_name} ${p.last_name}`} ({p.email})</li>))}</ul>)}
                    {formData.primary_parent_id && selectedParentName && (<InfoMessage type="success" message={`Selected: ${selectedParentName}`} icon={Icons.UserCheck} />)}
                </div>

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
