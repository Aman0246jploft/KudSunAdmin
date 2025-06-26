import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatRoomList from "./ChatRoomList";
import ChatWindow from "./ChatWindow";
import { socketURL } from "../../api/baseUrl";
import { useAuth } from "../../auth/useAuth";

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
      console.log("✅ Received chatRoomsList:", data);
      setChatRooms(data.chatRooms);
    });

    socket.on("chatRooms", (rooms) => {
      setChatRooms(rooms);
    });

    socket.on("newChatRoom", (room) => {
      setChatRooms((prev) => [room, ...prev]);
    });

    socket.on("roomUpdated", (updatedRoom) => {
      console.log("updatedRoom000", updatedRoom);
      setChatRooms((prev) => {
        const filtered = prev.filter((r) => r._id !== updatedRoom._id);
        return [updatedRoom, ...filtered];
      });
    });

    socket.on("newMessage", (handleNewMessage) => {
      console.log("handleNewMessage", handleNewMessage);
    });

    return () => {
      socket.off("chatRooms");
      socket.off("newChatRoom");
      socket.off("roomUpdated");
    };
  }, []);

  useEffect(() => {
    if (activeRoom?._id) {
      socket.emit("joinRoom", activeRoom._id);
      console.log(`Joining room ${activeRoom._id}`);
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
