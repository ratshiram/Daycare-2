
import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';
import type { Room } from '@/types';
import Loading from '@/app/loading';

interface RoomManagementPageProps {
    rooms: Room[];
    loading: boolean;
    onOpenAddRoomModal: () => void;
    onEditRoom: (room: Room) => void;
    onDeleteRoom: (roomId: string) => void;
}

export const RoomManagementPage: React.FC<RoomManagementPageProps> = ({ rooms, loading, onOpenAddRoomModal, onEditRoom, onDeleteRoom }) => {
    if (loading && (!Array.isArray(rooms) || rooms.length === 0)) return <Loading />;

    return (
        <div className="page-card">
            <div className="page-card-header">
                <h2 className="page-card-title">Manage Rooms</h2>
                <button onClick={onOpenAddRoomModal} className="btn btn-primary btn-small">
                    <Icons.PlusCircle size={18} /> Add New Room
                </button>
            </div>
            {(!loading && (!Array.isArray(rooms) || rooms.length === 0)) ? (
                <InfoMessage message="No rooms have been created yet." icon={Icons.Building} />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-cell">Room Name</th>
                                <th className="th-cell">Capacity</th>
                                <th className="th-cell th-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(rooms) && rooms.map(room => (
                                <tr key={room.id} className="table-row">
                                    <td className="td-cell td-name font-semibold">{room.name}</td>
                                    <td className="td-cell">{room.capacity ?? 'N/A'}</td>
                                    <td className="td-cell td-actions">
                                        <button onClick={() => onEditRoom(room)} className="btn-icon table-action-button edit" title="Edit"><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => onDeleteRoom(room.id)} className="btn-icon table-action-button delete" title="Delete"><Icons.Trash2 size={16} /></button>
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
