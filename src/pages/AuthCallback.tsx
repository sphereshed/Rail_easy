import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'reset' | 'error'>('reset');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Only handle password reset and error states
    const hash = window.location.hash;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search.replace(/^\?/, ''));
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');
    if ((errorCode === 'otp_expired' || errorCode === 'access_denied') && errorDescription) {
      setMode('error');
      setErrorMsg(decodeURIComponent(errorDescription));
    } else {
      setMode('reset');
    }
  }, [navigate]);

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
      navigate('/');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center">
      {mode === 'reset' && (
        <form onSubmit={handlePasswordReset} className="bg-white p-6 rounded shadow max-w-sm w-full flex flex-col gap-4">
          <AlertTitle>Set New Password</AlertTitle>
          <AlertDescription>
            Enter your new password below to reset your account password.
          </AlertDescription>
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      )}
      {mode === 'error' && (
        <div className="bg-white p-6 rounded shadow max-w-sm w-full flex flex-col gap-4">
          <AlertTitle>Password Reset Link Invalid or Expired</AlertTitle>
          <AlertDescription>
            {errorMsg || 'The password reset link is invalid or has expired.'}
          </AlertDescription>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/password-reset')}>Request New Reset Link</Button>
        </div>
      )}
    </div>
  );
}
