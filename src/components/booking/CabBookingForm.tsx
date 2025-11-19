import { useState } from "react";
import { MapPin, Clock, Users, Briefcase, Car } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface CabBookingData {
  pickupAddress: string;
  dropAddress: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  cabType: string;
  specialInstructions: string;
}

interface CabBookingFormProps {
  data: CabBookingData;
  onChange: (data: CabBookingData) => void;
  trainDepartureTime?: string;
  trainArrivalTime?: string;
  fromStation?: string;
  toStation?: string;
}

const CabBookingForm = ({ 
  data, 
  onChange, 
  trainDepartureTime, 
  trainArrivalTime,
  fromStation,
  toStation 
}: CabBookingFormProps) => {
  const [pickupType, setPickupType] = useState<"before" | "after">("before");

  const cabTypes = [
    { value: "sedan", label: "Sedan", price: 500, capacity: 4 },
    { value: "suv", label: "SUV", price: 800, capacity: 6 },
    { value: "luxury", label: "Luxury Sedan", price: 1200, capacity: 4 },
    { value: "hatchback", label: "Hatchback", price: 350, capacity: 4 },
  ];

  const handleChange = (field: keyof CabBookingData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const getSuggestedAddress = () => {
    if (pickupType === "before") {
      return `Pickup from home to ${fromStation || 'departure station'}`;
    } else {
      return `Pickup from ${toStation || 'arrival station'} to destination`;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          Cab Booking Details
        </CardTitle>
        <CardDescription>
          Book a cab for your journey - Before or after your train ride
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pickup Type Selection */}
        <div className="space-y-3">
          <Label>When do you need the cab?</Label>
          <RadioGroup value={pickupType} onValueChange={(value) => setPickupType(value as "before" | "after")}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="before" id="before" />
              <Label htmlFor="before" className="cursor-pointer flex-1">
                <div className="font-medium">Before Train Journey</div>
                <div className="text-sm text-muted-foreground">
                  Pickup from your location to {fromStation || 'railway station'}
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="after" id="after" />
              <Label htmlFor="after" className="cursor-pointer flex-1">
                <div className="font-medium">After Train Journey</div>
                <div className="text-sm text-muted-foreground">
                  Pickup from {toStation || 'railway station'} to your destination
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickupAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Address
            </Label>
            <Textarea
              id="pickupAddress"
              placeholder={pickupType === "before" ? "Enter your home/hotel address" : fromStation || "Railway station"}
              value={data.pickupAddress}
              onChange={(e) => handleChange("pickupAddress", e.target.value)}
              className="min-h-[80px]"
              required
            />
            {pickupType === "after" && (
              <p className="text-xs text-muted-foreground">
                Default: {toStation || 'Arrival railway station'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dropAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Drop Address
            </Label>
            <Textarea
              id="dropAddress"
              placeholder={pickupType === "before" ? fromStation || "Railway station" : "Enter your final destination"}
              value={data.dropAddress}
              onChange={(e) => handleChange("dropAddress", e.target.value)}
              className="min-h-[80px]"
              required
            />
            {pickupType === "before" && (
              <p className="text-xs text-muted-foreground">
                Default: {fromStation || 'Departure railway station'}
              </p>
            )}
          </div>
        </div>

        {/* Pickup Time */}
        <div className="space-y-2">
          <Label htmlFor="pickupTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pickup Time
          </Label>
          <Input
            id="pickupTime"
            type="datetime-local"
            value={data.pickupTime}
            onChange={(e) => handleChange("pickupTime", e.target.value)}
            required
          />
          {trainDepartureTime && pickupType === "before" && (
            <p className="text-xs text-muted-foreground">
              Suggested: Book at least 1-2 hours before train departure ({trainDepartureTime})
            </p>
          )}
          {trainArrivalTime && pickupType === "after" && (
            <p className="text-xs text-muted-foreground">
              Suggested: Book around train arrival time ({trainArrivalTime})
            </p>
          )}
        </div>

        {/* Passengers and Luggage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Passengers
            </Label>
            <Select 
              value={data.passengers.toString()} 
              onValueChange={(value) => handleChange("passengers", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select passengers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="luggage" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Number of Bags
            </Label>
            <Select 
              value={data.luggage.toString()} 
              onValueChange={(value) => handleChange("luggage", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bags" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Bag' : 'Bags'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cab Type Selection */}
        <div className="space-y-3">
          <Label>Select Cab Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cabTypes.map((cab) => (
              <div
                key={cab.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.cabType === cab.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleChange("cabType", cab.value)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{cab.label}</div>
                  <div className="text-primary font-bold">₹{cab.price}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Up to {cab.capacity} passengers
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="space-y-2">
          <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
          <Textarea
            id="specialInstructions"
            placeholder="Any special requirements or instructions for the driver..."
            value={data.specialInstructions}
            onChange={(e) => handleChange("specialInstructions", e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CabBookingForm;
