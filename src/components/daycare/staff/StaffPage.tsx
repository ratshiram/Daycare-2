
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Staff, Room } from '@/types';
import Loading from '@/app/loading';

interface StaffPageProps {
    staffList: Staff[];
    loading: boolean;
    onOpenAddStaffModal: () => void;
    onEditStaff: (staff: Staff) => void;
    onDeleteStaff: (staffId: string) => void;
    rooms: Room[];
}

export const StaffPage: React.FC<StaffPageProps> = ({ staffList, loading, onOpenAddStaffModal, onEditStaff, onDeleteStaff, rooms }) => {
    if (loading && (!Array.isArray(staffList) || staffList.length === 0)) return <Loading />;

    const roomNameMap = Array.isArray(rooms) ? rooms.reduce((acc, room) => {
        acc[room.id] = room.name;
        return acc;
    }, {} as Record<string, string>) : {};

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Manage Staff</h2>
                <button onClick={onOpenAddStaffModal} className="btn btn-primary btn-small">
                    <Icons.UserPlus size={18} /> Add New Staff
                </button>
            </div>
            {(!loading && (!Array.isArray(staffList) || staffList.length === 0)) ? (
                <InfoMessage message="No staff records found." icon={Icons.UsersIconAliased} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Name</th>
                                <th className="th-cell">Role</th>
                                <th className="th-cell th-sm-hidden">Main Room</th>
                                <th className="th-cell th-md-hidden">Email</th>
                                <th className="th-cell th-lg-hidden">Phone</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(staffList) && staffList.map(staffMember => (
                                <tr key={staffMember.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{staffMember.name}</td>
                                    <td className="td-cell capitalize">{staffMember.role}</td>
                                    <td className="td-cell th-sm-hidden">
                                        {(staffMember.role === 'teacher' && staffMember.main_room_id) ? roomNameMap[staffMember.main_room_id] || 'N/A' : 'N/A'}
                                    </td>
                                    <td className="td-cell td-md-hidden">{staffMember.email}</td>
                                    <td className="td-cell td-lg-hidden">{staffMember.contact_phone}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onEditStaff(staffMember)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => onDeleteStaff(staffMember.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
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
