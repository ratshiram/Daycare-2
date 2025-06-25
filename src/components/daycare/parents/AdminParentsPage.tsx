
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Parent } from '@/types';
import Loading from '@/app/loading';

interface AdminParentsPageProps {
    parentsList: Parent[];
    loading: boolean;
    onOpenAddParentModal: () => void;
    onEditParent: (parent: Parent) => void;
    onDeleteParent: (parentId: string) => void;
}

export const AdminParentsPage: React.FC<AdminParentsPageProps> = ({ parentsList, loading, onOpenAddParentModal, onEditParent, onDeleteParent }) => {
    if (loading && (!Array.isArray(parentsList) || parentsList.length === 0)) return <Loading />;

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Manage Parents</h2>
                <button onClick={onOpenAddParentModal} className="btn btn-primary btn-small">
                    <Icons.UserPlus size={18} /> <span className="hidden sm:inline">Add New Parent</span>
                </button>
            </div>
            {(!loading && (!Array.isArray(parentsList) || parentsList.length === 0)) ? (
                <InfoMessage message="No parent records found." icon={Icons.UserCog} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Name</th>
                                <th className="th-cell th-sm-hidden">Email</th>
                                <th className="th-cell th-md-hidden">Phone</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(parentsList) && parentsList.map(parent => (
                                <tr key={parent.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{`${parent.first_name || ''} ${parent.last_name || ''}`.trim()}</td>
                                    <td className="td-cell th-sm-hidden">{parent.email}</td>
                                    <td className="td-cell td-md-hidden">{parent.phone_number || 'N/A'}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onEditParent(parent)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => onDeleteParent(parent.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
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
