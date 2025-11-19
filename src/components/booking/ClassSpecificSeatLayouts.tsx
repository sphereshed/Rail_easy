import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Seat {
  id: string;
  seat_number: string;
  coach: string;
  class: string;
  is_available: boolean;
}

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatClick: (seatNumber: string) => void;
  getSeatStatus: (seat: Seat) => string;
  getSeatColor: (status: string) => string;
  selectedClass: string;
}

const ClassSpecificSeatLayouts = ({ 
  seats, 
  selectedSeats, 
  onSeatClick, 
  getSeatStatus, 
  getSeatColor, 
  selectedClass 
}: SeatLayoutProps) => {

  // AC First Class (1A) - Lockable cabins with 2 berths each
  const renderFirstClass = () => {
    const cabins = [];
    for (let i = 0; i < seats.length; i += 2) {
      const cabinSeats = seats.slice(i, i + 2);
      cabins.push(
        <div key={i} className="border-2 border-primary/30 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
          <h4 className="text-sm font-medium mb-3 text-center bg-yellow-100 rounded px-2 py-1">
            🔒 Cabin {Math.floor(i / 2) + 1}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {cabinSeats.map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="sm"
                className={`h-16 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                onClick={() => onSeatClick(seat.seat_number)}
                disabled={!seat.is_available}
              >
                <div className="flex flex-col items-center">
                  <span>🛏️</span>
                  <span className="text-xs">{seat.seat_number}</span>
                  <span className="text-xs text-muted-foreground">
                    {seat.seat_number.includes('L') ? 'Lower' : 'Upper'}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      );
    }
    return cabins;
  };

  // AC Two-Tier (2A) - 6 berths with curtains
  const renderTwoTier = () => {
    const compartments = [];
    for (let i = 0; i < seats.length; i += 6) {
      const compartmentSeats = seats.slice(i, i + 6);
      compartments.push(
        <div key={i} className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h4 className="text-sm font-medium mb-3 text-center bg-blue-100 rounded px-2 py-1">
            🏔️ AC 2-Tier Compartment {Math.floor(i / 6) + 1}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Side berths (2 berths) */}
            <div className="space-y-1">
              <div className="text-xs text-center text-muted-foreground mb-1">Side Berths</div>
              {compartmentSeats.slice(0, 2).map((seat) => (
                <Button
                  key={seat.id}
                  variant="outline"
                  size="sm"
                  className={`h-12 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                  onClick={() => onSeatClick(seat.seat_number)}
                  disabled={!seat.is_available}
                >
                  <div className="flex flex-col items-center">
                    <span>🛏️</span>
                    <span className="text-xs">{seat.seat_number}</span>
                  </div>
                </Button>
              ))}
            </div>
            {/* Main berths (4 berths) */}
            <div className="grid grid-cols-2 gap-1">
              <div className="space-y-1">
                <div className="text-xs text-center text-muted-foreground mb-1">Lower/Upper</div>
                {compartmentSeats.slice(2, 4).map((seat) => (
                  <Button
                    key={seat.id}
                    variant="outline"
                    size="sm"
                    className={`h-12 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                    onClick={() => onSeatClick(seat.seat_number)}
                    disabled={!seat.is_available}
                  >
                    <div className="flex flex-col items-center">
                      <span>🛏️</span>
                      <span className="text-xs">{seat.seat_number}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-center text-muted-foreground mb-1">Lower/Upper</div>
                {compartmentSeats.slice(4, 6).map((seat) => (
                  <Button
                    key={seat.id}
                    variant="outline"
                    size="sm"
                    className={`h-12 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                    onClick={() => onSeatClick(seat.seat_number)}
                    disabled={!seat.is_available}
                  >
                    <div className="flex flex-col items-center">
                      <span>🛏️</span>
                      <span className="text-xs">{seat.seat_number}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return compartments;
  };

  // AC Three-Tier (3A) & Sleeper (SL) - 8 berths in open layout
  const renderThreeTier = () => {
    const compartments = [];
    for (let i = 0; i < seats.length; i += 8) {
      const compartmentSeats = seats.slice(i, i + 8);
      const isAC = selectedClass === 'AC 3 Tier';
      compartments.push(
        <div key={i} className={`border-2 rounded-lg p-4 ${isAC ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50'}`}>
          <h4 className={`text-sm font-medium mb-3 text-center rounded px-2 py-1 ${isAC ? 'bg-green-100' : 'bg-orange-100'}`}>
            {isAC ? '❄️ AC 3-Tier' : '🌡️ Sleeper'} Compartment {Math.floor(i / 8) + 1}
          </h4>
          <div className="grid grid-cols-8 gap-2">
            {/* Main berth area (6 berths in 2 columns) */}
            <div className="col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-center text-muted-foreground mb-1">LB/MB/UB</div>
                {compartmentSeats.slice(0, 3).map((seat) => (
                  <Button
                    key={seat.id}
                    variant="outline"
                    size="sm"
                    className={`h-12 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                    onClick={() => onSeatClick(seat.seat_number)}
                    disabled={!seat.is_available}
                  >
                    <div className="flex flex-col items-center">
                      <span>🛏️</span>
                      <span className="text-xs">{seat.seat_number}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-center text-muted-foreground mb-1">LB/MB/UB</div>
                {compartmentSeats.slice(3, 6).map((seat) => (
                  <Button
                    key={seat.id}
                    variant="outline"
                    size="sm"
                    className={`h-12 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                    onClick={() => onSeatClick(seat.seat_number)}
                    disabled={!seat.is_available}
                  >
                    <div className="flex flex-col items-center">
                      <span>🛏️</span>
                      <span className="text-xs">{seat.seat_number}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            {/* Side berths (2 berths) */}
            <div className="col-span-2 space-y-2">
              <div className="text-xs text-center text-muted-foreground mb-1">Side</div>
              {compartmentSeats.slice(6, 8).map((seat) => (
                <Button
                  key={seat.id}
                  variant="outline"
                  size="sm"
                  className={`h-16 w-full text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                  onClick={() => onSeatClick(seat.seat_number)}
                  disabled={!seat.is_available}
                >
                  <div className="flex flex-col items-center">
                    <span>🛏️</span>
                    <span className="text-xs">{seat.seat_number}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return compartments;
  };

  // Chair Car (CC) - 3x2 seating
  const renderChairCar = () => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 5) {
      const rowSeats = seats.slice(i, i + 5);
      rows.push(
        <div key={i} className="flex justify-center items-center gap-2 mb-2">
          <div className="text-xs text-muted-foreground w-8">
            {Math.floor(i / 5) + 1}
          </div>
          {/* 3 seats on left */}
          <div className="flex gap-1">
            {rowSeats.slice(0, 3).map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="sm"
                className={`h-10 w-10 text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                onClick={() => onSeatClick(seat.seat_number)}
                disabled={!seat.is_available}
              >
                💺
              </Button>
            ))}
          </div>
          {/* Aisle */}
          <div className="w-6"></div>
          {/* 2 seats on right */}
          <div className="flex gap-1">
            {rowSeats.slice(3, 5).map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="sm"
                className={`h-10 w-10 text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                onClick={() => onSeatClick(seat.seat_number)}
                disabled={!seat.is_available}
              >
                💺
              </Button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <h4 className="text-sm font-medium mb-3 text-center bg-purple-100 rounded px-2 py-1">
          🚌 Chair Car - 3x2 Seating
        </h4>
        {rows}
        <div className="text-xs text-center text-muted-foreground mt-2">
          Window | Middle | Aisle | | Aisle | Window
        </div>
      </div>
    );
  };

  // Executive Chair Car (EC) - 2x2 seating (wider)
  const renderExecutiveChairCar = () => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      const rowSeats = seats.slice(i, i + 4);
      rows.push(
        <div key={i} className="flex justify-center items-center gap-4 mb-3">
          <div className="text-xs text-muted-foreground w-8">
            {Math.floor(i / 4) + 1}
          </div>
          {/* 2 seats on left */}
          <div className="flex gap-2">
            {rowSeats.slice(0, 2).map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="lg"
                className={`h-12 w-16 text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                onClick={() => onSeatClick(seat.seat_number)}
                disabled={!seat.is_available}
              >
                <div className="flex flex-col items-center">
                  <span>🛋️</span>
                  <span className="text-xs">{seat.seat_number}</span>
                </div>
              </Button>
            ))}
          </div>
          {/* Wide Aisle */}
          <div className="w-8"></div>
          {/* 2 seats on right */}
          <div className="flex gap-2">
            {rowSeats.slice(2, 4).map((seat) => (
              <Button
                key={seat.id}
                variant="outline"
                size="lg"
                className={`h-12 w-16 text-xs transition-all border-2 ${getSeatColor(getSeatStatus(seat))}`}
                onClick={() => onSeatClick(seat.seat_number)}
                disabled={!seat.is_available}
              >
                <div className="flex flex-col items-center">
                  <span>🛋️</span>
                  <span className="text-xs">{seat.seat_number}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
        <h4 className="text-sm font-medium mb-3 text-center bg-indigo-100 rounded px-2 py-1">
          👑 Executive Chair Car - Premium 2x2 Seating
        </h4>
        {rows}
        <div className="text-xs text-center text-muted-foreground mt-2">
          Window | Aisle | | Aisle | Window
        </div>
      </div>
    );
  };

  // AC Three-Tier Economy (3E) - More congested
  const renderThreeTierEconomy = () => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 10) {
      const rowSeats = seats.slice(i, i + 10);
      rows.push(
        <div key={i} className="grid grid-cols-10 gap-1 mb-2">
          {rowSeats.map((seat) => (
            <Button
              key={seat.id}
              variant="outline"
              size="sm"
              className={`h-8 w-8 text-xs transition-all border ${getSeatColor(getSeatStatus(seat))}`}
              onClick={() => onSeatClick(seat.seat_number)}
              disabled={!seat.is_available}
            >
              <span className="text-xs">{seat.seat_number.slice(-2)}</span>
            </Button>
          ))}
        </div>
      );
    }
    return (
      <div className="border-2 border-red-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <h4 className="text-sm font-medium mb-3 text-center bg-red-100 rounded px-2 py-1">
          🚄 AC 3-Tier Economy - High Density Seating
        </h4>
        {rows}
        <div className="text-xs text-center text-muted-foreground mt-2">
          More seats, compact layout
        </div>
      </div>
    );
  };

  // Second Sitting (2S) - General unreserved
  const renderSecondSitting = () => {
    return (
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-slate-50">
        <h4 className="text-sm font-medium mb-3 text-center bg-gray-100 rounded px-2 py-1">
          🚊 Second Sitting - General/Unreserved
        </h4>
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            This is unreserved general seating. Passengers can sit anywhere available.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            General Admission - No Seat Reservation Required
          </Badge>
        </div>
      </div>
    );
  };

  // Render based on selected class
  switch (selectedClass) {
    case 'AC 1 Tier':
      return <div className="space-y-4">{renderFirstClass()}</div>;
    case 'AC 2 Tier':
      return <div className="space-y-4">{renderTwoTier()}</div>;
    case 'AC 3 Tier':
    case 'Sleeper':
      return <div className="space-y-4">{renderThreeTier()}</div>;
    case 'AC 3 Tier Economy':
      return <div className="space-y-4">{renderThreeTierEconomy()}</div>;
    case 'Chair Car':
      return renderChairCar();
    case 'Executive Chair Car':
      return renderExecutiveChairCar();
    case 'Second Sitting':
      return renderSecondSitting();
    default:
      return <div className="space-y-4">{renderThreeTier()}</div>;
  }
};

export default ClassSpecificSeatLayouts;