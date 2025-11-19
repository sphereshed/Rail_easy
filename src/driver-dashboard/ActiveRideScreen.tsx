import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ActiveRide {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  passenger_name?: string;
  booking_id: string;
}

const ActiveRideScreen = () => {
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveRide = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          bookings:booking_id (
            passenger_name
          )
        `)
        .eq('driver_id', user?.id)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active ride:', error);
        return;
      }

      setActiveRide(data);
    };

    fetchActiveRide();

    const channel = supabase
      .channel('active_ride_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `driver_id=eq.${user?.id}`
      }, () => {
        fetchActiveRide();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!activeRide) return;

    const { error } = await supabase
      .from('rides')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeRide.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update ride status. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Ride status updated to ${newStatus}`
    });
  };

  if (!activeRide) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg p-4">
        <p className="text-center text-gray-500">No active ride</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">{activeRide.passenger_name}</div>
        <div className="text-gray-400 text-sm">Ride ID: {activeRide.booking_id}</div>
      </div>
      {/* Map View */}
      <div className="flex-1 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-gray-400">[Map View]</span>
      </div>
      {/* Status Tracker */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center">
          <span className="material-icons text-blue-600">directions_car</span>
          <span className="text-xs font-medium text-blue-600">On the Way</span>
        </div>
        <div className="flex-1 h-1 bg-blue-200 mx-2 rounded" />
        <div className="flex flex-col items-center">
          <span className="material-icons text-blue-400">person</span>
          <span className="text-xs font-medium text-blue-400">Picked Up</span>
        </div>
        <div className="flex-1 h-1 bg-blue-100 mx-2 rounded" />
        <div className="flex flex-col items-center">
          <span className="material-icons text-gray-400">flag</span>
          <span className="text-xs font-medium text-gray-400">Dropped</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 mt-auto">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-lg shadow transition flex items-center justify-center gap-2">
          <span className="material-icons">call</span> Call Passenger
        </button>
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-lg shadow transition">Mark Ride as Completed</button>
      </div>
    </div>
  );
};

export default ActiveRideScreen;
