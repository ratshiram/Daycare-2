
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Child } from '@/types';
import Loading from '@/app/loading';
import { useAppState } from '@/app/app';

interface ChildrenPageProps {
    childrenList: Child[];
    loading: boolean;
    onOpenAddChildModal: () => void;
    onEditChild: (child: Child) => void;
    onDeleteChild: (childId: string) => void;
    onToggleCheckIn: (childId: string) => void;
    onNavigateToChildMedications: (child: Child) => void;
}

export const ChildrenPage: React.FC<ChildrenPageProps> = ({ childrenList, loading, onOpenAddChildModal, onEditChild, onDeleteChild, onToggleCheckIn, onNavigateToChildMedications }) => {
    const { currentUser } = useAppState();
    if (loading && (!Array.isArray(childrenList) || childrenList.length === 0)) return <Loading />;
    
    const canPerformActions = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Manage Children</h2>
                {canPerformActions && (
                    <button onClick={onOpenAddChildModal} className="btn btn-primary btn-small">
                        <Icons.UserPlus size={18} /> Add New Child
                    </button>
                )}
            </div>
            {(!loading && (!Array.isArray(childrenList) || childrenList.length === 0)) ? (
                <InfoMessage message="No children records found. Add a new child to get started." icon={Icons.Smile} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Name</th>
                                <th className="th-cell th-sm-hidden">Age</th>
                                <th className="th-cell th-md-hidden">Primary Parent</th>
                                <th className="th-cell th-md-hidden">Status</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(childrenList) && childrenList.map(child => {
                                const isCheckedIn = child.check_in_time && !child.check_out_time;
                                const primaryParentInfo = child.child_parents?.find(cp => cp.is_primary)?.parents;
                                const parentDisplay = primaryParentInfo ? `${primaryParentInfo.first_name || ''} ${primaryParentInfo.last_name || ''}`.trim() : 'N/A';
                                
                                return (
                                    <tr key={child.id} className="table-row">
                                        <td className="td-cell td-name font-semibold">{child.name}</td>
                                        <td className="td-cell td-sm-hidden">{child.age}</td>
                                        <td className="td-cell td-md-hidden">{parentDisplay}</td>
                                        <td className="td-cell td-md-hidden">
                                            <span className={`status-badge ${isCheckedIn ? 'status-badge-green' : 'status-badge-red'}`}>{isCheckedIn ? 'Checked In' : 'Checked Out'}</span>
                                        </td>
                                        <td className="td-cell td-actions">
                                            {canPerformActions && (
                                                <button onClick={() => onToggleCheckIn(child.id)} className={`btn-icon table-action-button ${isCheckedIn ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`} title={isCheckedIn ? 'Check Out' : 'Check In'}>
                                                    {isCheckedIn ? <Icons.LogOut size={16} /> : <Icons.LogIn size={16} />}
                                                </button>
                                            )}
                                            {canPerformActions && (
                                                <button onClick={() => onEditChild(child)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                            )}
                                            <button onClick={() => onNavigateToChildMedications(child)} className="btn-icon table-action-button text-purple-600 hover:text-purple-800" title="Manage Medications"><Icons.Pill size={16} /></button>
                                            {currentUser?.role === 'admin' && (
                                                <button onClick={() => onDeleteChild(child.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
