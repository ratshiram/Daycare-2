
import React, { useState, useEffect } from 'react';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { CheckboxField } from '../ui/CheckboxField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Announcement } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';

interface CreateAnnouncementPageProps {
    onAddAnnouncement: (announcementData: Omit<Announcement, 'id' | 'created_at'>) => void;
    onUpdateAnnouncement: (announcementData: Announcement) => void;
    onCancel: () => void;
    currentUser: any;
    initialData: Announcement | null;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const CreateAnnouncementPage: React.FC<CreateAnnouncementPageProps> = ({
    onAddAnnouncement, onUpdateAnnouncement, onCancel, currentUser, initialData, showAlert
}) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'created_at' | 'author_staff_id'>>({
        title: '',
        content: '',
        publish_date: formatDateForInput(new Date()),
        expiry_date: '',
        category: 'General',
        is_published: true,
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                title: initialData.title,
                content: initialData.content,
                publish_date: formatDateForInput(initialData.publish_date),
                expiry_date: initialData.expiry_date ? formatDateForInput(initialData.expiry_date) : '',
                category: initialData.category || 'General',
                is_published: initialData.is_published || false,
            });
        }
    }, [isEditing, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            showAlert("Title and Content are required.", "error");
            return;
        }

        if (isEditing && initialData) {
            onUpdateAnnouncement({ ...formData, id: initialData.id, created_at: initialData.created_at, author_staff_id: initialData.author_staff_id });
        } else {
            onAddAnnouncement(formData);
        }
    };
    
    return (
        <div className="page-card form-page-card">
            <button onClick={onCancel} className="btn btn-secondary btn-small btn-back"><Icons.ArrowLeft size={18} /> Back to Announcements</button>
            <h2 className="page-card-title form-page-title mt-4">{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>
            <form onSubmit={handleSubmit} className="form-layout">
                <div className="md:col-span-2">
                    <InputField label="Title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                    <TextAreaField label="Content" name="content" value={formData.content} onChange={handleChange} required rows={6} />
                </div>
                
                <InputField label="Publish Date" name="publish_date" type="date" value={formData.publish_date} onChange={handleChange} required />
                <InputField label="Expiry Date (Optional)" name="expiry_date" type="date" value={formData.expiry_date || ''} onChange={handleChange} />

                <InputField label="Category" name="category" value={formData.category || 'General'} onChange={handleChange} placeholder="e.g., General, Holiday, Event" />
                
                <div className="md:col-span-2">
                    <CheckboxField label="Publish Immediately" name="is_published" checked={formData.is_published || false} onChange={handleChange} />
                </div>

                <FormActions 
                    onCancel={onCancel} 
                    submitText={isEditing ? 'Save Changes' : 'Create Announcement'} 
                    submitIcon={isEditing ? Icons.CheckCircle : Icons.PlusCircle} 
                />
            </form>
        </div>
    );
};
