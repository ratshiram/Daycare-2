import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Staff, DailyReport } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import { uploadReportPhoto } from '@/lib/storage';

interface CreateDailyReportPageProps {
    children: Child[];
    staff: Staff[];
    onAddDailyReport: (reportData: Omit<DailyReport, 'id' | 'created_at'>) => void;
    onCancel: () => void;
    currentUser: any;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const CreateDailyReportPage: React.FC<CreateDailyReportPageProps> = ({ children, staff, onAddDailyReport, onCancel, currentUser, showAlert }) => {
    const [formData, setFormData] = useState<Omit<DailyReport, 'id' | 'created_at' | 'staff_id'>>({
        child_id: '', report_date: formatDateForInput(new Date()), mood: 'Happy',
        meals: { breakfast: '', lunch: '', snack_am: '', snack_pm: '' },
        naps: [{ start: '', end: '' }],
        activities: '', toileting_diapers: '', supplies_needed: '', notes_for_parents: '',
        photo_url_1: null, photo_url_2: null,
    });
    const [photo1File, setPhoto1File] = useState<File | null>(null);
    const [photo2File, setPhoto2File] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMealChange = (e: React.ChangeEvent<HTMLInputElement>, mealName: string) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, meals: { ...prev.meals, [mealName]: value } }));
    };

    const handleNapChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'start' | 'end') => {
        const newNaps = [...(formData.naps || [])];
        newNaps[index][field] = e.target.value;
        setFormData(prev => ({ ...prev, naps: newNaps }));
    };

    const addNapField = () => setFormData(prev => ({ ...prev, naps: [...(prev.naps || []), { start: '', end: '' }] }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, photoNumber: 1 | 2) => {
        const file = e.target.files?.[0];
        if (file) {
            if (photoNumber === 1) setPhoto1File(file);
            if (photoNumber === 2) setPhoto2File(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        if (!formData.child_id || !formData.report_date) {
            showAlert("Child and Report Date are required.", "error"); setIsUploading(false); return;
        }
        if (!currentUser?.id) {
            showAlert("Current user not found.", "error"); setIsUploading(false); return;
        }

        let photoUrl1 = null;
        let photoUrl2 = null;
        try {
            if (photo1File) { photoUrl1 = await uploadReportPhoto(photo1File, formData.child_id, 1); if (!photoUrl1) throw new Error("Photo 1 upload failed."); }
            if (photo2File) { photoUrl2 = await uploadReportPhoto(photo2File, formData.child_id, 2); if (!photoUrl2) throw new Error("Photo 2 upload failed."); }
        } catch (uploadError: any) {
            showAlert(`Photo upload failed: ${uploadError.message}`, 'error'); setIsUploading(false); return;
        }

        const reportData: any = { ...formData, photo_url_1: photoUrl1, photo_url_2: photoUrl2 };
        await onAddDailyReport(reportData);
        setIsUploading(false);
    };

    return (
        <div className="page-card form-page-card">
            <button onClick={onCancel} className="btn btn-secondary btn-small btn-back"><Icons.ArrowLeft size={18} /> Back to Reports</button>
            <h2 className="page-card-title form-page-title mt-4">Create Daily Report</h2>
            <form onSubmit={handleSubmit} className="form-layout">
                <SelectField label="Child" id="child_id" name="child_id" value={formData.child_id} onChange={handleChange} required icon={Icons.Smile}>
                    <option value="">Select Child</option>
                    {Array.isArray(children) && children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
                </SelectField>
                <InputField label="Report Date" id="report_date" name="report_date" type="date" value={formData.report_date} onChange={handleChange} required />
                <SelectField label="Mood" id="mood" name="mood" value={formData.mood || ''} onChange={handleChange}>
                    <option value="Happy">Happy</option><option value="Playful">Playful</option><option value="Tired">Tired</option><option value="Quiet">Quiet</option><option value="Upset">Upset</option>
                </SelectField>

                <h3 className="form-section-title">Meals</h3>
                <InputField label="Breakfast Notes" name="breakfast" value={formData.meals?.breakfast} onChange={(e) => handleMealChange(e, 'breakfast')} placeholder="e.g., Ate all cereal" />
                <InputField label="Lunch Notes" name="lunch" value={formData.meals?.lunch} onChange={(e) => handleMealChange(e, 'lunch')} placeholder="e.g., Enjoyed pasta, some veggies" />

                <h3 className="form-section-title">Naps</h3>
                {formData.naps?.map((nap, index) => (
                    <div key={index} className="form-row grid grid-cols-2 gap-4 col-span-2">
                        <InputField label={`Nap ${index + 1} Start`} type="time" value={nap.start} onChange={(e) => handleNapChange(e, index, 'start')} />
                        <InputField label={`Nap ${index + 1} End`} type="time" value={nap.end} onChange={(e) => handleNapChange(e, index, 'end')} />
                    </div>
                ))}
                <button type="button" onClick={addNapField} className="btn btn-secondary btn-small col-span-2 justify-self-start">Add Another Nap</button>

                <TextAreaField label="Activities" id="activities" name="activities" value={formData.activities || ''} onChange={handleChange} />
                <TextAreaField label="Toileting/Diapers" id="toileting_diapers" name="toileting_diapers" value={formData.toileting_diapers || ''} onChange={handleChange} />
                <TextAreaField label="Supplies Needed" id="supplies_needed" name="supplies_needed" value={formData.supplies_needed || ''} onChange={handleChange} />
                <TextAreaField label="Notes for Parents" id="notes_for_parents" name="notes_for_parents" value={formData.notes_for_parents || ''} onChange={handleChange} />

                <h3 className="form-section-title">Photos (Optional)</h3>
                <InputField label="Photo 1" id="photo1File" name="photo1File" type="file" onChange={(e) => handleFileChange(e, 1)} icon={Icons.UploadCloud} accept="image/*" />
                {photo1File && <p className="file-name-display text-sm text-muted-foreground">{photo1File.name}</p>}
                <InputField label="Photo 2" id="photo2File" name="photo2File" type="file" onChange={(e) => handleFileChange(e, 2)} icon={Icons.UploadCloud} accept="image/*" />
                {photo2File && <p className="file-name-display text-sm text-muted-foreground">{photo2File.name}</p>}
                
                <FormActions onCancel={onCancel} submitText="Add Report" submitIcon={Icons.PlusCircle} loading={isUploading} />
            </form>
        </div>
    );
};
