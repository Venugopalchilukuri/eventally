'use client';

import React from 'react';
import { EventStatus, getStatusConfig } from '@/lib/eventStatus';

interface EventStatusBadgeProps {
    status: EventStatus;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export default function EventStatusBadge({
    status,
    size = 'md',
    showIcon = true
}: EventStatusBadgeProps) {
    const config = getStatusConfig(status);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
            style={{
                color: config.color,
                backgroundColor: config.bgColor
            }}
        >
            {showIcon && <span>{config.icon}</span>}
            <span>{config.label}</span>
        </span>
    );
}
