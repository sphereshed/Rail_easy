import React from "react";

const notifications = [
  { id: 1, message: "Pickup in 30 minutes", icon: "alarm", time: "10:00 AM" },
  { id: 2, message: "Passenger’s train delayed", icon: "train", time: "9:45 AM" },
  { id: 3, message: "Bonus earned for 5-star rating", icon: "star", time: "Yesterday" },
];

const NotificationsScreen = () => {
  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      {notifications.map((n) => (
        <div key={n.id} className="bg-white rounded-2xl shadow flex items-center p-4 gap-4">
          <span className="material-icons text-blue-600 text-2xl">{n.icon}</span>
          <div className="flex-1">
            <div className="font-medium text-gray-800">{n.message}</div>
            <div className="text-xs text-gray-400">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsScreen;
