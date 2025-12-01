import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'reset' | 'error' | 'verifying'>('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment
        const hash = window.location.hash;
        
        // Check for error parameters
        const search = window.location.search;
        const urlParams = new URLSearchParams(search.replace(/^\?/, ''));
        const errorCode = urlParams.get('error_code');
        const errorDescription = urlParams.get('error_description');
        
        if ((errorCode === 'otp_expired' || errorCode === 'access_denied') && errorDescription) {
          setMode('error');
          setErrorMsg(decodeURIComponent(errorDescription));
          return;
        }

        // Check for type parameter in hash or search
        const typeFromHash = new URLSearchParams(hash.replace(/^#/, '')).get('type');
        const typeFromSearch = urlParams.get('type');
        const authType = typeFromHash || typeFromSearch;

        if (authType === 'recovery' || authType === 'magiclink' || hash.includes('type=recovery') || hash.includes('type=magiclink')) {
          // This is a password reset or magic link
          setMode('reset');
        } else {
          // This should be an email confirmation
          // Try to get the session which means confirmation was successful
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            // Session not available, might be email confirmation
            // Supabase will auto-verify if the link is valid
            toast({
              title: 'Success',
              description: 'Email verified! You can now log in.',
            });
            setTimeout(() => navigate('/auth'), 1500);
          } else {
            // Session is available, user is logged in
            toast({
              title: 'Success',
              description: 'Email verified! Redirecting to dashboard...',
            });
            setTimeout(() => navigate('/driver-dashboard'), 1500);
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMode('error');
        setErrorMsg('An error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
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
            placeholder="Enter new password"
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
