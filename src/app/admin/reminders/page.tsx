"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ReminderTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function triggerReminders() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/send-event-reminders', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminders');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to trigger reminders');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔔 Event Reminder System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Test the automated event reminder system. This will check for events happening in 24 hours and send reminder emails to all registered users.
          </p>

          {/* Trigger Button */}
          <div className="mb-8">
            <button
              onClick={triggerReminders}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking Events..." : "🚀 Send Reminders Now"}
            </button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This checks for events happening in ~24 hours and sends reminder emails
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">❌ {error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                ✅ {result.message}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events Found</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {result.eventCount}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Emails Sent</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {result.emailsSent}
                  </p>
                </div>
              </div>

              {/* Event Details */}
              {result.results && result.results.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Event Details:</h4>
                  {result.results.map((event: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {event.eventTitle}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>📧 Sent: {event.emailsSent}</span>
                        {event.totalRegistrations && (
                          <span>👥 Total: {event.totalRegistrations}</span>
                        )}
                      </div>
                      {event.message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {event.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Events Found */}
          {result && result.success && result.eventCount === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <p className="text-blue-900 dark:text-blue-100">
                ℹ️ No events requiring reminders at this time. Events must be scheduled for approximately 24 hours from now.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📋 How to Test:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Create an event with date set to <strong>tomorrow</strong></li>
              <li>Register for the event with your email</li>
              <li>Click "Send Reminders Now" button above</li>
              <li>Check your email inbox for the reminder</li>
            </ol>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> In production, this runs automatically every day at 9:00 AM UTC via Vercel cron jobs.
              </p>
            </div>
          </div>

          {/* Automation Info */}
          <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
              ⏰ Automated Schedule:
            </h3>
            <p className="text-purple-800 dark:text-purple-200 mb-2">
              When deployed to Vercel, reminders are automatically sent:
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300">
              <li>Every day at 9:00 AM UTC</li>
              <li>To all users registered for events happening in ~24 hours</li>
              <li>No manual action required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
