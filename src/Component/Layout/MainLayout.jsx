import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { useTheme } from "../../contexts/theme/hook/useTheme";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start with closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Set initial sidebar state based on screen size
      if (mobile) {
        setIsSidebarOpen(false); // Always closed on mobile initially
      } else {
        setIsSidebarOpen(true); // Always open on desktop initially
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []); // Remove isSidebarOpen from dependency array to prevent loops

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Sidebar */} 
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          // On mobile: no margin (sidebar overlays)
          // On desktop: apply margin based on sidebar state
          isMobile 
            ? "ml-0" 
            : isSidebarOpen 
              ? "ml-64" 
              : "ml-16"
        }`}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Page Content */}
        <main
          className="flex-1 p-4 md:px-4 overflow-auto "
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;