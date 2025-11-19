import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ClassSpecificSeatLayouts from "./ClassSpecificSeatLayouts";

interface Seat {
  id: string;
  seat_number: string;
  coach: string;
  class: string;
  is_available: boolean;
}

interface IndianRailSeatMapProps {
  trainId: string;
  selectedCoach: string;
  onSeatSelect: (seats: string[]) => void;
  selectedSeats: string[];
  selectedClass: string;
  onClassSelect: (classType: string) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onCoachSelect?: (coach: string) => void;
}

const IndianRailSeatMap = ({ 
  trainId, 
  selectedCoach, 
  onSeatSelect, 
  selectedSeats, 
  selectedClass, 
  onClassSelect,
  selectedDate = new Date(),
  onDateSelect,
  onCoachSelect
}: IndianRailSeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateAvailability, setDateAvailability] = useState<Record<string, number>>({});
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<string[]>([]);

  useEffect(() => {
    fetchSeats();
    fetchDateAvailability();
    generateAvailableCoaches();
  }, [trainId, selectedCoach, selectedClass, selectedDate]);

  const fetchSeats = async () => {
    setLoading(true);
    
    // Get class code for filtering
    const classCode = getClassCode(selectedClass);
    
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('train_id', trainId)
      .eq('coach', selectedCoach)
      .eq('class', classCode)
      .order('seat_number');
    
    if (error) {
      console.error('Error fetching seats:', error);
      // If no seats found for the specific class, generate dummy seats for demo
      const dummySeats = generateDummySeats(selectedClass, selectedCoach);
      setSeats(dummySeats);
    } else {
      const fetchedSeats = data || [];
      if (fetchedSeats.length === 0) {
        // Generate dummy seats if none exist in database
        const dummySeats = generateDummySeats(selectedClass, selectedCoach);
        setSeats(dummySeats);
      } else {
        setSeats(fetchedSeats);
      }
    }
    setLoading(false);
  };

  const fetchDateAvailability = async () => {
    // Generate next 7 days for demonstration
    const dates = [];
    const availability: Record<string, number> = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
      
      // Simulate different availability (in real app, this would come from bookings table)
      const dateStr = format(date, 'yyyy-MM-dd');
      availability[dateStr] = Math.floor(Math.random() * 50) + 20; // 20-70 available seats
    }
    
    setAvailableDates(dates);
    setDateAvailability(availability);
  };

  const generateAvailableCoaches = () => {
    const classCode = getClassCode(selectedClass);
    let coachPrefix = '';
    let coachCount = 6;
    
    switch (classCode) {
      case '1A':
        coachPrefix = 'H';
        coachCount = 2;
        break;
      case '2A':
        coachPrefix = 'A';
        coachCount = 4;
        break;
      case '3A':
        coachPrefix = 'B';
        coachCount = 6;
        break;
      case '3E':
        coachPrefix = 'E';
        coachCount = 8;
        break;
      case 'CC':
        coachPrefix = 'C';
        coachCount = 4;
        break;
      case 'EC':
        coachPrefix = 'EC';
        coachCount = 2;
        break;
      case '2S':
        coachPrefix = 'D';
        coachCount = 8;
        break;
      default: // SL
        coachPrefix = 'S';
        coachCount = 12;
    }
    
    const coaches = [];
    for (let i = 1; i <= coachCount; i++) {
      coaches.push(`${coachPrefix}${i}`);
    }
    setAvailableCoaches(coaches);
  };

  const getClassCode = (className: string) => {
    const classMap: Record<string, string> = {
      'AC First Class': '1A',
      'AC 1 Tier': '1A',
      'AC Two-Tier': '2A', 
      'AC 2 Tier': '2A',
      'AC Three-Tier': '3A',
      'AC 3 Tier': '3A',
      'AC Three-Tier Economy': '3E',
      'AC 3 Tier Economy': '3E',
      'Sleeper': 'SL',
      'Chair Car': 'CC',
      'Executive Chair Car': 'EC',
      'Second Sitting': '2S'
    };
    return classMap[className] || 'SL';
  };

  const generateDummySeats = (classType: string, coach: string): Seat[] => {
    const seats: Seat[] = [];
    const classCode = getClassCode(classType);
    
    // Generate different seat layouts based on class
    let seatCount = 72; // Default for sleeper
    let seatPattern = '';
    
    switch (classCode) {
      case '1A':
        seatCount = 24;
        seatPattern = 'A';
        break;
      case '2A':
        seatCount = 48;
        seatPattern = 'A';
        break;
      case '3A':
        seatCount = 64;
        seatPattern = 'A';
        break;
      case '3E':
        seatCount = 80;
        seatPattern = 'E';
        break;
      case 'CC':
        seatCount = 78;
        seatPattern = 'C';
        break;
      case 'EC':
        seatCount = 56;
        seatPattern = 'E';
        break;
      case '2S':
        seatCount = 100;
        seatPattern = 'S';
        break;
      default: // SL
        seatCount = 72;
        seatPattern = 'S';
    }
    
    for (let i = 1; i <= seatCount; i++) {
      // Simulate some booked seats (random)
      const isAvailable = Math.random() > 0.3; // 70% available
      
      seats.push({
        id: `dummy-${coach}-${i}`,
        seat_number: `${coach}-${i}${seatPattern}`,
        coach: coach,
        class: classCode,
        is_available: isAvailable
      });
    }
    
    return seats;
  };

  const handleSeatClick = (seatNumber: string) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (!seat || !seat.is_available) return;

    let newSelectedSeats;
    if (selectedSeats.includes(seatNumber)) {
      newSelectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
      newSelectedSeats = [...selectedSeats, seatNumber];
    }
    
    onSeatSelect(newSelectedSeats);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.includes(seat.seat_number)) {
      return 'selected';
    }
    return seat.is_available ? 'available' : 'booked';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-available text-available-foreground hover:bg-available/80 cursor-pointer border-available';
      case 'booked':
        return 'bg-booked text-booked-foreground cursor-not-allowed border-booked';
      case 'selected':
        return 'bg-selected text-selected-foreground hover:bg-selected/80 cursor-pointer border-selected';
      default:
        return 'bg-muted border-muted';
    }
  };

  const getBerthIcon = (seatNumber: string) => {
    if (seatNumber.includes('LB')) return '🛏️'; // Lower Berth
    if (seatNumber.includes('MB')) return '🛏️'; // Middle Berth  
    if (seatNumber.includes('UB')) return '🛏️'; // Upper Berth
    if (seatNumber.includes('SL')) return '💺'; // Side Lower
    if (seatNumber.includes('SU')) return '💺'; // Side Upper
    return '💺';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading seat map...</div>
        </CardContent>
      </Card>
    );
  }

  // Group seats into compartments (8 seats per compartment for sleeper)
  const groupedSeats = [];
  for (let i = 0; i < seats.length; i += 8) {
    groupedSeats.push(seats.slice(i, i + 8));
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Journey Date</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your travel date and see seat availability
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {availableDates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const availableSeats = dateAvailability[dateStr] || 0;
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateStr;
              
              return (
                <Button
                  key={dateStr}
                  variant={isSelected ? "default" : "outline"}
                  className="flex flex-col h-auto p-4"
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="text-sm font-medium">
                    {format(date, 'MMM dd')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, 'EEE')}
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {availableSeats} seats
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seat Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Coach {selectedCoach} - {selectedClass || 'Sleeper'}
            <Badge variant="outline">{seats.filter(s => s.is_available).length} available</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your preferred seats. Click on available seats to book.
          </p>
          
          {/* Class and Coach Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Class</Label>
              <Select value={selectedClass} onValueChange={onClassSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sleeper">Sleeper (SL)</SelectItem>
                  <SelectItem value="AC 3 Tier">AC 3 Tier (3A)</SelectItem>
                  <SelectItem value="AC 3 Tier Economy">AC 3 Tier Economy (3E)</SelectItem>
                  <SelectItem value="AC 2 Tier">AC 2 Tier (2A)</SelectItem>
                  <SelectItem value="AC 1 Tier">AC 1 Tier (1A)</SelectItem>
                  <SelectItem value="Chair Car">Chair Car (CC)</SelectItem>
                  <SelectItem value="Executive Chair Car">Executive Chair Car (EC)</SelectItem>
                  <SelectItem value="Second Sitting">Second Sitting (2S)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Coach</Label>
              <Select value={selectedCoach} onValueChange={(value) => onCoachSelect?.(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {availableCoaches.map((coach) => (
                    <SelectItem key={coach} value={coach}>
                      Coach {coach}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Loading seat map...</div>
            </div>
          ) : selectedSeats.length > 0 ? (
            // Show selected seats summary when seats are selected
            <div className="p-6 bg-selected/10 rounded-lg border border-selected/20">
              <h4 className="font-medium mb-4 text-center">Seats Selected Successfully!</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">Coach {selectedCoach} - {selectedClass}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Journey Date: {format(selectedDate, 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedSeats.map(seatNumber => (
                    <Badge key={seatNumber} variant="secondary" className="bg-selected/20 text-selected-foreground">
                      {getBerthIcon(seatNumber)} {seatNumber}
                    </Badge>
                  ))}
                </div>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSeatSelect([])}
                  >
                    Change Seats
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-available rounded border"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-booked rounded border"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-selected rounded border"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛏️ Berth</span>
                  <span className="text-sm">💺 Side Seat</span>
                </div>
              </div>

              {/* Class-specific seat layouts */}
              <ClassSpecificSeatLayouts
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
                getSeatStatus={getSeatStatus}
                getSeatColor={getSeatColor}
                selectedClass={selectedClass}
              />

              {/* Berth Type Legend - only for sleeper and AC classes */}
              {(selectedClass === 'Sleeper' || selectedClass.includes('AC')) && selectedClass !== 'Second Sitting' && (
                <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2">Berth Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div><strong>LB:</strong> Lower Berth</div>
                    <div><strong>MB:</strong> Middle Berth</div>
                    <div><strong>UB:</strong> Upper Berth</div>
                    <div><strong>SL:</strong> Side Lower</div>
                    <div><strong>SU:</strong> Side Upper</div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndianRailSeatMap;