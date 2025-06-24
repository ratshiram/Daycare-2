import React from 'react';
import type { LucideProps } from 'lucide-react';

interface InfoMessageProps {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    icon?: React.ComponentType<LucideProps>;
}

export const InfoMessage: React.FC<InfoMessageProps> = ({ message, type = "info", icon: Icon }) => (
    <div className={`p-4 rounded-md text-sm flex items-center gap-3 bg-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-100 text-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-800`}>
        {Icon && <Icon size={20} />}
        <span>{message}</span>
    </div>
);
