"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string, redirectUrl?: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." } } as any;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." }, user: null } as any;
    }
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    return { error, user: data?.user ?? null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const sendPasswordReset = async (email: string, redirectUrl?: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured." } } as any;
    }

    try {
      // Get the redirect URL - prioritize window.location.origin for client-side
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const base = redirectUrl || origin || appUrl;
      const redirectTo = base ? `${base}/reset-password` : undefined;

      console.log('🔐 Password Reset Request:', {
        email,
        redirectTo,
        appUrl,
        origin,
        base
      });

      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || undefined,
      });

      console.log('🔐 Password Reset Response:', { error, data });

      // Provide more helpful error messages
      if (error) {
        console.error('Password reset error details:', error);

        // Check for common error scenarios
        if (error.message?.toLowerCase().includes('smtp')) {
          return {
            error: {
              message: "Email service is not configured. Please contact support or check Supabase SMTP settings."
            }
          };
        }

        if (error.message?.toLowerCase().includes('user not found')) {
          return {
            error: {
              message: "No account found with this email address. Please sign up first."
            }
          };
        }

        if (error.message?.toLowerCase().includes('rate limit')) {
          return {
            error: {
              message: "Too many requests. Please wait a few minutes and try again."
            }
          };
        }
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected error in sendPasswordReset:', err);
      return {
        error: {
          message: err.message || "An unexpected error occurred. Please try again."
        }
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured." } } as any;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
