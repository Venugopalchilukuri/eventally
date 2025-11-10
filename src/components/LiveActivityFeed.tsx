"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'registration' | 'like' | 'comment' | 'new_event';
  timestamp: string;
  eventTitle: string;
  eventId: string;
  userId?: string;
  userName?: string;
  commentText?: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchActivities() {
    try {
      const response = await fetch('/api/activity?limit=10');
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      // Only set loading to false on first load
      if (loading) {
        setLoading(false);
      }
    }
  }

  function getTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function getActivityIcon(type: string): string {
    switch (type) {
      case 'registration': return '👤';
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'new_event': return '🆕';
      default: return '✨';
    }
  }

  function getActivityText(activity: Activity): React.ReactElement {
    switch (activity.type) {
      case 'registration':
        return (
          <>
            <span className="font-medium">Someone</span> registered for{' '}
            <Link href={`/events/${activity.eventId}`} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400">
              {activity.eventTitle}
            </Link>
          </>
        );
      case 'like':
        return (
          <>
            <span className="font-medium">Someone</span> liked{' '}
            <Link href={`/events/${activity.eventId}`} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400">
              {activity.eventTitle}
            </Link>
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-medium">{activity.userName || 'Someone'}</span> commented on{' '}
            <Link href={`/events/${activity.eventId}#comments`} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400">
              {activity.eventTitle}
            </Link>
          </>
        );
      case 'new_event':
        return (
          <>
            New event:{' '}
            <Link href={`/events/${activity.eventId}`} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400">
              {activity.eventTitle}
            </Link>
          </>
        );
      default:
        return <span>Activity on {activity.eventTitle}</span>;
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Loading...</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-2 items-start animate-pulse">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Live Activity</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No recent activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Live Activity</h2>
      </div>

      {/* Activity List - Compact */}
      <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {activities.slice(0, 5).map((activity, index) => (
          <div
            key={activity.id}
            className="flex gap-2 items-start p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            {/* Icon - Smaller */}
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center text-base sm:text-lg">
              {getActivityIcon(activity.type)}
            </div>

            {/* Content - Compact */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-snug">
                {getActivityText(activity)}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Compact */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/events"
          className="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center justify-center gap-1 group"
        >
          <span>View All</span>
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
