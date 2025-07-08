import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatRoomList from "./ChatRoomList";
import ChatWindow from "./ChatWindow";
import { socketURL } from "../../api/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { toast } from 'react-toastify';

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

    // Handle new messages including system messages
    socket.on("newMessage", (message) => {
      // Update chat rooms to reflect the new message
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room._id === message.chatRoom) {
            // For system messages, update the room's last message immediately
            if (message.messageType === 'SYSTEM' || 
                message.messageType === 'ORDER_STATUS' || 
                message.messageType === 'PAYMENT_STATUS' || 
                message.messageType === 'SHIPPING_STATUS') {
              return {
                ...room,
                lastMessage: message,
                updatedAt: new Date().toISOString()
              };
            }
            return {
              ...room,
              lastMessage: message
            };
          }
          return room;
        });
      });

      // If this is the active room, update it as well
      if (activeRoom?._id === message.chatRoom) {
        setActiveRoom((prev) => ({
          ...prev,
          lastMessage: message,
          updatedAt: new Date().toISOString()
        }));
      }
    });

    socket.on("roomUpdated", (updatedRoom) => {
      setChatRooms((prev) => {
        const filtered = prev.filter((r) => r._id !== updatedRoom._id);
        return [updatedRoom, ...filtered];
      });
      
      // Update active room if it's the one that got updated
      if (activeRoom?._id === updatedRoom._id) {
        setActiveRoom(updatedRoom);
      }
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
    };
  }, [activeRoom]); // Added activeRoom to dependencies

  useEffect(() => {
    if (activeRoom?._id) {
      socket.emit("joinRoom", activeRoom._id);
    }
  }, [activeRoom]);

  return (
    <div className="flex h-full overflow-hidden">
      <ChatRoomList
        chatRooms={chatRooms}
        setActiveRoom={setActiveRoom}
        activeRoom={activeRoom}
        socket={socket}
      />
      <ChatWindow room={activeRoom} socket={socket} />
    </div>
  );
}
