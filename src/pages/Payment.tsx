import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const bookingData = location.state;
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
    paymentMethod: "card"
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground mb-4">No booking data found</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate required booking fields
    const requiredFields = [
      bookingData.train?.id,
      bookingData.passenger?.name,
      bookingData.passenger?.age,
      bookingData.passenger?.gender,
      bookingData.selectedSeats,
      bookingData.selectedCoach,
      bookingData.selectedClass,
      bookingData.classPrice,
      bookingData.totalAmount
    ];
    const missing = requiredFields.some(f => f === undefined || f === null || f === '' || (Array.isArray(f) && f.length === 0));
    if (missing) {
      console.error('Missing booking data:', {
        train: bookingData.train?.id,
        passenger: bookingData.passenger,
        seats: bookingData.selectedSeats,
        coach: bookingData.selectedCoach,
        class: bookingData.selectedClass,
        classPrice: bookingData.classPrice,
        totalAmount: bookingData.totalAmount
      });
      toast({
        title: "Error",
        description: "Missing required booking information. Please fill all details before proceeding.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    // Generate numeric PNR
    const bookingId = Math.floor(Math.random() * 9000000000) + 1000000000; // 10-digit number

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Your booking has been confirmed. PNR: ${bookingId}`,
      });

      navigate('/booking-confirmed', {
        state: {
          ...bookingData,
          bookingId: bookingId.toString(), // Ensure it's a string
          paymentMethod: paymentData.paymentMethod
        }
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Train:</span>
                  <span className="font-medium">{bookingData.train.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number:</span>
                  <Badge variant="outline">{bookingData.train.number}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span>{bookingData.train.from_station?.name || 'Unknown'} → {bookingData.train.to_station?.name || 'Unknown'}</span>
                </div>
                {bookingData.journeyDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{bookingData.journeyDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passenger:</span>
                  <span>{bookingData.passenger.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats:</span>
                  <span>{bookingData.selectedSeats.join(', ')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This is a simulation - no real payment will be processed
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={paymentData.paymentMethod} 
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentData.paymentMethod === "card" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName">Cardholder Name</Label>
                      <Input
                        id="cardHolderName"
                        placeholder="John Doe"
                        value={paymentData.cardHolderName}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing Payment..." : `Pay ₹${bookingData.totalAmount.toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;