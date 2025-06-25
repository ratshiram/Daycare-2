
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { WaitlistEntry } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';

interface AdminWaitlistPageProps {
    waitlistEntries: WaitlistEntry[];
    loading: boolean;
    onOpenAddWaitlistModal: () => void;
    onEditWaitlistEntry: (entry: WaitlistEntry) => void;
    onDeleteWaitlistEntry: (entryId: string) => void;
}

export const AdminWaitlistPage: React.FC<AdminWaitlistPageProps> = ({
    waitlistEntries, loading, onOpenAddWaitlistModal, onEditWaitlistEntry, onDeleteWaitlistEntry
}) => {
    if (loading && (!Array.isArray(waitlistEntries) || waitlistEntries.length === 0)) return <Loading />;

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Waitlist Management</h2>
                <button onClick={onOpenAddWaitlistModal} className="btn btn-primary btn-small">
                    <Icons.PlusCircle size={18} /> Add to Waitlist
                </button>
            </div>
            {(!loading && (!Array.isArray(waitlistEntries) || waitlistEntries.length === 0)) ? (
                <InfoMessage message="The waitlist is currently empty." icon={Icons.ListOrdered} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Child Name</th>
                                <th className="th-cell th-sm-hidden">Parent Name</th>
                                <th className="th-cell th-md-hidden">Requested Start Date</th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(waitlistEntries) && waitlistEntries.map(entry => (
                                <tr key={entry.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{entry.child_name}</td>
                                    <td className="td-cell th-sm-hidden">{entry.parent_name}</td>
                                    <td className="td-cell th-md-hidden">{entry.requested_start_date ? formatDateForInput(entry.requested_start_date) : 'N/A'}</td>
                                    <td className="td-cell">
                                        <span className={`status-badge status-badge-${entry.status?.toLowerCase() || 'pending'}`}>
                                            {entry.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onEditWaitlistEntry(entry)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => onDeleteWaitlistEntry(entry.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
