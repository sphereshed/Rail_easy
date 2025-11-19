import React from "react";

const rides = [
  { id: 1, fare: 250, rating: 5, date: "Sep 26" },
  { id: 2, fare: 180, rating: 4, date: "Sep 25" },
];

const EarningsDashboard = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
      {/* Summary Card */}
      <div className="bg-blue-600 text-white rounded-2xl shadow p-6 flex justify-between items-center">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">₹1,200</span>
          <span className="text-xs">Today</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">₹7,800</span>
          <span className="text-xs">This Week</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">₹32,000</span>
          <span className="text-xs">Monthly</span>
        </div>
      </div>
      {/* Completed Rides List */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="font-semibold mb-2">Completed Rides</div>
        <div className="flex flex-col gap-2">
          {rides.map((ride) => (
            <div key={ride.id} className="flex items-center justify-between">
              <span className="text-gray-700">{ride.date}</span>
              <span className="font-bold">₹{ride.fare}</span>
              <span className="text-yellow-500 flex items-center gap-1">
                <span className="material-icons text-base">star</span> {ride.rating}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Weekly Rides Bar Graph (Placeholder) */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="font-semibold mb-2">Weekly Rides</div>
        <div className="flex items-end gap-2 h-24">
          <div className="bg-blue-500 rounded w-6" style={{ height: '60%' }}></div>
          <div className="bg-blue-400 rounded w-6" style={{ height: '80%' }}></div>
          <div className="bg-blue-300 rounded w-6" style={{ height: '40%' }}></div>
          <div className="bg-blue-500 rounded w-6" style={{ height: '90%' }}></div>
          <div className="bg-blue-400 rounded w-6" style={{ height: '70%' }}></div>
          <div className="bg-blue-300 rounded w-6" style={{ height: '50%' }}></div>
          <div className="bg-blue-500 rounded w-6" style={{ height: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default EarningsDashboard;
