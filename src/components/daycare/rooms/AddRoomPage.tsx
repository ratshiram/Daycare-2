import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Room } from '@/types';

interface AddRoomPageProps {
    onAddRoom: (roomData: Omit<Room, 'id' | 'created_at'>) => void;
    onCancel: () => void;
}

export const AddRoomPage: React.FC<AddRoomPageProps> = ({ onAddRoom, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Room, 'id' | 'created_at'>>({
        name: '',
        capacity: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? null : parseInt(value, 10)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddRoom(formData);
    };

    return (
        <div className="page-card form-page-card">
            <button onClick={onCancel} className="btn btn-secondary btn-small btn-back"><Icons.ArrowLeft size={18} /> Back to Rooms</button>
            <h2 className="page-card-title form-page-title mt-4">Add New Room</h2>
            <form onSubmit={handleSubmit} className="form-layout">
                <InputField label="Room Name" name="name" value={formData.name} onChange={handleChange} required icon={Icons.Building} />
                <InputField label="Capacity" name="capacity" type="number" value={formData.capacity === null ? '' : formData.capacity} onChange={handleChange} />
                <FormActions onCancel={onCancel} submitText="Add Room" submitIcon={Icons.PlusCircle} />
            </form>
        </div>
    );
};
