import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

export default function DriverLogin() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
      const [showForgot, setShowForgot] = useState(false);
      const [forgotEmail, setForgotEmail] = useState('');
      const [forgotMsg, setForgotMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(form.email, form.password);
    setLoading(false);
    // Redirect to driver dashboard if role is driver
    if (result.user?.user_metadata?.role === 'driver') {
      navigate('/driver-dashboard');
    } else {
      // Optionally show an error or redirect elsewhere
      // alert('You are not registered as a driver.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Driver Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
            <div className="flex justify-end mb-2">
              <button type="button" className="text-blue-600 text-sm hover:underline" onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login as Driver'}
        </Button>
      </form>
          {showForgot && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                <h3 className="text-lg font-bold mb-2">Reset Driver Password</h3>
                <Label htmlFor="forgot-email">Email</Label>
                <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="mb-4" />
                <Button className="w-full mb-2" onClick={handleForgotPassword}>Send Reset Link</Button>
                <button className="text-sm text-blue-600 hover:underline w-full" onClick={() => setShowForgot(false)}>Cancel</button>
                {forgotMsg && <div className="mt-2 text-green-600 text-sm">{forgotMsg}</div>}
              </div>
            </div>
          )}
    </div>
  );
}

  const handleForgotPassword = async () => {
    setForgotMsg('');
    if (!forgotEmail) return;
    try {
      await resetPassword(forgotEmail);
      setForgotMsg('Password reset link sent to your email.');
    } catch {
      setForgotMsg('Error sending reset link.');
    }
  };
