
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
import { Button } from '@/components/ui/button';

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
    
    const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
    const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);

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

    useEffect(() => {
        if (photo1File) {
            const objectUrl = URL.createObjectURL(photo1File);
            setPhoto1Preview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setPhoto1Preview(null);
    }, [photo1File]);

    useEffect(() => {
        if (photo2File) {
            const objectUrl = URL.createObjectURL(photo2File);
            setPhoto2Preview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setPhoto2Preview(null);
    }, [photo2File]);


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
            if (fileType.includes('video')) {
                const maxFileSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxFileSize) {
                    showAlert('Video file size cannot exceed 10MB.', 'error');
                    e.target.value = ''; // Clear the file input
                    if (fileType === 'video1') setVideo1File(null);
                    if (fileType === 'video2') setVideo2File(null);
                    return;
                }
            }

            if (fileType === 'photo1') setPhoto1File(file);
            else if (fileType === 'photo2') setPhoto2File(file);
            else if (fileType === 'video1') setVideo1File(file);
            else if (fileType === 'video2') setVideo2File(file);
        }
    };
    
    const handleRemoveMedia = (type: 'photo1' | 'photo2' | 'video1' | 'video2') => {
        if (type === 'photo1') {
            setPhoto1File(null);
            setFormData(prev => ({ ...prev, photo_url_1: null }));
        } else if (type === 'photo2') {
            setPhoto2File(null);
            setFormData(prev => ({ ...prev, photo_url_2: null }));
        } else if (type === 'video1') {
            setVideo1File(null);
            setFormData(prev => ({ ...prev, video_url_1: null }));
        } else if (type === 'video2') {
            setVideo2File(null);
            setFormData(prev => ({ ...prev, video_url_2: null }));
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
    
    // New helper component for media input
    const MediaInput = ({
        label, type, file, preview, existingUrl, onFileChange, onRemove
    }: {
        label: string, type: 'photo1' | 'photo2' | 'video1' | 'video2', file: File | null,
        preview: string | null, existingUrl: string | null | undefined,
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        onRemove: () => void
    }) => (
        <div className="space-y-2">
            <InputField label={label} type="file" onChange={onFileChange} icon={Icons.UploadCloud} accept={type.includes('photo') ? "image/*" : "video/*"} />
            {(preview || existingUrl) && (
                <div className="mt-2 p-2 border rounded-md relative">
                    {type.includes('photo') ? (
                        <img src={preview || existingUrl!} alt={`${label} preview`} className="w-full h-32 object-cover rounded-md" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Icons.FileText className="h-10 w-10 text-muted-foreground"/>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                                {file?.name || existingUrl?.split('%2F').pop()?.split('?')[0] || 'Video File'}
                            </p>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/75" onClick={onRemove}>
                        <Icons.X className="h-4 w-4 text-white" />
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Modal onClose={onCancel} title={isEditing ? 'Edit Daily Report' : 'Create Daily Report'} size="large">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Child" id="child_id" name="child_id" value={formData.child_id} onChange={handleChange} required icon={Icons.Smile} disabled={isEditing}>
                        <option value="">Select Child</option>
                        {Array.isArray(children) && children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
                    </SelectField>
                    <InputField label="Report Date" id="report_date" name="report_date" type="date" value={formData.report_date} onChange={handleChange} required />
                </div>
                
                <SelectField label="Mood" id="mood" name="mood" value={formData.mood || ''} onChange={handleChange}>
                    <option value="Happy">Happy</option><option value="Playful">Playful</option><option value="Tired">Tired</option><option value="Quiet">Quiet</option><option value="Upset">Upset</option>
                </SelectField>

                <div>
                    <h3 className="form-section-title !mt-0 !mb-4 !border-t-0 pl-0">Meals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Breakfast Notes" name="breakfast" value={formData.meals?.breakfast || ''} onChange={(e) => handleMealChange(e, 'breakfast')} placeholder="e.g., Ate all cereal" />
                        <InputField label="Lunch Notes" name="lunch" value={formData.meals?.lunch || ''} onChange={(e) => handleMealChange(e, 'lunch')} placeholder="e.g., Enjoyed pasta, some veggies" />
                    </div>
                </div>

                <div>
                    <h3 className="form-section-title !mt-0 !mb-4 !border-t-0 pl-0">Naps</h3>
                    <div className="space-y-4">
                    {formData.naps?.map((nap, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={`Nap ${index + 1} Start`} type="time" value={nap.start || ''} onChange={(e) => handleNapChange(e, index, 'start')} />
                            <InputField label={`Nap ${index + 1} End`} type="time" value={nap.end || ''} onChange={(e) => handleNapChange(e, index, 'end')} />
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addNapField} className="btn btn-secondary btn-small mt-4">Add Another Nap</button>
                </div>
                
                <div className="space-y-4">
                    <TextAreaField label="Activities" id="activities" name="activities" value={formData.activities || ''} onChange={handleChange} />
                    <TextAreaField label="Toileting/Diapers" id="toileting_diapers" name="toileting_diapers" value={formData.toileting_diapers || ''} onChange={handleChange} />
                    <TextAreaField label="Supplies Needed" id="supplies_needed" name="supplies_needed" value={formData.supplies_needed || ''} onChange={handleChange} />
                    <TextAreaField label="Notes for Parents" id="notes_for_parents" name="notes_for_parents" value={formData.notes_for_parents || ''} onChange={handleChange} />
                </div>

                <div>
                    <h3 className="form-section-title !mt-0 !mb-4 !border-t-0 pl-0">Media (Optional)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <MediaInput label="Photo 1" type="photo1" file={photo1File} preview={photo1Preview} existingUrl={formData.photo_url_1} onFileChange={(e) => handleFileChange(e, 'photo1')} onRemove={() => handleRemoveMedia('photo1')} />
                         <MediaInput label="Photo 2" type="photo2" file={photo2File} preview={photo2Preview} existingUrl={formData.photo_url_2} onFileChange={(e) => handleFileChange(e, 'photo2')} onRemove={() => handleRemoveMedia('photo2')} />
                         <MediaInput label="Video 1" type="video1" file={video1File} preview={null} existingUrl={formData.video_url_1} onFileChange={(e) => handleFileChange(e, 'video1')} onRemove={() => handleRemoveMedia('video1')} />
                         <MediaInput label="Video 2" type="video2" file={video2File} preview={null} existingUrl={formData.video_url_2} onFileChange={(e) => handleFileChange(e, 'video2')} onRemove={() => handleRemoveMedia('video2')} />
                    </div>
                </div>
                
                <FormActions onCancel={onCancel} submitText={isEditing ? 'Save Changes' : 'Add Report'} submitIcon={isEditing ? Icons.CheckCircle : Icons.PlusCircle} loading={isUploading} />
            </form>
        </Modal>
    );
};
