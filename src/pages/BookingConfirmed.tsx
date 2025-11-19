import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle, Download, Home, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const BookingConfirmed = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const bookingData = location.state;

  useEffect(() => {
    if (bookingData && user) {
      saveBookingToDatabase();
    }
  }, [bookingData, user]);

  const saveBookingToDatabase = async () => {
    try {
      // Validate required data
      if (!bookingData.journeyDate || !bookingData.train?.id || !user?.id || !bookingData.bookingId) {
        console.error('Missing required booking data:', {
          journeyDate: bookingData.journeyDate,
          trainId: bookingData.train?.id,
          userId: user?.id,
          bookingId: bookingData.bookingId
        });
        toast({
          title: "Error",
          description: "Missing required booking information",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          train_id: bookingData.train.id,
          booking_id: bookingData.bookingId,
          passenger_name: bookingData.passenger.name,
          passenger_age: parseInt(bookingData.passenger.age),
          passenger_gender: bookingData.passenger.gender,
          journey_date: bookingData.journeyDate,
          seat_numbers: bookingData.selectedSeats,
          coach: bookingData.selectedCoach,
          class: bookingData.selectedClass || 'Sleeper',
          class_price: bookingData.classPrice || 0,
          total_amount: bookingData.totalAmount,
          status: 'confirmed'
        });

      if (error) {
        console.error('Error saving booking:', error);
        toast({
          title: "Warning",
          description: "Booking confirmed but not saved to database",
          variant: "destructive"
        });
      } else {
        console.log('Booking saved successfully');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Warning", 
        description: "Booking confirmed but not saved to database",
        variant: "destructive"
      });
    }
  };

  const downloadTicket = (booking: any) => {
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
    doc.text(booking.bookingId.toString(), 145, 25);
    
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
    doc.text(`Train: ${booking.train?.name || 'Unknown'}`, 20, 65);
    doc.text(`Train Number: ${booking.train?.number || 'N/A'}`, 110, 65);
    
    doc.text(`From: ${booking.train?.from_station?.name || 'Unknown'}`, 20, 75);
    doc.text(`To: ${booking.train?.to_station?.name || 'Unknown'}`, 110, 75);
    
    doc.text(`Departure: ${booking.train?.departure_time || 'N/A'}`, 20, 85);
    doc.text(`Arrival: ${booking.train?.arrival_time || 'N/A'}`, 110, 85);
    
    doc.text(`Journey Date: ${new Date(booking.journeyDate).toLocaleDateString('en-IN')}`, 20, 95);
    
    // Passenger & Seat Details Section
    doc.setFontSize(14);
    doc.setTextColor(34, 85, 136);
    doc.text('Passenger & Seat Details', 20, 115);
    doc.line(20, 117, 190, 117);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Passenger Name: ${booking.passenger.name}`, 20, 130);
    doc.text(`Age: ${booking.passenger.age}`, 110, 130);
    
    doc.text(`Gender: ${booking.passenger.gender}`, 20, 140);
    doc.text(`Class: ${booking.selectedClass}`, 110, 140);
    
    doc.text(`Coach: ${booking.selectedCoach}`, 20, 150);
    doc.text(`Seat(s): ${booking.selectedSeats.join(', ')}`, 110, 150);
    
    // Payment Details Section
    doc.setFillColor(250, 250, 250);
    doc.rect(15, 165, 180, 25, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(34, 85, 136);
    doc.text('Payment Details', 20, 180);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: ₹${booking.totalAmount}`, 20, 185);
    doc.text(`Payment Method: ${booking.paymentMethod}`, 110, 185);
    
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
    
    doc.save(`RailEase-Ticket-${booking.bookingId}.pdf`);
    
    toast({
      title: "Success",
      description: "Professional ticket downloaded successfully"
    });
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground mb-4">No booking data found</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your train ticket has been booked successfully
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Badge className="bg-green-500 hover:bg-green-600">
                {bookingData.bookingId}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Train Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{bookingData.train.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{bookingData.train.number}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{bookingData.journeyDate}</span>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="font-semibold">{bookingData.train.departure_time}</div>
                <div className="text-sm text-muted-foreground">{bookingData.train.from_station?.name}</div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{bookingData.train.duration}</span>
              </div>
              <div className="text-center">
                <div className="font-semibold">{bookingData.train.arrival_time}</div>
                <div className="text-sm text-muted-foreground">{bookingData.train.to_station?.name}</div>
              </div>
            </div>

            {/* Passenger and Seat Details */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passenger:</span>
                <span className="font-medium">{bookingData.passenger.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age/Gender:</span>
                <span>{bookingData.passenger.age} / {bookingData.passenger.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class:</span>
                <span>{bookingData.selectedClass || 'Sleeper'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coach:</span>
                <span>{bookingData.selectedCoach}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats:</span>
                <div className="flex gap-2">
                  {bookingData.selectedSeats.map((seat: string) => (
                    <Badge key={seat} variant="secondary">{seat}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{bookingData.paymentMethod}</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Paid:</span>
                <span className="text-green-600">₹{bookingData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="flex items-center gap-2 hover-lift" onClick={() => downloadTicket(bookingData)}>
            <Download className="h-4 w-4" />
            Download Ticket
          </Button>
          <Button asChild className="hover-lift">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Important Information</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Please carry a valid ID proof while traveling</li>
              <li>• Arrive at the station at least 30 minutes before departure</li>
              <li>• Cancellation charges apply as per railway rules</li>
              <li>• Keep your booking ID safe for any future reference</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmed;