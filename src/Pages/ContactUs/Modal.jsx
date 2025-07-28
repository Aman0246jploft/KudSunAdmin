import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, children, size = "default" }) {
  const { theme } = useTheme();
  const modalRef = useRef();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    function handleEscapeKey(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dynamic sizing based on size prop
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-[90vw] max-w-sm sm:max-w-md";
      case "large":
        return "w-[95vw] max-w-2xl sm:max-w-3xl lg:max-w-4xl";
      case "full":
        return "w-[95vw] max-w-6xl";
      default:
        return "w-[90vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition-opacity duration-200 animate-fadeIn px-2 sm:px-4"
      style={{}}
    >
      <div
        ref={modalRef}
        className={`relative ${getSizeClasses()} p-0 rounded-xl shadow-2xl overflow-hidden animate-scaleIn`}
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
          maxHeight: "90vh",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/10   duration-200"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>

        {/* Scrollable content area */}
        <div
          className="overflow-y-auto max-h-[90vh] custom-scrollbar"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.colors.border} transparent`,
          }}
        >
          <div
            className="border-0 sm:border rounded-none sm:rounded"
            style={{ borderColor: theme.colors.border }}
          >
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .animate-fadeIn { 
          animation: fadeIn 0.2s ease-out; 
        }
        
        @keyframes scaleIn { 
          from { 
            transform: scale(0.95) translateY(10px); 
            opacity: 0; 
          } 
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          } 
        }
        .animate-scaleIn { 
          animation: scaleIn 0.2s ease-out; 
        }

        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.colors.border};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.textSecondary || theme.colors.border};
        }

        /* Mobile scrollbar handling */
        @media (max-width: 640px) {
          .custom-scrollbar {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}