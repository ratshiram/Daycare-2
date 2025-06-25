
import React, { useState, useEffect } from 'react';
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

interface EditChildModalProps {
    child: Child | null;
    onClose: () => void;
    onUpdateChild: (updatedChildData: Child, parentsToLink: {parent_id: string, is_primary: boolean}[]) => void;
    parentsList: Parent[];
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
    rooms: Room[];
}

export const EditChildModal: React.FC<EditChildModalProps> = ({ child, onClose, onUpdateChild, parentsList, showAlert, rooms }) => {
    const [formData, setFormData] = useState<Child>({ ...child! });
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [selectedParents, setSelectedParents] = useState<Parent[]>([]);
    const [primaryParentId, setPrimaryParentId] = useState<string | null>(null);

    useEffect(() => {
        if (child) {
            setFormData({
                ...child,
                age: (child.age === null || child.age === undefined) ? null : child.age,
                medical_info: child.medical_info || {},
                billing: child.billing || {},
            });
            const initialParents = child.child_parents?.map(cp => cp.parents) || [];
            setSelectedParents(initialParents);
            const primary = child.child_parents?.find(cp => cp.is_primary);
            setPrimaryParentId(primary?.parents.id || null);
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

    const handleParentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setParentSearchTerm(term);
        if (term.length > 1 && Array.isArray(parentsList)) {
            setFilteredParents(parentsList.filter(p =>
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
            showAlert("Name and Age are required.", "error"); return;
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
        onUpdateChild({ ...formData, id: child!.id }, parentsToLink);
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

                <h3 className="form-section-title">Parents/Guardians</h3>
                <div className="input-group">
                    <InputField label="Search & Add Parent" id="parentSearchEdit" name="parentSearchEdit" value={parentSearchTerm} onChange={handleParentSearchChange} icon={Icons.Search} placeholder="Type to search..." />
                    {filteredParents.length > 0 && (<ul className="search-results-list">{filteredParents.map(p => (<li key={p.id} onClick={() => handleSelectParent(p)} className="search-result-item">{`${p.first_name} ${p.last_name}`} ({p.email})</li>))}</ul>)}
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="input-label">Linked Parents</label>
                    {selectedParents.length > 0 ? (
                        <div className="space-y-2 p-2 border rounded-md">
                            {selectedParents.map(parent => (
                                <div key={parent.id} className="flex items-center gap-3 p-2 bg-secondary rounded">
                                    <input type="radio" id={`primary_edit_${parent.id}`} name="primary_parent" value={parent.id} checked={primaryParentId === parent.id} onChange={() => setPrimaryParentId(parent.id)} className="h-4 w-4" />
                                    <label htmlFor={`primary_edit_${parent.id}`} className="flex-1 font-medium">{`${parent.first_name} ${parent.last_name}`}</label>
                                    <Badge variant={primaryParentId === parent.id ? "default" : "secondary"}>{primaryParentId === parent.id ? 'Primary' : 'Set as Primary'}</Badge>
                                    <button type="button" onClick={() => removeParent(parent.id)} className="p-1 text-muted-foreground hover:text-destructive"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <InfoMessage type="info" message="No parents linked. Use the search box above to find and add parents." />
                    )}
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
