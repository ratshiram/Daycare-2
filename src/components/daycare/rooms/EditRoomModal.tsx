import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { FormActions } from '../ui/FormActions';
import { Icons } from '@/components/Icons';
import type { Room } from '@/types';

interface EditRoomModalProps {
    room: Room | null;
    onClose: () => void;
    onUpdateRoom: (roomData: Room) => void;
    showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({ room, onClose, onUpdateRoom, showAlert }) => {
    const [formData, setFormData] = useState<Room>({ ...room! });

    useEffect(() => {
        if (room) {
            setFormData({ ...room });
        }
    }, [room]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? null : parseInt(value, 10)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            showAlert("Room Name is required.", "error");
            return;
        }
        onUpdateRoom(formData);
    };

    if (!room) return null;

    return (
        <Modal onClose={onClose} title={`Edit ${room.name}`} size="medium">
            <form onSubmit={handleSubmit} className="form-layout modal-form">
                <InputField label="Room Name" name="name" value={formData.name} onChange={handleChange} required icon={Icons.Building} />
                <InputField label="Capacity" name="capacity" type="number" value={formData.capacity === null ? '' : formData.capacity} onChange={handleChange} />
                <FormActions onCancel={onClose} submitText="Save Changes" submitIcon={Icons.CheckCircle} />
            </form>
        </Modal>
    );
};
