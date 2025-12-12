"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleSaveEvent, isEventSaved } from "@/lib/savedEvents";

interface BookmarkButtonProps {
    eventId: string;
    eventTitle: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
    onToggle?: (isSaved: boolean) => void;
}

export default function BookmarkButton({
    eventId,
    eventTitle,
    size = "md",
    showLabel = false,
    className = "",
    onToggle,
}: BookmarkButtonProps) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (user) {
            checkIfSaved();
        } else {
            setIsChecking(false);
            setIsSaved(false);
        }
    }, [eventId, user]);

    async function checkIfSaved() {
        if (!user) return;

        setIsChecking(true);
        const saved = await isEventSaved(eventId, user.id);
        setIsSaved(saved);
        setIsChecking(false);
    }

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please sign in to save events");
            return;
        }

        setIsLoading(true);
        const result = await toggleSaveEvent(eventId, user.id);

        if (result.success) {
            const newSavedState = result.saved || false;
            setIsSaved(newSavedState);
            onToggle?.(newSavedState);

            // Optional: Show a subtle notification
            if (newSavedState) {
                console.log(`✅ Saved: ${eventTitle}`);
            } else {
                console.log(`❌ Removed: ${eventTitle}`);
            }
        } else {
            alert(result.error || "Failed to save event");
        }

        setIsLoading(false);
    }

    const sizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-3",
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    if (isChecking) {
        return (
            <button
                disabled
                className={`${sizeClasses[size]} rounded-full opacity-50 ${className}`}
                title="Checking..."
            >
                <svg
                    width={iconSizes[size]}
                    height={iconSizes[size]}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="animate-pulse"
                >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
        ${sizeClasses[size]}
        rounded-full
        transition-all
        hover:bg-purple-100 dark:hover:bg-purple-900/50
        ${isSaved ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}
        disabled:opacity-50
        disabled:cursor-not-allowed
        group
        ${className}
      `}
            title={isSaved ? "Remove from saved" : "Save event"}
            aria-label={isSaved ? "Remove from saved" : "Save event"}
        >
            <svg
                width={iconSizes[size]}
                height={iconSizes[size]}
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:scale-110"
            >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {showLabel && (
                <span className="ml-2 text-sm font-medium">
                    {isSaved ? "Saved" : "Save"}
                </span>
            )}
        </button>
    );
}
