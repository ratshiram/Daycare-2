
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { LessonPlan } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import { useAppState } from '@/app/app';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';

interface LessonPlansPageProps {
    onOpenCreateOrEditModal: (plan: LessonPlan | null) => void;
    onDeleteLessonPlan: (planId: string) => void;
}

export const LessonPlansPage: React.FC<LessonPlansPageProps> = ({ onOpenCreateOrEditModal, onDeleteLessonPlan }) => {
    const { currentUser, lessonPlans, rooms, staff, loadingData } = useAppState();
    
    if (loadingData.lessonPlans && (!Array.isArray(lessonPlans) || lessonPlans.length === 0)) return <Loading />;
    
    const staffNameMap = Array.isArray(staff) ? staff.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>) : {};

    const roomNameMap = Array.isArray(rooms) ? rooms.reduce((acc, r) => {
        acc[r.id] = r.name;
        return acc;
    }, {} as Record<string, string>) : {};

    const canPerformActions = (plan: LessonPlan) => {
        return currentUser?.role === 'admin' || currentUser?.staff_id === plan.staff_id;
    };

    const canCreate = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Lesson Plans</h2>
                {canCreate && (
                    <Button onClick={() => onOpenCreateOrEditModal(null)} className="btn btn-primary btn-small">
                        <Icons.PlusCircle size={18} /> <span className="hidden sm:inline">New Lesson Plan</span>
                    </Button>
                )}
            </div>
            {(!loadingData.lessonPlans && (!Array.isArray(lessonPlans) || lessonPlans.length === 0)) ? (
                <InfoMessage message="No lesson plans have been created yet." icon={Icons.BookCopy} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Title</th>
                                <th className="th-cell">Date</th>
                                <th className="th-cell th-sm-hidden">Room</th>
                                <th className="th-cell th-md-hidden">Created By</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(lessonPlans) && lessonPlans.map(plan => (
                                <tr key={plan.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{plan.title}</td>
                                    <td className="td-cell">{formatDateForInput(plan.plan_date)}</td>
                                    <td className="td-cell th-sm-hidden">{plan.room_id ? roomNameMap[plan.room_id] : 'All Rooms'}</td>
                                    <td className="td-cell th-md-hidden">{staffNameMap[plan.staff_id] || 'Unknown'}</td>
                                    <td className="td-cell td-actions">
                                        {plan.document_url && (
                                            <a href={plan.document_url} target="_blank" rel="noopener noreferrer" className="btn-icon table-action-button" title="View Document">
                                                <Icons.Paperclip size={16} />
                                            </a>
                                        )}
                                        {canPerformActions(plan) && (
                                            <>
                                                <button onClick={() => onOpenCreateOrEditModal(plan)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                                <button onClick={() => onDeleteLessonPlan(plan.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
                                            </>
                                        )}
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
