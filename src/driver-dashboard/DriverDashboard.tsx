import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useState as useLocalState } from 'react';

export const DriverDashboard = () => {
  const { user, isEmailVerified, isDriverProfileComplete, updateDriverProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone_number: '',
    license_number: '',
    vehicle_number: '',
    vehicle_type: '',
    is_available: true
  });
  const [chatOpen, setChatOpen] = useLocalState(false);

  // Only allow access if user is a driver
  const isDriver = user?.user_metadata?.role === 'driver';

  useEffect(() => {
    checkProfileStatus();
    if (!user) {
      navigate('/auth');
    } else if (!isDriver) {
      navigate('/');
    }
  }, [user, isDriver, navigate]);

  const checkProfileStatus = async () => {
    const complete = await isDriverProfileComplete();
    setIsProfileComplete(complete);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await updateDriverProfile(profileData);
    if (!error) {
      checkProfileStatus();
    }
    
    setIsLoading(false);
  };


  if (!user || !isDriver) {
    return null;
  }

  if (!isEmailVerified()) {
    return (
      <Alert>
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Email Verification Required</AlertTitle>
        <AlertDescription>
          Please verify your email address to access the driver dashboard. Check your inbox for the verification link.
        </AlertDescription>
      </Alert>
    );
  }

  // Show email verification warning if email is not verified
  if (!isEmailVerified()) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please verify your email address to access the driver dashboard. 
            Check your inbox for the verification link. If you don't see it, check your spam folder.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Required</CardTitle>
            <CardDescription>
              Your email address must be verified before you can:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Complete your driver profile</li>
              <li>View and accept ride requests</li>
              <li>Manage your upcoming rides</li>
              <li>Track your earnings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show Profile tab if not verified or not complete
  const showTabs = isEmailVerified() && isProfileComplete;
  return (
    <div className="container mx-auto p-4 max-w-3xl relative">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={signOut} className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-900">Logout</Button>
      </div>
      <Tabs defaultValue={showTabs ? "overview" : "profile"}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {showTabs && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {showTabs && <TabsTrigger value="rides">Active & Upcoming Rides</TabsTrigger>}
          {showTabs && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-blue-900">Driver Profile</CardTitle>
              <CardDescription className="text-lg text-blue-700">
                Complete your profile to start accepting rides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-lg font-semibold">Full Name</Label>
                    <Input
                      id="full_name"
                      className="h-14 text-xl px-5 bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone_number" className="text-lg font-semibold">Phone Number</Label>
                    <Input
                      id="phone_number"
                      className="h-14 text-xl px-5 bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="license_number" className="text-lg font-semibold">License Number</Label>
                    <Input
                      id="license_number"
                      className="h-14 text-xl px-5 bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      value={profileData.license_number}
                      onChange={(e) => setProfileData({...profileData, license_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="vehicle_number" className="text-lg font-semibold">Vehicle Number</Label>
                    <Input
                      id="vehicle_number"
                      className="h-14 text-xl px-5 bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      value={profileData.vehicle_number}
                      onChange={(e) => setProfileData({...profileData, vehicle_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="vehicle_type" className="text-lg font-semibold">Vehicle Type</Label>
                    <Input
                      id="vehicle_type"
                      className="h-14 text-xl px-5 bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      value={profileData.vehicle_type}
                      onChange={(e) => setProfileData({...profileData, vehicle_type: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <Checkbox
                      id="is_available"
                      checked={profileData.is_available}
                      onCheckedChange={(checked) => 
                        setProfileData({...profileData, is_available: checked as boolean})}
                    />
                    <Label htmlFor="is_available" className="text-lg font-semibold">Available for Rides</Label>
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-xl font-bold bg-blue-700 hover:bg-blue-800 rounded-xl mt-6" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {showTabs && (
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Ride</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No active ride</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ride Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No pending requests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
        {showTabs && (
          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No upcoming rides scheduled</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {showTabs && (
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Today</h3>
                    <p className="text-2xl">₹0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">This Week</h3>
                    <p className="text-2xl">₹0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">This Month</h3>
                    <p className="text-2xl">₹0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* AI Chatbot Floating Button and Popup */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full shadow-2xl p-4 hover:scale-110 transition-all flex items-center justify-center"
          onClick={() => setChatOpen((v) => !v)}
          aria-label="Open AI Chatbot"
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M8.5 10.5a3.5 3.5 0 1 1 7 0v1.25c0 .414.336.75.75.75s.75-.336.75-.75V10.5a5 5 0 1 0-10 0v1.25c0 .414.336.75.75.75s.75-.336.75-.75V10.5Zm3.5 7a1.25 1.25 0 0 0 1.25-1.25h-2.5A1.25 1.25 0 0 0 12 17.5Z" fill="#2563eb"/></svg>
        </button>
        {chatOpen && (
          <div className="fixed bottom-24 right-6 w-80 max-w-full bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col overflow-hidden animate-fade-in z-50">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-lg">RailEase AI Assistant</span>
              <button className="ml-2 text-white hover:text-blue-200" onClick={() => setChatOpen(false)}>&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto" style={{ minHeight: '200px', maxHeight: '300px' }}>
              <div className="text-gray-700 text-base mb-2">Hi! I am your AI assistant. How can I help you today?</div>
              <div className="text-xs text-gray-400 mb-2">(Future: This chatbot will answer questions using your database and booking info.)</div>
            </div>
            <form className="flex border-t border-blue-100">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-base rounded-bl-2xl focus:outline-none"
                placeholder="Type your message..."
                disabled
              />
              <button type="submit" className="px-4 py-2 text-blue-700 font-bold" disabled>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};