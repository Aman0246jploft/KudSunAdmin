import React, { useEffect, useState } from "react";
import Image from "../../Component/Atoms/Image/Image"

export default function ChatRoomList({ chatRooms, setActiveRoom, activeRoom ,socket}) {

  return (
    <div className="w-1/3 border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {chatRooms.map((room) => {
        const other = room.participants?.[0];
        return (
          <div
            key={room._id}
            onClick={() => setActiveRoom(room)}
            className={`cursor-pointer p-3 rounded-md ${
              activeRoom?._id === room._id ? "bg-blue-100" : "hover:bg-gray-100"
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
              <div>
                <p className="font-medium">{other?.userName}</p>
                <p className="text-sm text-gray-500 truncate">
                  {room.lastMessage?.content || "No messages"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
