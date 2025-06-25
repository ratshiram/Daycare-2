
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { TextAreaField } from '../ui/TextAreaField';
import { SelectField } from '../ui/SelectField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Child, Staff, DailyReport } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import { uploadReportPhoto, uploadReportVideo } from '@/lib/storage';

interface CreateOrEditDailyReportModalProps {
    children: Child[];
    staff: Staff[];
    onAddDailyReport: (reportData: Omit<DailyReport, 'id' | 'created_at'>) => void;
    onUpdateDailyReport: (reportData: DailyReport) => void;
    onCancel: () => void;
    currentUser: any;
    initialData: DailyReport | null;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const CreateOrEditDailyReportModal: React.FC<CreateOrEditDailyReportModalProps> = ({
    children, onAddDailyReport, onUpdateDailyReport, onCancel, currentUser, initialData, showAlert
}) => {
    const isEditing = !!initialData;

    const [formData, setFormData] = useState<Omit<DailyReport, 'id' | 'created_at'>>({
        child_id: '', report_date: formatDateForInput(new Date()), mood: 'Happy', staff_id: '',
        meals: { breakfast: '', lunch: '', snack_am: '', snack_pm: '' },
        naps: [{ start: '', end: '' }], activities: '', toileting_diapers: '',
        supplies_needed: '', notes_for_parents: '', photo_url_1: null, photo_url_2: null, video_url_1: null, video_url_2: null
    });

    const [photo1File, setPhoto1File] = useState<File | null>(null);
    const [photo2File, setPhoto2File] = useState<File | null>(null);
    const [video1File, setVideo1File] = useState<File | null>(null);
    const [video2File, setVideo2File] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                ...initialData,
                report_date: formatDateForInput(initialData.report_date),
                naps: initialData.naps && initialData.naps.length > 0 ? initialData.naps : [{ start: '', end: '' }],
            });
        } else {
            setFormData({
                child_id: '', report_date: formatDateForInput(new Date()), mood: 'Happy', staff_id: '',
                meals: { breakfast: '', lunch: '', snack_am: '', snack_pm: '' },
                naps: [{ start: '', end: '' }], activities: '', toileting_diapers: '',
                supplies_needed: '', notes_for_parents: '', photo_url_1: null, photo_url_2: null, video_url_1: null, video_url_2: null
            });
        }
    }, [isEditing, initialData]);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo1' | 'photo2' | 'video1' | 'video2') => {
        const file = e.target.files?.[0];
        if (file) {
            if (fileType === 'photo1') setPhoto1File(file);
            else if (fileType === 'photo2') setPhoto2File(file);
            else if (fileType === 'video1') setVideo1File(file);
            else if (fileType === 'video2') setVideo2File(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        if (!formData.child_id || !formData.report_date) {
            showAlert("Child and Report Date are required.", "error"); setIsUploading(false); return;
        }

        try {
            let photoUrl1 = formData.photo_url_1;
            if (photo1File) photoUrl1 = await uploadReportPhoto(photo1File, formData.child_id, 1);
            
            let photoUrl2 = formData.photo_url_2;
            if (photo2File) photoUrl2 = await uploadReportPhoto(photo2File, formData.child_id, 2);
            
            let videoUrl1 = formData.video_url_1;
            if (video1File) videoUrl1 = await uploadReportVideo(video1File, formData.child_id, 1);

            let videoUrl2 = formData.video_url_2;
            if (video2File) videoUrl2 = await uploadReportVideo(video2File, formData.child_id, 2);

            const reportData = { ...formData, photo_url_1: photoUrl1, photo_url_2: photoUrl2, video_url_1: videoUrl1, video_url_2: videoUrl2 };
            
            if (isEditing && initialData) {
                onUpdateDailyReport({ ...reportData, id: initialData.id, created_at: initialData.created_at });
            } else {
                onAddDailyReport(reportData);
            }
        } catch (uploadError: any) {
            showAlert(`Media upload failed: ${uploadError.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal onClose={onCancel} title={isEditing ? 'Edit Daily Report' : 'Create Daily Report'} size="large">
            <form onSubmit={handleSubmit} className="form-layout">
                <SelectField label="Child" id="child_id" name="child_id" value={formData.child_id} onChange={handleChange} required icon={Icons.Smile} disabled={isEditing}>
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
                        <InputField label={`Nap ${index + 1} Start`} type="time" value={nap.start || ''} onChange={(e) => handleNapChange(e, index, 'start')} />
                        <InputField label={`Nap ${index + 1} End`} type="time" value={nap.end || ''} onChange={(e) => handleNapChange(e, index, 'end')} />
                    </div>
                ))}
                <button type="button" onClick={addNapField} className="btn btn-secondary btn-small col-span-2 justify-self-start">Add Another Nap</button>

                <TextAreaField label="Activities" id="activities" name="activities" value={formData.activities || ''} onChange={handleChange} />
                <TextAreaField label="Toileting/Diapers" id="toileting_diapers" name="toileting_diapers" value={formData.toileting_diapers || ''} onChange={handleChange} />
                <TextAreaField label="Supplies Needed" id="supplies_needed" name="supplies_needed" value={formData.supplies_needed || ''} onChange={handleChange} />
                <TextAreaField label="Notes for Parents" id="notes_for_parents" name="notes_for_parents" value={formData.notes_for_parents || ''} onChange={handleChange} />

                <h3 className="form-section-title">Media (Optional)</h3>
                <InputField label="Photo 1" type="file" onChange={(e) => handleFileChange(e, 'photo1')} icon={Icons.UploadCloud} accept="image/*" />
                {formData.photo_url_1 && !photo1File && <p className="text-sm text-muted-foreground">Current: {formData.photo_url_1.split('/').pop()}</p>}
                <InputField label="Photo 2" type="file" onChange={(e) => handleFileChange(e, 'photo2')} icon={Icons.UploadCloud} accept="image/*" />
                {formData.photo_url_2 && !photo2File && <p className="text-sm text-muted-foreground">Current: {formData.photo_url_2.split('/').pop()}</p>}
                <InputField label="Video 1" type="file" onChange={(e) => handleFileChange(e, 'video1')} icon={Icons.UploadCloud} accept="video/*" />
                {formData.video_url_1 && !video1File && <p className="text-sm text-muted-foreground">Current: {formData.video_url_1.split('/').pop()}</p>}
                <InputField label="Video 2" type="file" onChange={(e) => handleFileChange(e, 'video2')} icon={Icons.UploadCloud} accept="video/*" />
                {formData.video_url_2 && !video2File && <p className="text-sm text-muted-foreground">Current: {formData.video_url_2.split('/').pop()}</p>}
                
                <FormActions onCancel={onCancel} submitText={isEditing ? 'Save Changes' : 'Add Report'} submitIcon={isEditing ? Icons.CheckCircle : Icons.PlusCircle} loading={isUploading} />
            </form>
        </Modal>
    );
};
