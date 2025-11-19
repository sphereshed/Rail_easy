import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Train, Calendar, MapPin, Users, Download, ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

interface Booking {
  id: string;
  booking_id: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  journey_date: string;
  seat_numbers: string[];
  coach: string;
  class: string;
  total_amount: number;
  status: string;
  created_at: string;
  trains: {
    name: string;
    number: string;
    departure_time: string;
    arrival_time: string;
    stations_from: { name: string; code: string } | null;
    stations_to: { name: string; code: string } | null;
  } | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trains (
            name,
            number,
            departure_time,
            arrival_time,
            stations_from:from_station_id (name, code),
            stations_to:to_station_id (name, code)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Use type assertion to handle the Supabase return type
      const rawBookings = data as any[] || [];
      
      // Filter out bookings with invalid train data
      const validBookings = rawBookings.filter((booking: any) => {
        return booking.trains && 
               booking.trains.stations_from && 
               booking.trains.stations_to &&
               typeof booking.trains.stations_from === 'object' &&
               typeof booking.trains.stations_to === 'object' &&
               'name' in booking.trains.stations_from &&
               'name' in booking.trains.stations_to;
      });
      
      setBookings(validBookings as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (booking: Booking) => {
    const doc = new jsPDF();
    
    // Professional header with background
    doc.setFillColor(34, 85, 136);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('RailEase', 20, 20);
    doc.setFontSize(14);
    doc.text('Electronic Railway Ticket', 20, 30);
    
    // PNR Box
    doc.setFillColor(240, 240, 240);
    doc.rect(140, 5, 60, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('PNR Number', 145, 15);
    doc.setFontSize(16);
    doc.setTextColor(34, 85, 136);
    doc.text(booking.booking_id.toString(), 145, 25);
    
    // Journey Details Section
    doc.setFontSize(14);
    doc.setTextColor(34, 85, 136);
    doc.text('Journey Details', 20, 50);
    
    // Draw line under section
    doc.setDrawColor(34, 85, 136);
    doc.line(20, 52, 190, 52);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Two column layout for journey details
    doc.text(`Train: ${booking.trains?.name || 'Unknown'}`, 20, 65);
    doc.text(`Train Number: ${booking.trains?.number || 'N/A'}`, 110, 65);
    
    doc.text(`From: ${booking.trains?.stations_from?.name || 'Unknown'}`, 20, 75);
    doc.text(`To: ${booking.trains?.stations_to?.name || 'Unknown'}`, 110, 75);
    
    doc.text(`Departure: ${booking.trains?.departure_time || 'N/A'}`, 20, 85);
    doc.text(`Arrival: ${booking.trains?.arrival_time || 'N/A'}`, 110, 85);
    
    doc.text(`Journey Date: ${new Date(booking.journey_date).toLocaleDateString('en-IN')}`, 20, 95);
    
    // Passenger & Seat Details Section
    doc.setFontSize(14);
    doc.setTextColor(34, 85, 136);
    doc.text('Passenger & Seat Details', 20, 115);
    doc.line(20, 117, 190, 117);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Passenger Name: ${booking.passenger_name}`, 20, 130);
    doc.text(`Age: ${booking.passenger_age}`, 110, 130);
    
    doc.text(`Gender: ${booking.passenger_gender}`, 20, 140);
    doc.text(`Class: ${booking.class}`, 110, 140);
    
    doc.text(`Coach: ${booking.coach}`, 20, 150);
    doc.text(`Seat(s): ${booking.seat_numbers.join(', ')}`, 110, 150);
    
    // Payment Details Section
    doc.setFillColor(250, 250, 250);
    doc.rect(15, 165, 180, 25, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(34, 85, 136);
    doc.text('Payment Details', 20, 180);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: ₹${booking.total_amount}`, 20, 185);
    doc.text(`Status: ${booking.status.toUpperCase()}`, 110, 185);
    
    // Important Instructions
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 127);
    doc.text('Important Instructions:', 20, 210);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('• Please carry a valid photo ID proof during your journey', 20, 220);
    doc.text('• Report at the station at least 30 minutes before departure', 20, 228);
    doc.text('• This is a computer-generated ticket and does not require signature', 20, 236);
    doc.text('• For any queries, contact RailEase customer support', 20, 244);
    
    // Footer
    doc.setFillColor(34, 85, 136);
    doc.rect(0, 270, 210, 27, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by RailEase - Your Trusted Railway Booking Partner', 20, 285);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, 290);
    
    doc.save(`RailEase-Ticket-${booking.booking_id}.pdf`);
    
    toast({
      title: "Success",
      description: "Professional ticket downloaded successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your train reservations</p>
        </div>

        {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Train className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">You haven't made any train reservations yet.</p>
                <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Book Your First Train
                </Button>
              </CardContent>
            </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <Card key={booking.id} className="overflow-hidden hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Train className="h-5 w-5 text-primary" />
                      {booking.trains?.name || 'Unknown Train'} - {booking.trains?.number || 'N/A'}
                    </CardTitle>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Booking ID: {booking.booking_id}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Route Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        Route
                      </div>
                      <div className="text-sm">
                        <div>{booking.trains?.stations_from?.name || 'Unknown'}</div>
                        <div className="text-muted-foreground">↓</div>
                        <div>{booking.trains?.stations_to?.name || 'Unknown'}</div>
                      </div>
                    </div>

                    {/* Journey Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        Journey
                      </div>
                      <div className="text-sm">
                        <div>{new Date(booking.journey_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {booking.trains?.departure_time || 'N/A'} - {booking.trains?.arrival_time || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Passenger Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-primary" />
                        Passenger
                      </div>
                      <div className="text-sm">
                        <div>{booking.passenger_name}</div>
                        <div className="text-muted-foreground">
                          {booking.passenger_age}yr, {booking.passenger_gender}
                        </div>
                      </div>
                    </div>

                    {/* Seat Details */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Seat Details</div>
                      <div className="text-sm">
                        <div>Coach {booking.coach} - {booking.class}</div>
                        <div className="text-muted-foreground">
                          Seats: {booking.seat_numbers.join(', ')}
                        </div>
                        <div className="font-medium text-primary">₹{booking.total_amount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={() => downloadTicket(booking)}
                      variant="outline" 
                      className="flex items-center gap-2 hover-lift"
                    >
                      <Download className="h-4 w-4" />
                      Download Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;