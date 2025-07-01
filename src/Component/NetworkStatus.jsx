import React, { useEffect, useState } from "react";
import { baseURL } from "../api/baseUrl";

function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isBackendDown, setIsBackendDown] = useState(false);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${baseURL}/ping`, {
        method: "GET",
        cache: "no-cache",
      });

      if (!res.ok) throw new Error("Bad response");
      setIsBackendDown(false);
    } catch (err) {
      setIsBackendDown(true);
    }
  };

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Start ping loop
    checkBackend();
    const interval = setInterval(checkBackend, 10000); // every 10s

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && !isBackendDown) return null;

  return (
    <div className="w-full bg-red-600 text-white text-center py-2 fixed top-0 z-[1000]">
      ⚠️ {isOffline
        ? "Network connection lost. You are offline."
        : "Unable to connect to the server. Some features may not work."}
    </div>
  );
}

export default NetworkStatus;
