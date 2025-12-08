"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!isSupabaseConfigured) {
        setError("Configuration missing. Set Supabase env vars.");
      } else {
        console.log('Sending password reset to:', email);
        const { error } = await sendPasswordReset(email);
        console.log('Password reset result:', { error });

        if (error) {
          console.error('Password reset error:', error);

          // Display the error message from the auth context
          setError(error.message || "Failed to send reset email. Please try again.");
        } else {
          setSuccess(
            "Check your email for the reset link. If you don't see it, check your spam folder. " +
            "The email will come from noreply@mail.app.supabase.io or your configured SMTP sender."
          );
          // Clear the email field after successful submission
          setEmail("");
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Enter your email to receive a reset link.</p>

          {!isSupabaseConfigured && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
              Supabase configuration is missing.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-800 dark:text-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
