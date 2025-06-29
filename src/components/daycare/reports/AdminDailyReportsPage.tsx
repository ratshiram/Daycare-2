
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { DailyReport, Child, Staff } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import Loading from '@/app/loading';
import { useAppState } from '@/app/app';

interface AdminDailyReportsPageProps {
    dailyReports: DailyReport[];
    loading: boolean;
    children: Child[];
    staff: Staff[];
    onOpenCreateReportModal: (() => void) | null;
    onViewReportDetails: (report: DailyReport) => void;
    onEditReport: ((report: DailyReport) => void) | null;
    onDeleteReport: ((reportId: string) => void) | null;
}

export const AdminDailyReportsPage: React.FC<AdminDailyReportsPageProps> = ({ dailyReports, loading, children, staff, onOpenCreateReportModal, onViewReportDetails, onEditReport, onDeleteReport }) => {
    const { currentUser } = useAppState();

    if (loading && (!Array.isArray(dailyReports) || dailyReports.length === 0)) return <Loading />;

    const childNameMap = Array.isArray(children) ? children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
    }, {} as Record<string, string>) : {};

    const staffNameMap = Array.isArray(staff) ? staff.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>) : {};

    const canPerformAction = (report: DailyReport, action: 'edit' | 'delete') => {
        if (!currentUser) return false;
        
        const handler = action === 'edit' ? onEditReport : onDeleteReport;
        if (!handler) return false;

        if (currentUser.role === 'admin') return true;
        
        if (currentUser.role === 'teacher' && report.staff_id === currentUser.staff_id) {
            return true;
        }

        return false;
    };

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Daily Reports</h2>
                {onOpenCreateReportModal && (
                    <button onClick={onOpenCreateReportModal} className="btn btn-primary btn-small">
                        <Icons.PlusCircle size={18} /> <span className="hidden sm:inline">Create Report</span>
                    </button>
                )}
            </div>
            {(!loading && (!Array.isArray(dailyReports) || dailyReports.length === 0)) ? (
                <InfoMessage message="No daily reports found." icon={Icons.FileText} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Date</th>
                                <th className="th-cell">Child</th>
                                <th className="th-cell th-sm-hidden">Mood</th>
                                <th className="th-cell th-md-hidden">Reported By</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(dailyReports) && dailyReports.map(report => (
                                <tr key={report.id} className="table-row">
                                    <td className="td-cell">{formatDateForInput(report.report_date)}</td>
                                    <td className="td-cell td-name font-semibold">{childNameMap[report.child_id] || 'Unknown Child'}</td>
                                    <td className="td-cell td-sm-hidden">{report.mood}</td>
                                    <td className="td-cell td-md-hidden">{staffNameMap[report.staff_id] || 'Unknown Staff'}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onViewReportDetails(report)} className="btn-icon table-action-button" title="View Details">
                                            <Icons.Eye size={16} />
                                        </button>
                                        {canPerformAction(report, 'edit') && (
                                            <button onClick={() => onEditReport!(report)} className="btn-icon table-action-button edit" title="Edit Report">
                                                <Icons.Edit3 size={16} />
                                            </button>
                                        )}
                                        {canPerformAction(report, 'delete') && (
                                            <button onClick={() => onDeleteReport!(report.id)} className="btn-icon table-action-button delete" title="Delete Report">
                                                <Icons.Trash2 size={16} />
                                            </button>
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
