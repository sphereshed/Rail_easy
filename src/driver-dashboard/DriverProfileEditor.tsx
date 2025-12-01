import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DriverProfile {
  id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
  vehicle_number: string;
  vehicle_type: string;
  is_available: boolean;
}

interface DriverProfileEditorProps {
  onSuccess?: () => void;
}

export const DriverProfileEditor = ({ onSuccess }: DriverProfileEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DriverProfile>({
    id: user?.id || '',
    full_name: user?.user_metadata?.full_name || '',
    phone_number: '',
    license_number: '',
    vehicle_number: '',
    vehicle_type: '',
    is_available: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading driver profile:', error);
        return;
      }

      if (data) {
        setProfile(prev => ({ ...prev, ...data }));
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('drivers')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully!"
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Full Name</Label>
          <Input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            className="mt-2 h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone_number" className="text-sm font-semibold text-gray-700">Phone Number</Label>
          <Input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={profile.phone_number}
            onChange={handleChange}
            className="mt-2 h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="license_number" className="text-sm font-semibold text-gray-700">License Number</Label>
          <Input
            type="text"
            id="license_number"
            name="license_number"
            value={profile.license_number}
            onChange={handleChange}
            className="mt-2 h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="vehicle_number" className="text-sm font-semibold text-gray-700">Vehicle Number</Label>
          <Input
            type="text"
            id="vehicle_number"
            name="vehicle_number"
            value={profile.vehicle_number}
            onChange={handleChange}
            className="mt-2 h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="vehicle_type" className="text-sm font-semibold text-gray-700">Vehicle Type</Label>
          <select
            id="vehicle_type"
            name="vehicle_type"
            value={profile.vehicle_type}
            onChange={(e) => setProfile(prev => ({ ...prev, vehicle_type: e.target.value }))}
            className="mt-2 h-12 px-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 w-full"
            required
          >
            <option value="">Select vehicle type</option>
            <option value="Bike/Scooter">Bike/Scooter</option>
            <option value="Auto/Rickshaw">Auto/Rickshaw</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <Checkbox
            id="is_available"
            name="is_available"
            checked={profile.is_available}
            onCheckedChange={(checked) => 
              setProfile(prev => ({...prev, is_available: checked as boolean}))
            }
          />
          <Label htmlFor="is_available" className="ml-3 text-sm font-medium text-gray-700">Available for Rides</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default DriverProfileEditor;