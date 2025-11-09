"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalMembers: number;
  totalEvents: number;
  todayRegistrations: number;
  totalLikes: number;
}

export default function LiveStatsCounter() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalEvents: 0,
    todayRegistrations: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      // Get total events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get today's registrations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayRegs } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get total likes
      const { count: likesCount } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalMembers: 0, // We'll skip user count for security
        totalEvents: eventsCount || 0,
        todayRegistrations: todayRegs || 0,
        totalLikes: likesCount || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Total Events */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🎉</span>
          <span className="text-3xl font-bold">{stats.totalEvents.toLocaleString()}</span>
        </div>
        <p className="text-purple-100 text-sm font-medium">Total Events</p>
      </div>

      {/* Today's Registrations */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">👥</span>
          <span className="text-3xl font-bold">{stats.todayRegistrations.toLocaleString()}</span>
        </div>
        <p className="text-blue-100 text-sm font-medium">Registrations Today</p>
      </div>

      {/* Total Likes */}
      <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">❤️</span>
          <span className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</span>
        </div>
        <p className="text-pink-100 text-sm font-medium">Events Liked</p>
      </div>
    </div>
  );
}
