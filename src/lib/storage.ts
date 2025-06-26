import { supabase } from './supabaseClient';

export const uploadFileToSupabase = async (file: File, bucketName: string, pathPrefix = '') => {
    if (!file) {
        console.error("uploadFileToSupabase: No file provided.");
        return null;
    }
    const safeBaseName = typeof file.name === 'string' ? file.name.replace(/\s+/g, '_') : 'uploaded_file';
    const resolvedPathPrefix = pathPrefix && !pathPrefix.endsWith('/') ? `${pathPrefix}/` : pathPrefix;
    const fileName = `${resolvedPathPrefix}${Date.now()}_${safeBaseName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('Could not get public URL for uploaded file.');
        }
        return { publicUrl: publicUrlData.publicUrl, filePath: fileName, fileSize: file.size, mimeType: file.type };

    } catch (error: any) {
        console.error('File upload process failed overall:', error.message);
        throw error;
    }
};

export const uploadReportPhoto = async (file: File, childId: string, photoNumber: number) => {
    if (!file) return null;
    const BUCKET_NAME = 'galleryfiles';
    const pathPrefix = `daily-reports/${childId}/report_photo_${photoNumber}`;

    try {
        const uploadResult = await uploadFileToSupabase(file, BUCKET_NAME, pathPrefix);
        return uploadResult?.publicUrl || null;
    } catch (error: any) {
        console.error('Report photo upload process failed:', error.message, error);
        throw error;
    }
};

export const uploadReportVideo = async (file: File, childId: string, videoNumber: number) => {
    if (!file) return null;
    const BUCKET_NAME = 'galleryfiles';
    const pathPrefix = `daily-reports/${childId}/report_video_${videoNumber}`;

    try {
        const uploadResult = await uploadFileToSupabase(file, BUCKET_NAME, pathPrefix);
        return uploadResult?.publicUrl || null;
    } catch (error: any) {
        console.error('Report video upload process failed:', error.message, error);
        throw error;
    }
};

export const uploadLessonPlanDocument = async (file: File) => {
    if (!file) return null;
    const BUCKET_NAME = 'galleryfiles'; // Using the same bucket for simplicity
    const pathPrefix = `lesson-plans`;

    try {
        const uploadResult = await uploadFileToSupabase(file, BUCKET_NAME, pathPrefix);
        return uploadResult?.publicUrl || null;
    } catch (error: any) {
        console.error('Lesson plan document upload failed:', error.message, error);
        throw error;
    }
};
