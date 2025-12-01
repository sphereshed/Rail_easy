import React, { useState } from "react";
import { MapPin, User, Clock, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RideRequestPopupProps {
  rideRequest: {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    passenger_count: number;
    vehicle_preference?: string;
    created_at: string;
    passenger_id: string;
  };
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const RideRequestPopup = ({ rideRequest, onAccept, onReject, onClose }: RideRequestPopupProps) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept();
    setAccepting(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    await onReject();
    setRejecting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Ride Request</h2>

          {/* Map Preview */}
          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Map Preview</p>
            </div>
          </div>

          {/* Ride Details */}
          <div className="space-y-4 mb-6">
            {/* Pickup Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">PICKUP</p>
                <p className="text-gray-900 font-semibold">{rideRequest.pickup_location}</p>
              </div>
            </div>

            {/* Dropoff Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">DROPOFF</p>
                <p className="text-gray-900 font-semibold">{rideRequest.dropoff_location}</p>
              </div>
            </div>

            {/* Passenger Count */}
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">PASSENGERS</p>
                <p className="text-gray-900 font-semibold">{rideRequest.passenger_count} passenger{rideRequest.passenger_count > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Vehicle Preference */}
            {rideRequest.vehicle_preference && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-purple-600">🚗</div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">VEHICLE TYPE</p>
                  <p className="text-gray-900 font-semibold">{rideRequest.vehicle_preference}</p>
                </div>
              </div>
            )}

            {/* Time */}
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">REQUESTED</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(rideRequest.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleReject}
              disabled={rejecting || accepting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 h-auto"
            >
              {rejecting ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={handleAccept}
              disabled={accepting || rejecting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 h-auto"
            >
              {accepting ? 'Accepting...' : 'Accept Ride'}
            </Button>
          </div>

          {/* Info Message */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Accepting this ride will start a new active ride session
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideRequestPopup;
