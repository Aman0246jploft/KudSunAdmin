import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, children }) {
  const { theme } = useTheme();
  const modalRef = useRef();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="relative w-[90vw] max-w-md sm:max-w-lg p-6 rounded-xl shadow-2xl bg-white dark:bg-gray-900 overflow-y-auto max-h-[90vh] animate-scaleIn"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        {/* Modal content container with some padding */}
        <div id="modal-description" className="mt-2">
          {children}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease forwards; }

        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scaleIn { animation: scaleIn 0.2s ease forwards; }
      `}</style>
    </div>
  );
}
