export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          full_name: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          email: string;
          password: string;
          full_name: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          email?: string;
          password?: string;
          full_name?: string;
          created_at?: string;
        }
        Relationships: []
      },
      drivers: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          license_number: string | null
          vehicle_number: string | null
          vehicle_type: string | null
          rating: number
          total_rides: number
          total_earnings: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string | null
          license_number?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          rating?: number
          total_rides?: number
          total_earnings?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string | null
          license_number?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          rating?: number
          total_rides?: number
          total_earnings?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          driver_id: string
          passenger_id: string
          booking_id: string
          pickup_location: string
          dropoff_location: string
          pickup_time: string
          status: 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled'
          fare: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          passenger_id: string
          booking_id: string
          pickup_location: string
          dropoff_location: string
          pickup_time: string
          status?: 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled'
          fare: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          passenger_id?: string
          booking_id?: string
          pickup_location?: string
          dropoff_location?: string
          pickup_time?: string
          status?: 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled'
          fare?: number
          created_at?: string
          updated_at?: string
        }
      }
      cab_bookings: {
        Row: {
          id: string
          booking_id: string | null
          user_id: string
          pickup_address: string
          drop_address: string
          pickup_time: string
          passengers: number
          luggage: number
          cab_type: 'sedan' | 'suv' | 'luxury' | 'hatchback'
          cab_price: number
          special_instructions: string | null
          driver_id: string | null
          status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          user_id: string
          pickup_address: string
          drop_address: string
          pickup_time: string
          passengers?: number
          luggage?: number
          cab_type: 'sedan' | 'suv' | 'luxury' | 'hatchback'
          cab_price?: number
          special_instructions?: string | null
          driver_id?: string | null
          status?: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          user_id?: string
          pickup_address?: string
          drop_address?: string
          pickup_time?: string
          passengers?: number
          luggage?: number
          cab_type?: 'sedan' | 'suv' | 'luxury' | 'hatchback'
          cab_price?: number
          special_instructions?: string | null
          driver_id?: string | null
          status?: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}