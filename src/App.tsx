import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import AuthCallback from "./pages/AuthCallback";
import DriverLogin from "./pages/DriverLogin";
import PassengerLogin from "./pages/PassengerLogin";
import BookingConfirmed from "./pages/BookingConfirmed";
import MyBookings from "./pages/MyBookings";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import PasswordResetRequest from "./pages/PasswordResetRequest";

import DriverDashboard from "./driver-dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-confirmed" element={<BookingConfirmed />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/password-reset" element={<PasswordResetRequest />} />
            <Route path="/driver-login" element={<DriverLogin />} />
            <Route path="/passenger-login" element={<PassengerLogin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
