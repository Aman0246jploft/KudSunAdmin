import React, { useMemo } from "react";
import Image from "../../Component/Atoms/Image/Image"
import { formatDistanceToNow } from 'date-fns';

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

  // Memoized sorted rooms for consistent ordering
  const sortedRooms = useMemo(() => {
    return [...chatRooms].sort((a, b) => {
      // Primary sort: by last message timestamp (most recent first)
      const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt || 0);
      const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt || 0);
      
      if (aTime.getTime() !== bTime.getTime()) {
        return bTime.getTime() - aTime.getTime(); // Newest first
      }
      
      // Secondary sort: by room ID for stable sort
      return a._id.localeCompare(b._id);
    });
  }, [chatRooms]);

  // Memoized room data to prevent unnecessary re-calculations
  const roomsWithData = useMemo(() => {
    return sortedRooms.map(room => {
      const other = room.participants?.[0];
      const lastMessageTime = room.lastMessage?.createdAt 
        ? formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })
        : '';
      
      return {
        ...room,
        other,
        lastMessageTime,
        formattedLastMessage: getFormattedLastMessage(room.lastMessage)
      };
    });
  }, [sortedRooms]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="hidden md:block p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {roomsWithData.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-4">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {roomsWithData.map((roomData) => {
              return (
                <div
                  key={`room-${roomData._id}`}
                  onClick={() => setActiveRoom(roomData)}
                  className={`
                    flex items-center 
                    p-3 rounded-xl 
                    transition-all duration-200 ease-in-out
                    cursor-pointer
                    hover:bg-gray-50
                    ${activeRoom?._id === roomData._id ? "bg-blue-50 border-blue-100 border" : "border-transparent"}
                    ${roomData.unreadCount > 0 ? "bg-blue-50/50" : ""}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={roomData.other?.profileImage}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    />
                    {roomData.other?.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                        {roomData.other?.userName || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {roomData.lastMessageTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className="text-xs text-gray-500 truncate flex-1" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                        {roomData.formattedLastMessage}
                      </p>
                      {roomData.unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs font-medium rounded-full px-2 py-1 min-w-[18px] h-5 flex items-center justify-center flex-shrink-0">
                          {roomData.unreadCount > 99 ? '99+' : roomData.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
