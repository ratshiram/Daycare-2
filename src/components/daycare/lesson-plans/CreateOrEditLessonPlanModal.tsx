
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { LessonPlan } from '@/types';
import { useAppState } from '@/app/app';
import { formatDateForInput } from '@/lib/customUtils';
import { uploadLessonPlanDocument } from '@/lib/storage';

interface CreateOrEditLessonPlanModalProps {
    onAddLessonPlan: (planData: Omit<LessonPlan, 'id' | 'created_at'>) => void;
    onUpdateLessonPlan: (planData: LessonPlan) => void;
    onCancel: () => void;
    initialData: LessonPlan | null;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const CreateOrEditLessonPlanModal: React.FC<CreateOrEditLessonPlanModalProps> = ({
    onAddLessonPlan, onUpdateLessonPlan, onCancel, initialData, showAlert
}) => {
    const { rooms, currentUser } = useAppState();
    const isEditing = !!initialData;

    const [formData, setFormData] = useState<Omit<LessonPlan, 'id' | 'created_at' | 'staff_id'>>({
        title: '',
        description: '',
        objectives: '',
        materials: '',
        activities: '',
        assessment: '',
        plan_date: formatDateForInput(new Date()),
        room_id: '',
        document_url: null,
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                ...initialData,
                plan_date: formatDateForInput(initialData.plan_date),
            });
        }
    }, [isEditing, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocumentFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.plan_date) {
            showAlert("Title and Plan Date are required.", "error");
            return;
        }

        setIsUploading(true);
        try {
            let documentUrl = formData.document_url;
            if (documentFile) {
                documentUrl = await uploadLessonPlanDocument(documentFile);
            }

            const dataToSubmit = { ...formData, document_url: documentUrl };
            if (dataToSubmit.room_id === '') {
                (dataToSubmit as any).room_id = null;
            }
            
            if (isEditing && initialData) {
                onUpdateLessonPlan({ ...dataToSubmit, id: initialData.id, created_at: initialData.created_at, staff_id: initialData.staff_id });
            } else if (currentUser?.staff_id) {
                onAddLessonPlan({ ...dataToSubmit, staff_id: currentUser.staff_id });
            } else {
                showAlert("Could not identify staff member creating this plan.", "error");
            }
        } catch (uploadError: any) {
            showAlert(`Document upload failed: ${uploadError.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal onClose={onCancel} title={isEditing ? 'Edit Lesson Plan' : 'Create Lesson Plan'} size="large">
            <form onSubmit={handleSubmit} className="form-layout">
                <h3 className="form-section-title">Core Information</h3>
                <InputField label="Title" name="title" value={formData.title} onChange={handleChange} required />
                <InputField label="Plan Date" name="plan_date" type="date" value={formData.plan_date} onChange={handleChange} required />
                <SelectField label="Assign to Room (Optional)" name="room_id" value={formData.room_id || ''} onChange={handleChange} icon={Icons.Building}>
                    <option value="">All Rooms</option>
                    {Array.isArray(rooms) && rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                </SelectField>
                <div className="md:col-span-2">
                    <InputField label="Attach Document (Optional)" type="file" onChange={handleFileChange} icon={Icons.UploadCloud} />
                    {formData.document_url && !documentFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Current file: <a href={formData.document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{formData.document_url.split('/').pop()}</a>
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <TextAreaField label="Description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
                </div>

                <h3 className="form-section-title">Plan Details</h3>
                 <div className="md:col-span-2">
                    <TextAreaField label="Objectives / Learning Goals" name="objectives" value={formData.objectives || ''} onChange={handleChange} rows={3} />
                </div>
                 <div className="md:col-span-2">
                    <TextAreaField label="Materials Needed" name="materials" value={formData.materials || ''} onChange={handleChange} rows={3} />
                </div>
                 <div className="md:col-span-2">
                    <TextAreaField label="Activities" name="activities" value={formData.activities || ''} onChange={handleChange} rows={5} />
                </div>
                 <div className="md:col-span-2">
                    <TextAreaField label="Assessment / Observation Notes" name="assessment" value={formData.assessment || ''} onChange={handleChange} rows={3} />
                </div>

                <FormActions 
                    onCancel={onCancel} 
                    submitText={isEditing ? 'Save Changes' : 'Create Plan'} 
                    submitIcon={isEditing ? Icons.CheckCircle : Icons.PlusCircle}
                    loading={isUploading}
                />
            </form>
        </Modal>
    );
};
