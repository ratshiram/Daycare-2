
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child, Parent, Room } from '@/types';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AddChildModalProps {
    onAddChild: (childData: Omit<Child, 'id' | 'created_at' | 'child_parents'>, parentsToLink: {parent_id: string, is_primary: boolean}[]) => void;
    onClose: () => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    parentsList: Parent[];
    rooms: Room[];
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ onAddChild, onClose, showAlert, parentsList, rooms }) => {
    const [formData, setFormData] = useState<Omit<Child, 'id' | 'created_at' | 'child_parents'>>({
        name: '', age: null, current_room_id: '', emergency_contact: '',
        allergies: '', notes: '', medical_info: {}, authorized_pickups: [], billing: {}
    });
    
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [selectedParents, setSelectedParents] = useState<Parent[]>([]);
    const [primaryParentId, setPrimaryParentId] = useState<string | null>(null);

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
                !selectedParents.some(sp => sp.id === p.id) &&
                (`${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(term.toLowerCase()) ||
                (p.email || '').toLowerCase().includes(term.toLowerCase()))
            ).slice(0, 5));
        } else {
            setFilteredParents([]);
        }
    };

    const handleSelectParent = (parent: Parent) => {
        const newSelected = [...selectedParents, parent];
        setSelectedParents(newSelected);
        if (newSelected.length === 1) {
            setPrimaryParentId(parent.id);
        }
        setParentSearchTerm('');
        setFilteredParents([]);
    };
    
    const removeParent = (parentId: string) => {
        setSelectedParents(selectedParents.filter(p => p.id !== parentId));
        if (primaryParentId === parentId) {
            const nextPrimary = selectedParents.find(p => p.id !== parentId);
            setPrimaryParentId(nextPrimary ? nextPrimary.id : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.age === null) {
            showAlert("Child's Name and Age are required.", "error"); return;
        }
        if (selectedParents.length === 0) {
            showAlert("At least one parent must be linked.", "error"); return;
        }
        if (!primaryParentId) {
            showAlert("One parent must be set as the primary contact.", "error"); return;
        }
        
        const parentsToLink = selectedParents.map(p => ({
            parent_id: p.id,
            is_primary: p.id === primaryParentId
        }));
        
        onAddChild(formData, parentsToLink);
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

                <h3 className="form-section-title">Parents/Guardians</h3>
                <div className="input-group">
                    <InputField label="Search & Add Parent (Name or Email)" id="parentSearch" name="parentSearch" value={parentSearchTerm} onChange={handleParentSearchChange} icon={Icons.Search} placeholder="Type to search..." />
                    {filteredParents.length > 0 && (
                        <ul className="search-results-list">{filteredParents.map(parent => (
                            <li key={parent.id} onClick={() => handleSelectParent(parent)} className="search-result-item">{`${parent.first_name} ${parent.last_name}`} ({parent.email})</li>
                        ))}</ul>
                    )}
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="input-label">Linked Parents</label>
                    {selectedParents.length > 0 ? (
                        <div className="space-y-2 p-2 border rounded-md">
                            {selectedParents.map(parent => (
                                <div key={parent.id} className="flex items-center gap-3 p-2 bg-secondary rounded">
                                    <input type="radio" id={`primary_${parent.id}`} name="primary_parent" value={parent.id} checked={primaryParentId === parent.id} onChange={() => setPrimaryParentId(parent.id)} className="h-4 w-4" />
                                    <label htmlFor={`primary_${parent.id}`} className="flex-1 font-medium">{`${parent.first_name} ${parent.last_name}`}</label>
                                    <Badge variant={primaryParentId === parent.id ? "default" : "secondary"}>{primaryParentId === parent.id ? 'Primary' : 'Set as Primary'}</Badge>
                                    <button type="button" onClick={() => removeParent(parent.id)} className="p-1 text-muted-foreground hover:text-destructive"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <InfoMessage type="info" message="No parents linked. Use the search box above to find and add parents." />
                    )}
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
