
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Announcement, Staff } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';

interface AdminAnnouncementsPageProps {
    announcements: Announcement[];
    loading: boolean;
    staff: Staff[];
    onNavigateToCreateAnnouncement: (() => void) | null;
    onEditAnnouncement: ((announcement: Announcement) => void) | null;
    onDeleteAnnouncement: ((announcementId: string) => void) | null;
}

export const AdminAnnouncementsPage: React.FC<AdminAnnouncementsPageProps> = ({
    announcements, loading, staff, onNavigateToCreateAnnouncement, onEditAnnouncement, onDeleteAnnouncement
}) => {
    if (loading && (!Array.isArray(announcements) || announcements.length === 0)) return <Loading />;

    const staffNameMap = Array.isArray(staff) ? staff.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>) : {};

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Announcements</h2>
                {onNavigateToCreateAnnouncement && (
                    <button onClick={onNavigateToCreateAnnouncement} className="btn btn-primary btn-small">
                        <Icons.PlusCircle size={18} /> <span className="hidden sm:inline">New Announcement</span>
                    </button>
                )}
            </div>
            {(!loading && (!Array.isArray(announcements) || announcements.length === 0)) ? (
                <InfoMessage message="No announcements have been posted." icon={Icons.Megaphone} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Title</th>
                                <th className="th-cell th-sm-hidden">Publish Date</th>
                                <th className="th-cell th-md-hidden">Author</th>
                                <th className="th-cell">Status</th>
                                {onEditAnnouncement && onDeleteAnnouncement && <th className="th-cell th-actions">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(announcements) && announcements.map(announcement => (
                                <tr key={announcement.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{announcement.title}</td>
                                    <td className="td-cell th-sm-hidden">{formatDateForInput(announcement.publish_date)}</td>
                                    <td className="td-cell th-md-hidden">{staffNameMap[announcement.author_staff_id] || 'N/A'}</td>
                                    <td className="td-cell">
                                        <span className={`status-badge ${announcement.is_published ? 'status-badge-published' : 'status-badge-pending'}`}>
                                            {announcement.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    {onEditAnnouncement && onDeleteAnnouncement && (
                                        <td className="td-cell td-actions">
                                            <button onClick={() => onEditAnnouncement(announcement)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                            <button onClick={() => onDeleteAnnouncement(announcement.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
