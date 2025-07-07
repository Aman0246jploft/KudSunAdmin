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
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition-opacity duration-200 animate-fadeIn"
      style={{}}
    >
      <div
        ref={modalRef}
        className="relative w-[90vw] max-w-md sm:max-w-lg p-4 sm:p-6 rounded-xl shadow-lg bg-white dark:bg-gray-900 overflow-y-auto max-h-[90vh] animate-scaleIn"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <FiX size={22} />
        </button>
        <div
          className="border rounded"
          style={{ borderColor: theme.colors.border }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scaleIn { animation: scaleIn 0.2s; }
      `}</style>
    </div>
  );
}
