'use client';

import React, { useState } from 'react';
import { EventStatus, updateEventStatus } from '@/lib/eventStatus';

interface EventStatusControlProps {
    eventId: string;
    currentStatus: EventStatus;
    onStatusChange?: (newStatus: EventStatus) => void;
}

export default function EventStatusControl({
    eventId,
    currentStatus,
    onStatusChange
}: EventStatusControlProps) {
    const [status, setStatus] = useState<EventStatus>(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusChange = async (newStatus: EventStatus) => {
        if (newStatus === status) return;

        // Confirm cancellation
        if (newStatus === 'cancelled') {
            const confirmed = window.confirm(
                'Are you sure you want to cancel this event? Registered attendees will be notified.'
            );
            if (!confirmed) return;
        }

        // Confirm publishing
        if (newStatus === 'published' && status === 'draft') {
            const confirmed = window.confirm(
                'Are you sure you want to publish this event? It will be visible to everyone.'
            );
            if (!confirmed) return;
        }

        setIsUpdating(true);
        setError(null);

        const result = await updateEventStatus(eventId, newStatus);

        if (result.success) {
            setStatus(newStatus);
            onStatusChange?.(newStatus);
        } else {
            setError(result.error || 'Failed to update status');
        }

        setIsUpdating(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                    Event Status:
                </label>
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="cancelled">❌ Cancelled</option>
                </select>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {isUpdating && (
                <div className="text-sm text-gray-600">
                    Updating status...
                </div>
            )}

            {/* Status descriptions */}
            <div className="text-xs text-gray-500 space-y-1">
                {status === 'draft' && (
                    <p>📝 This event is not visible to the public. Publish it when ready.</p>
                )}
                {status === 'published' && (
                    <p>✅ This event is live and visible to everyone.</p>
                )}
                {status === 'cancelled' && (
                    <p>❌ This event has been cancelled. It may still be visible but registration is disabled.</p>
                )}
            </div>
        </div>
    );
}
