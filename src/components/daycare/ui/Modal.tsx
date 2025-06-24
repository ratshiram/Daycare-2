import React from 'react';
import { Icons } from '@/components/Icons';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
    size?: "medium" | "large";
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, title, size = "large" }) => (
    <div className="modal-overlay">
        <div className={`modal-content modal-size-${size}`}>
            <div className="modal-header">
                <h3 className="modal-title">{title}</h3>
                <button onClick={onClose} className="modal-close-button"><Icons.X size={22} /></button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);
