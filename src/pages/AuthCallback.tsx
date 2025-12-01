import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<'reset' | 'error' | 'verifying'>('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback triggered');
        console.log('URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // Get parameters from both hash and search
        const hash = window.location.hash;
        const search = window.location.search;
        
        // Extract type from URL
        const typeFromSearch = searchParams.get('type');
        const typeFromHash = new URLSearchParams(hash.replace(/^#/, '')).get('type');
        const authType = typeFromSearch || typeFromHash;
        
        console.log('Auth type:', authType);

        // Check for errors
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');
        
        if (errorCode) {
          console.error('Auth error:', errorCode, errorDescription);
          setMode('error');
          setErrorMsg(decodeURIComponent(errorDescription || 'Authentication failed'));
          return;
        }

        // Handle password reset flow
        if (authType === 'recovery' || authType === 'magiclink' || hash.includes('type=recovery')) {
          console.log('Detected password reset flow');
          setMode('reset');
          return;
        }

        // Handle email confirmation flow
        console.log('Attempting email verification...');
        
        // Supabase should automatically verify the email when the link is clicked
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session:', session?.user?.email, 'Error:', sessionError);
        
        if (session?.user) {
          // User is logged in after email verification
          console.log('Email verified, user logged in');
          toast({
            title: 'Success!',
            description: 'Your email has been verified. Redirecting...',
          });
          
          // Check if user is a driver
          if (session.user.user_metadata?.role === 'driver') {
            setTimeout(() => navigate('/driver-dashboard'), 1000);
          } else {
            setTimeout(() => navigate('/'), 1000);
          }
        } else {
          // Email was verified but user not logged in yet
          console.log('Email verified, redirecting to login');
          toast({
            title: 'Success!',
            description: 'Your email has been verified. You can now log in.',
          });
          setTimeout(() => navigate('/auth'), 1500);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMode('error');
        setErrorMsg('An error occurred during authentication. Please try again.');
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, toast, searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Password updated! You can now log in with your new password.',
      });
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {mode === 'verifying' && (
        <div className="bg-white p-8 rounded shadow max-w-sm w-full flex flex-col gap-4 items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-center">Verifying your email...</p>
          <p className="text-xs text-gray-400 text-center">This may take a few seconds</p>
        </div>
      )}
      {mode === 'reset' && (
        <form onSubmit={handlePasswordReset} className="bg-white p-6 rounded shadow max-w-sm w-full flex flex-col gap-4">
          <AlertTitle className="text-xl font-bold">Set New Password</AlertTitle>
          <AlertDescription>
            Enter your new password below to reset your account password.
          </AlertDescription>
          <Input
            type="password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      )}
      {mode === 'error' && (
        <div className="bg-white p-6 rounded shadow max-w-sm w-full flex flex-col gap-4">
          <AlertTitle className="text-red-600">Error</AlertTitle>
          <AlertDescription>
            {errorMsg || 'The verification link is invalid or has expired.'}
          </AlertDescription>
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>Back to Login</Button>
        </div>
      )}
    </div>
  );
}
