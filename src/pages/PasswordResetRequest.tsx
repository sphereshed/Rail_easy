import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

export default function PasswordResetRequest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSent(true);
      toast({
        title: 'Reset Link Sent',
        description: 'Check your email for the password reset link.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSendReset} className="bg-white p-6 rounded shadow max-w-sm w-full flex flex-col gap-4">
        <AlertTitle>Forgot Password?</AlertTitle>
        <AlertDescription>
          Enter your email address and we'll send you a password reset link.
        </AlertDescription>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={sent}
        />
        <Button type="submit" className="w-full" disabled={loading || sent}>
          {loading ? 'Sending...' : sent ? 'Link Sent!' : 'Send Reset Link'}
        </Button>
        {sent && (
          <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>Back to Login</Button>
        )}
      </form>
    </div>
  );
}