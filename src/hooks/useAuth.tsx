import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  isEmailVerified: () => boolean;
  isDriverProfileComplete: () => Promise<boolean>;
  updateDriverProfile: (profileData: any) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>; // <-- new function
}
  // Resend confirmation email for signup verification
  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the new verification link.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => {
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser) {
      setUser(freshUser);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role?: string) => {
    try {
      // Validate input
      if (!email || !email.trim()) throw new Error('Email is required');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!fullName || !fullName.trim()) throw new Error('Full name is required');

      // Ensure full_name and role are always provided and valid
      const safeFullName = fullName.trim();
      const safeRole = (role && role.trim()) ? role.trim().toLowerCase() : 'user';

      // Validate role
      const validRoles = ['user', 'driver', 'admin', 'passenger'];
      if (!validRoles.includes(safeRole)) {
        throw new Error('Invalid role provided');
      }

      const userMeta: Record<string, any> = {
        full_name: safeFullName,
        role: safeRole
      };

      console.log('Attempting signup with:', { email, fullName: safeFullName, role: safeRole });

      // Create the auth user with metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: userMeta,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (signUpError) {
        // Log original error for debugging
        console.error('Supabase signup error:', signUpError);

        // If the server returned an internal/database error, provide actionable guidance
        const rawMsg = (signUpError && (signUpError.message || signUpError.error || String(signUpError))) || 'Unknown signup error';
        if ((signUpError as any)?.status === 500 || rawMsg.toLowerCase().includes('database')) {
          const guidance = '\n\nDATABASE SETUP REQUIRED:\n\n' +
            '1. Go to https://app.supabase.com\n' +
            '2. Select your project\n' +
            '3. Click "SQL Editor" → "New Query"\n' +
            '4. Copy content from supabase/SIMPLE_FIX.sql\n' +
            '5. Paste and click "Run"\n\n' +
            'This will create the necessary database tables and triggers for user signup.';
          throw new Error('Database error: Missing tables/triggers.' + guidance);
        }

        // Re-throw other errors as-is
        throw signUpError;
      }

      const newUser = signUpData.user;
      if (!newUser?.id) {
        throw new Error('User creation failed - no user ID returned');
      }

      // Set the user immediately
      setUser(newUser);

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account. Check your spam folder if you don't see it.",
      });

      return { error: null, user: newUser };

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error messages
      let errorMessage = 'An error occurred during signup';
      
      if (error?.message?.includes('Database error')) {
        errorMessage = 'Database error. Please try again in a moment or contact support.';
      } else if (error?.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error_description) {
        errorMessage = error.error_description;
      }
      
      toast({
        title: "Signup Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error, user: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      if (!email || !email.trim()) throw new Error('Email is required');
      if (!password) throw new Error('Password is required');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      const freshUser = data.user;
      if (!freshUser) {
        throw new Error('Login failed - no user returned');
      }

      // Update local user state
      setUser(freshUser);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      return { error: null, user: freshUser };

    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error?.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email first. Check your inbox for the verification link.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error_description) {
        errorMessage = error.error_description;
      }
      
      toast({
        title: "Login Error", 
        description: errorMessage,
        variant: "destructive"
      });
      return { error, user: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const isEmailVerified = () => {
    // Check both email_confirmed_at and user.confirmed_at for verification status
    return Boolean(user?.email_confirmed_at || user?.confirmed_at);
  };

  type DriverProfile = {
    id: string;
    full_name: string;
    phone_number: string;
    license_number: string;
    vehicle_number: string;
    vehicle_type: string;
    is_available: boolean;
    updated_at?: string;
  };

  const isDriverProfileComplete = async () => {
    if (!user) return false;
    if (!isEmailVerified()) return false;
    const { data: profile, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error || !profile) return false;
    return Boolean(
      profile.full_name &&
      profile.phone_number &&
      profile.license_number &&
      profile.vehicle_number &&
      profile.vehicle_type
    );
  };

  const updateDriverProfile = async (profileData: Partial<DriverProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }
    if (!isEmailVerified()) {
      toast({
        title: "Email Not Verified",
        description: "Please verify your email before updating your profile. Check your inbox for the verification link.",
        variant: "destructive"
      });
      return { error: new Error('Please verify your email before updating profile') };
    }
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile: " + error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`, // Supabase will add #access_token and type=recovery automatically
      });
      if (error) throw error;
      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Reset Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    refreshUser,
    isEmailVerified,
    isDriverProfileComplete,
    updateDriverProfile,
    resetPassword,
    resendConfirmationEmail // <-- add here
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};