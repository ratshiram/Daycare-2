
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { DailyReport, Child } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';
import { useAppState } from '@/app/app';

export const AdminGalleryPage: React.FC = () => {
    const { dailyReports, loadingData, children, currentUser } = useAppState();
    
    const childNameMap = Array.isArray(children) ? children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
    }, {} as Record<string, string>) : {};
    
    const parentChildrenIds = (currentUser?.role === 'parent' && currentUser.profileId && Array.isArray(children))
        ? children.filter(c => c.primary_parent_id === currentUser.profileId || c.secondary_parent_id === currentUser.profileId).map(c => c.id)
        : null;

    const photos: { url: string; childName: string; reportDate: string; childId: string }[] = [];
    if (Array.isArray(dailyReports)) {
        dailyReports.forEach(report => {
            if (parentChildrenIds && !parentChildrenIds.includes(report.child_id)) {
                return;
            }

            const childName = childNameMap[report.child_id] || 'Unknown Child';
            if (report.photo_url_1) {
                photos.push({
                    url: report.photo_url_1,
                    childName: childName,
                    reportDate: formatDateForInput(report.report_date),
                    childId: report.child_id,
                });
            }
            if (report.photo_url_2) {
                photos.push({
                    url: report.photo_url_2,
                    childName: childName,
                    reportDate: formatDateForInput(report.report_date),
                    childId: report.child_id,
                });
            }
        });
        photos.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }
    
    if (loadingData.dailyReports && photos.length === 0) return <Loading />;

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Photo Gallery</h2>
            </div>
            {(!loadingData.dailyReports && photos.length === 0) ? (
                <InfoMessage message="No photos have been uploaded yet." icon={Icons.Camera} />
            ) : (
                <div className="gallery-grid">
                    {photos.map((photo, index) => (
                        <div key={index} className="gallery-item-card">
                            <img src={photo.url} alt={`Photo of ${photo.childName}`} className="gallery-item-image" />
                            <div className="gallery-item-info">
                                <p className="gallery-item-caption">{photo.childName}</p>
                                <p className="gallery-item-meta">
                                    <Icons.Clock size={12} className="inline mr-1" />
                                    {photo.reportDate}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

    