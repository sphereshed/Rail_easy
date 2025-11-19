
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import RideRequestPopup from "./RideRequestPopup";
import ActiveRideScreen from "./ActiveRideScreen";
import UpcomingRidesScreen from "./UpcomingRidesScreen";
import EarningsDashboard from "./EarningsDashboard";
import NotificationsScreen from "./NotificationsScreen";
import DriverProfileEditor from "./DriverProfileEditor";

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");

  // Check for driver role in user metadata
  const isDriver = user?.user_metadata?.role === "driver";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (!isDriver) {
      navigate("/");
    }
  }, [user, isDriver, navigate]);

  if (!user || !isDriver) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <DriverProfileEditor />;
      case "active":
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Active Ride</h2>
            <ActiveRideScreen />
          </>
        );
      case "requests":
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Ride Requests</h2>
            <RideRequestPopup />
          </>
        );
      case "upcoming":
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Upcoming Rides</h2>
            <UpcomingRidesScreen />
          </>
        );
      case "earnings":
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Earnings</h2>
            <EarningsDashboard />
          </>
        );
      default:
        return <DriverProfileEditor />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveSection("profile")}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeSection === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection("active")}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeSection === "active"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Active Ride
              </button>
              <button
                onClick={() => setActiveSection("requests")}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeSection === "requests"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Ride Requests
              </button>
              <button
                onClick={() => setActiveSection("upcoming")}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeSection === "upcoming"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Upcoming Rides
              </button>
              <button
                onClick={() => setActiveSection("earnings")}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeSection === "earnings"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Earnings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{renderSection()}</div>
      </main>
    </div>
  );
};

export default DriverDashboard;
