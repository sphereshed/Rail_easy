import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Train, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isDriver: false
  });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role;
      if (role === 'driver') {
        navigate('/driver-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, user } = await signIn(loginData.email, loginData.password);
    if (!error && user) {
      // Check user role and redirect accordingly
      navigate(user.user_metadata?.role === 'driver' ? '/driver-dashboard' : '/');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotMsg("");
    try {
      await resetPassword(forgotEmail);
      setForgotMsg("Password reset link sent to your email.");
    } catch (err) {
      setForgotMsg("Failed to send reset link. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trim and validate fields
    const email = signupData.email.trim();
    const password = signupData.password.trim();
    const confirmPassword = signupData.confirmPassword.trim();
    const fullName = signupData.fullName?.trim() || "";
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    try {
      const role = signupData.isDriver ? "driver" : "user";
      const { error, user } = await signUp(email, password, fullName, role);
      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      if (user) {
        setSignupData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          isDriver: false
        });
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
              <Train className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary">RailEase</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to RailEase</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Driver Dashboard Button */}
            <div className="mb-4 flex justify-center">
              <Link to="/driver-dashboard">
                <Button variant="outline" className="rounded-full px-6 py-2 text-blue-700 border-blue-600 hover:bg-blue-50 font-semibold shadow">
                  Driver Dashboard
                </Button>
              </Link>
            </div>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={e => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end mb-2">
                    <button type="button" className="text-blue-600 text-sm hover:underline" onClick={() => setShowForgot(true)}>
                      Forgot Password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full">Sign In</Button>
                </form>
                {showForgot && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                      <h3 className="text-lg font-bold mb-2">Reset Password</h3>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="mb-4" />
                      <Button className="w-full mb-2" onClick={handleForgotPassword}>Send Reset Link</Button>
                      <button className="text-sm text-blue-600 hover:underline w-full" onClick={() => setShowForgot(false)}>Cancel</button>
                      {forgotMsg && <div className="mt-2 text-green-600 text-sm">{forgotMsg}</div>}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={e => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={e => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signupData.password}
                      onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={e => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex items-center mb-2">
                    <input
                      id="signup-driver"
                      type="checkbox"
                      checked={signupData.isDriver}
                      onChange={e => setSignupData(prev => ({ ...prev, isDriver: e.target.checked }))}
                      className="mr-2"
                    />
                    <Label htmlFor="signup-driver" className="text-sm">Sign up as Driver</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;