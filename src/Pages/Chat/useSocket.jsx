// useSocket.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../../auth/useAuth";
import { socketURL } from "../../api/baseUrl";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || socketRef.current) return;

    const socket = io(socketURL, {
      auth: { token: user },
    });
    console.log("1111111", socket);

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });


    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socketRef.current;
};
