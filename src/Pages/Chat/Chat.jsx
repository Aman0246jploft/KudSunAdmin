import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatRoomList from "./ChatRoomList";
import ChatWindow from "./ChatWindow";
import { socketURL } from "../../api/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { toast } from 'react-toastify';
import { IoMenuOutline, IoClose } from "react-icons/io5";

const socket = io(socketURL, {
  auth: {
    token: useAuth()?.user, // adjust token logic
  },
  transports: ["websocket"], // force websocket transport
  reconnectionAttempts: 5,
});

export default function Chat() {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [roomUpdateTimeouts, setRoomUpdateTimeouts] = useState({});

  useEffect(() => {
    socket.emit("getChatRooms", {});

    socket.on("chatRoomsList", (data) => {
      setChatRooms(data.chatRooms);
    });

    socket.on("chatRooms", (rooms) => {
      setChatRooms(rooms);
    });

    socket.on("newChatRoom", (room) => {
      setChatRooms((prev) => [room, ...prev]);
    });

    // Handle new messages - only update active room, not the room list
    socket.on("newMessage", (message) => {
      // Only update the active room if this message belongs to it
      // The room list will be updated by the 'roomUpdated' event to avoid conflicts
      if (activeRoom?._id === message.chatRoom) {
        setActiveRoom((prev) => ({
          ...prev,
          lastMessage: message,
          updatedAt: new Date().toISOString()
        }));
      }
    });

    socket.on("roomUpdated", (updatedRoom) => {
      // Debounce room updates to prevent flickering from rapid events
      const roomId = updatedRoom._id;
      
      // Clear any existing timeout for this room
      if (roomUpdateTimeouts[roomId]) {
        clearTimeout(roomUpdateTimeouts[roomId]);
      }
      
      // Set a new timeout to update the room
      const timeoutId = setTimeout(() => {
        setChatRooms((prev) => {
          const filtered = prev.filter((r) => r._id !== updatedRoom._id);
          return [updatedRoom, ...filtered];
        });
        
        // Update active room if it's the one that got updated
        if (activeRoom?._id === updatedRoom._id) {
          setActiveRoom(updatedRoom);
        }
        
        // Clean up the timeout
        setRoomUpdateTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[roomId];
          return newTimeouts;
        });
      }, 100); // 100ms debounce delay
      
      // Store the timeout
      setRoomUpdateTimeouts(prev => ({
        ...prev,
        [roomId]: timeoutId
      }));
    });

    // Add listener for system notifications
    socket.on("systemNotification", (notification) => {
      let title = '';
      let message = '';

      // Handle different types of system notifications
      if (notification.type === 'ORDER_STATUS') {
        title = notification.meta.title || 'Order Update';
        message = `Order #${notification.meta.meta.orderNumber} - ${notification.meta.status}`;
      } else if (notification.type === 'PAYMENT_STATUS') {
        title = notification.meta.title;
        message = notification.meta.status === 'COMPLETED' 
          ? `Payment completed for Order #${notification.meta.meta.orderNumber}`
          : `Payment failed for Order #${notification.meta.meta.orderNumber}`;
      }

      // Show toast notification
      toast.info(
        <div>
          <h4 className="font-medium">{title}</h4>
          <p>{message}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    });

    return () => {
      socket.off("chatRooms");
      socket.off("newChatRoom");
      socket.off("roomUpdated");
      socket.off("newMessage");
      socket.off("systemNotification");
      
      // Clean up any pending timeouts
      Object.values(roomUpdateTimeouts).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
      }, [activeRoom, roomUpdateTimeouts]); // Added activeRoom and roomUpdateTimeouts to dependencies

  useEffect(() => {
    if (activeRoom?._id) {
      socket.emit("joinRoom", activeRoom._id);
    }
  }, [activeRoom]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    // Auto-hide sidebar on mobile when room is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex h-[85dvh]  w-full overflow-hidden bg-red-50">
      {/* Mobile overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat room list - responsive sidebar */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        fixed md:static 
        top-0 left-0 
        w-80 md:w-80 lg:w-96 
        h-full 
        border-r border-gray-200 
        bg-white
        z-50 md:z-auto
        transition-transform duration-300 ease-in-out
        shadow-xl md:shadow-none
        overflow-hidden
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <ChatRoomList
          chatRooms={chatRooms}
          setActiveRoom={handleRoomSelect}
          activeRoom={activeRoom}
          socket={socket}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full ">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoMenuOutline className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 truncate" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
            {activeRoom ? activeRoom.participants[0]?.userName : 'Chat'}
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Chat window */}
        <div className="flex-1 h-full overflow-hidden">
          <ChatWindow room={activeRoom} socket={socket} />
        </div>
      </div>
    </div>
  );
}
