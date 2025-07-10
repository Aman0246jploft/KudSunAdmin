import React, { useEffect, useState } from "react";
import Image from "../../Component/Atoms/Image/Image"

export default function ChatRoomList({ chatRooms, setActiveRoom, activeRoom, socket }) {
  // Function to format the last message based on type
  const getFormattedLastMessage = (message) => {
    if (!message) return "No messages";

    switch (message.messageType) {
      case 'IMAGE':
        return "📷 Sent an image";
      case 'VIDEO':
        return "🎥 Sent a video";
      case 'AUDIO':
        return "🎵 Sent an audio";
      case 'FILE':
        return `📎 Sent a file${message.fileName ? `: ${message.fileName}` : ''}`;
      case 'PRODUCT':
        return "🛍️ Shared a product";
      case 'SYSTEM':
      case 'ORDER_STATUS':
      case 'PAYMENT_STATUS':
      case 'SHIPPING_STATUS':
        return message.content || "System notification";
      default:
        return message.content || "No messages";
    }
  };

  return (
    <div className="w-1/3 border-r p-4  overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {chatRooms.map((room) => {
        const other = room.participants?.[0];
        return (
          <div
            key={room._id}
            onClick={() => setActiveRoom(room)}
            className={`cursor-pointer p-3 rounded-md ${activeRoom?._id === room._id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <Image
                  src={other?.profileImage}
                  className="w-8 h-8 rounded-full"
                />
                {other?.isLive && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="w-[300px]  "> {/* Limits width to 24rem */}
                <p className="font-medium">{other?.userName}</p>
                <p className="text-sm text-gray-500 truncate overflow-hidden whitespace-nowrap">
                  {getFormattedLastMessage(room.lastMessage)}
                </p>
              </div>

              {room.unreadCount > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {room.unreadCount}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
