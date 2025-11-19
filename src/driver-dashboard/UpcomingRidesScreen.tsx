import React from "react";

const rides = [
  { id: 1, name: "Alice", pickup: "Station A", drop: "Hotel X", time: "11:00 AM", countdown: "15m" },
  { id: 2, name: "Bob", pickup: "Station B", drop: "Mall Y", time: "12:30 PM", countdown: "1h 45m" },
];

const UpcomingRidesScreen = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold">Today</button>
        <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold">This Week</button>
        <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold">All</button>
      </div>
      {/* Ride Cards */}
      <div className="flex flex-col gap-4">
        {rides.map((ride) => (
          <div key={ride.id} className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{ride.name}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{ride.countdown}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="material-icons text-blue-600">place</span>
              <span>{ride.pickup}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="material-icons text-green-600">flag</span>
              <span>{ride.drop}</span>
            </div>
            <div className="text-xs text-gray-400">Pickup at {ride.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingRidesScreen;
