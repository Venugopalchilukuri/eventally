"use client";

import { useState, useEffect } from "react";

interface EventCountdownProps {
    eventDate: string;
    eventTime: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

export default function EventCountdown({
    eventDate,
    eventTime,
    size = "md",
    showLabel = true,
    className = "",
}: EventCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        function calculateTimeLeft(): TimeLeft {
            const eventDateTime = new Date(`${eventDate}T${eventTime}`);
            const now = new Date();
            const difference = eventDateTime.getTime() - now.getTime();

            if (difference <= 0) {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    total: 0,
                };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                total: difference,
            };
        }

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [eventDate, eventTime, isClient]);

    // Don't render on server to avoid hydration mismatch
    if (!isClient || !timeLeft) {
        return null;
    }

    // Event has already started or ended
    if (timeLeft.total <= 0) {
        return (
            <div
                className={`flex items-center gap-2 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
                    } ${className}`}
            >
                <span className="text-green-600 dark:text-green-400 font-semibold">
                    🎉 Event Started!
                </span>
            </div>
        );
    }

    // Determine urgency level
    const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // Less than 24 hours
    const isVerySoon = timeLeft.total < 60 * 60 * 1000; // Less than 1 hour

    // Size classes
    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    const numberSizeClasses = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-2xl",
    };

    // Color based on urgency
    const colorClass = isVerySoon
        ? "text-red-600 dark:text-red-400"
        : isUrgent
            ? "text-orange-600 dark:text-orange-400"
            : "text-purple-600 dark:text-purple-400";

    const bgClass = isVerySoon
        ? "bg-red-50 dark:bg-red-900/20"
        : isUrgent
            ? "bg-orange-50 dark:bg-orange-900/20"
            : "bg-purple-50 dark:bg-purple-900/20";

    // Format display based on time left
    const getDisplayText = () => {
        if (timeLeft.days > 0) {
            return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
        } else if (timeLeft.hours > 0) {
            return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
        } else if (timeLeft.minutes > 0) {
            return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
        } else {
            return `${timeLeft.seconds}s`;
        }
    };

    // Compact version (for cards)
    if (size === "sm" && !showLabel) {
        return (
            <div className={`flex items-center gap-1.5 ${sizeClasses[size]} ${colorClass} ${className}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="font-semibold">{getDisplayText()}</span>
            </div>
        );
    }

    // Full version with label
    return (
        <div className={`${bgClass} rounded-lg p-3 ${className}`}>
            {showLabel && (
                <p className={`${sizeClasses[size]} text-gray-600 dark:text-gray-400 mb-1`}>
                    {isVerySoon ? "🔥 Starting very soon!" : isUrgent ? "⏰ Starting soon!" : "⏱️ Starts in"}
                </p>
            )}
            <div className={`flex items-center gap-2 ${colorClass}`}>
                {timeLeft.days > 0 && (
                    <div className="flex flex-col items-center">
                        <span className={`${numberSizeClasses[size]} font-bold`}>{timeLeft.days}</span>
                        <span className={`${sizeClasses[size]} opacity-75`}>days</span>
                    </div>
                )}
                {(timeLeft.days > 0 || timeLeft.hours > 0) && (
                    <>
                        {timeLeft.days > 0 && <span className="text-lg">:</span>}
                        <div className="flex flex-col items-center">
                            <span className={`${numberSizeClasses[size]} font-bold`}>{timeLeft.hours}</span>
                            <span className={`${sizeClasses[size]} opacity-75`}>hours</span>
                        </div>
                    </>
                )}
                {(timeLeft.hours > 0 || timeLeft.minutes > 0) && (
                    <>
                        <span className="text-lg">:</span>
                        <div className="flex flex-col items-center">
                            <span className={`${numberSizeClasses[size]} font-bold`}>{timeLeft.minutes}</span>
                            <span className={`${sizeClasses[size]} opacity-75`}>min</span>
                        </div>
                    </>
                )}
                {timeLeft.days === 0 && (
                    <>
                        <span className="text-lg">:</span>
                        <div className="flex flex-col items-center">
                            <span className={`${numberSizeClasses[size]} font-bold`}>{timeLeft.seconds}</span>
                            <span className={`${sizeClasses[size]} opacity-75`}>sec</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
