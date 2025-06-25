
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Room } from '@/types';

interface AddRoomModalProps {
    onAddRoom: (roomData: Omit<Room, 'id' | 'created_at'>) => void;
    onClose: () => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ onAddRoom, onClose }) => {
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
        <Modal onClose={onClose} title="Add New Room" size="medium">
            <form onSubmit={handleSubmit} className="form-layout">
                <InputField label="Room Name" name="name" value={formData.name} onChange={handleChange} required icon={Icons.Building} />
                <InputField label="Capacity" name="capacity" type="number" value={formData.capacity === null ? '' : formData.capacity} onChange={handleChange} />
                <FormActions onCancel={onClose} submitText="Add Room" submitIcon={Icons.PlusCircle} />
            </form>
        </Modal>
    );
};
