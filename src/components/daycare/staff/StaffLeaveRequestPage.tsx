
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { StaffLeaveRequest, Staff } from '@/types';
import { formatDateForInput } from '@/lib/customUtils';
import { useAppState } from '@/app/app';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';

interface StaffLeaveRequestPageProps {
    onOpenRequestLeaveModal: () => void;
    onUpdateRequestStatus: (requestId: string, status: 'approved' | 'denied') => void;
}

export const StaffLeaveRequestPage: React.FC<StaffLeaveRequestPageProps> = ({ onOpenRequestLeaveModal, onUpdateRequestStatus }) => {
    const { currentUser, staffLeaveRequests, staff, loadingData } = useAppState();
    const isAdmin = currentUser?.role === 'admin';

    const requestsToDisplay = isAdmin 
        ? staffLeaveRequests 
        : (staffLeaveRequests || []).filter(req => req.staff_id === currentUser?.staff_id);

    const staffNameMap = Array.isArray(staff) ? staff.reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
    }, {} as Record<string, string>) : {};
    
    if (loadingData.staffLeaveRequests && (!Array.isArray(requestsToDisplay) || requestsToDisplay.length === 0)) return <Loading />;

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'status-badge-green';
            case 'denied': return 'status-badge-red';
            case 'pending':
            default:
                return 'status-badge-pending';
        }
    };

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Staff Leave Requests</h2>
                {!isAdmin && (
                    <Button onClick={onOpenRequestLeaveModal} className="btn btn-primary btn-small">
                        <Icons.PlusCircle size={18} /> <span className="hidden sm:inline">Request Time Off</span>
                    </Button>
                )}
            </div>
            {(!loadingData.staffLeaveRequests && (!Array.isArray(requestsToDisplay) || requestsToDisplay.length === 0)) ? (
                <InfoMessage message="There are no leave requests to display." icon={Icons.Plane} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {isAdmin && <th className="th-cell">Staff Member</th>}
                                <th className="th-cell">Start Date</th>
                                <th className="th-cell">End Date</th>
                                <th className="th-cell th-sm-hidden">Type</th>
                                <th className="th-cell th-lg-hidden">Reason</th>
                                <th className="th-cell">Status</th>
                                {isAdmin && <th className="th-cell th-md-hidden">Reviewed By</th>}
                                {isAdmin && <th className="th-cell th-actions">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(requestsToDisplay) && requestsToDisplay.map(request => (
                                <tr key={request.id} className="table-row">
                                    {isAdmin && <td className="td-cell td-name font-semibold">{staffNameMap[request.staff_id] || 'Unknown'}</td>}
                                    <td className="td-cell">{formatDateForInput(request.start_date)}</td>
                                    <td className="td-cell">{formatDateForInput(request.end_date)}</td>
                                    <td className="td-cell th-sm-hidden">{request.leave_type || 'N/A'}</td>
                                    <td className="td-cell td-lg-hidden truncate max-w-xs">{request.reason || 'N/A'}</td>
                                    <td className="td-cell">
                                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    {isAdmin && <td className="td-cell th-md-hidden">{request.reviewed_by_admin_id ? staffNameMap[request.reviewed_by_admin_id] : ''}</td>}
                                    {isAdmin && request.status === 'pending' && (
                                        <td className="td-cell td-actions">
                                            <Button onClick={() => onUpdateRequestStatus(request.id, 'approved')} variant="ghost" size="sm" className="text-green-600 hover:bg-green-100 hover:text-green-700">Approve</Button>
                                            <Button onClick={() => onUpdateRequestStatus(request.id, 'denied')} variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">Deny</Button>
                                        </td>
                                    )}
                                    {isAdmin && request.status !== 'pending' && <td className="td-cell"></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

    
