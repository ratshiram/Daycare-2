import React from 'react';
import { InfoMessage } from '../ui/InfoMessage';
import { Icons } from '@/components/Icons';

export const UnknownRolePage = () => (
    <div className="page-card">
        <InfoMessage
            message="Your account is active, but your role is not yet assigned or recognized. Please contact an administrator for assistance."
            type="warning"
            icon={Icons.AlertTriangle} />
    </div>
);
